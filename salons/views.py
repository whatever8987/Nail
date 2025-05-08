# Standard Django Imports
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import F

# Django REST Framework Imports
from rest_framework import viewsets, permissions, status
# Import filters
from rest_framework import filters # <<< Import filters here
from rest_framework.decorators import action
from rest_framework.response import Response

# DRF Spectacular Imports (for API documentation)
from drf_spectacular.utils import (
    extend_schema, OpenApiParameter, OpenApiExample, OpenApiTypes, OpenApiResponse
)

# Local app Imports (Models and Serializers)
from .models import Template, Salon
from .serializers import TemplateSerializer, SalonSerializer

# Core app Imports (assuming these exist)
from core.models import Stats
from core.permissions import IsOwnerOrAdmin, IsOwnerOrAdminOrReadOnly
from core.serializers import ErrorSerializer

# --- Constants for Sample Data ---
SAMPLE_SERVICES = [
  "Classic Manicure - $35",
  "Gel Pedicure - $45",
  "Nail Extensions - $60",
  "Nail Art - $20"
]
SAMPLE_OPENING_HOURS = "Monday - Friday: 9:00 AM - 7:00 PM\nSaturday: 9:00 AM - 6:00 PM\nSunday: Closed"
# -----------------------------------

# --- Function-Based View for Template Preview ---
# This uses standard Django's JsonResponse
# (Keep this function as it is not part of the ViewSet)
def template_preview_view(request, id):
    """
    API endpoint to generate a sample salon preview based on a template.
    Corresponds to GET /api/templates/:id/preview
    """
    if request.method != 'GET':
         return JsonResponse({"message": "Method not allowed"}, status=405)

    try:
        template = get_object_or_404(Template, pk=id)

        sample_salon_data = {
            "id": 999,
            "name": "Sample Salon",
            "address": "123 Main Street",
            "location": "Sample City",
            "email": "contact@samplesalon.com",
            "phoneNumber": "(555) 123-4567",
            "description": f"This is a preview of your salon website using the {template.name} template.",
            "services": SAMPLE_SERVICES,
            "openingHours": SAMPLE_OPENING_HOURS,
            "sampleUrl": f"sample-salon-{template.id}",
            "ownerId": None,
            "templateId": template.id,
            "claimed": False,
            "claimedAt": None,
            "contactStatus": "notContacted"
        }

        return JsonResponse(sample_salon_data, status=200)

    except Exception as e:
        print(f"An error occurred in template_preview_view: {e}")
        return JsonResponse({"message": "Error generating template preview"}, status=500)


# --- Django REST Framework ViewSets ---

class TemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows Templates to be viewed (Read-only).
    """
    queryset = Template.objects.all().order_by('name')
    serializer_class = TemplateSerializer
    permission_classes = [permissions.AllowAny]

    # Keep list and retrieve methods with extend_schema if you need custom docs
    @extend_schema(tags=['Templates'], summary="List all templates", description="Returns a paginated list of all available salon templates.", responses={200: TemplateSerializer(many=True)})
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(tags=['Templates'], summary="Retrieve template details", description="Returns detailed information about a specific template.", responses={200: TemplateSerializer, 404: OpenApiResponse(ErrorSerializer, description="Template not found")})
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)


class SalonViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Salons with custom actions.
    Supports filtering, searching, claiming, etc.
    """
    queryset = Salon.objects.select_related('owner', 'template').all().order_by('name')
    serializer_class = SalonSerializer
    lookup_field = 'pk'

    # --- Add Filter Backends including SearchFilter ---
    # Order can matter if you have multiple filters. SearchFilter is usually first or second.
    filter_backends = [filters.SearchFilter, filters.OrderingFilter] # Added OrderingFilter as well (standard with search)

    # --- Configure fields to search on ---
    # Search will be applied to these fields using __icontains (case-insensitive contains)
    # Specify the model fields you want to be searchable via the ?search= query parameter
    search_fields = ['name', 'location', 'description'] # <<< Add fields to search on

    # Optional: Add fields for OrderingFilter if you want to allow ?ordering=name,-location etc.
    # ordering_fields = ['name', 'location', 'created_at']


    def get_queryset(self):
        # The base queryset is defined at the class level.
        # Filters (including SearchFilter) are applied automatically *after* get_queryset.
        # You only need to override get_queryset if you need custom *default* filtering
        # or filtering logic that SearchFilter/other built-in filters can't handle.

        queryset = super().get_queryset()

        # Keep your location filtering if you need it *in addition* to the general search
        # Note: SearchFilter applies to `search_fields` using the `search` parameter.
        # If you want a specific `location` parameter *only*, you need to handle it manually
        # here or use a different filter backend like DjangoFilterBackend.
        # Since the frontend is sending `search`, let's remove the manual location filter
        # and rely on SearchFilter hitting the 'location' field via the 'search' parameter.
        # If you need both `?location=city` and `?search=term`, you'd keep this and configure
        # DjangoFilterBackend for `location`.
        # For now, let's remove the explicit location filter as the frontend only sends `search`.
        # location_param = self.request.query_params.get('location')
        # if location_param:
        #     queryset = queryset.filter(location__icontains=location_param)

        # Example: Add a filter for 'claimed' status if needed, as SearchFilter doesn't handle booleans
        claimed_param = self.request.query_params.get('claimed', None)
        if claimed_param is not None:
             # Convert the query parameter string to a boolean
             if claimed_param.lower() in ['true', '1', 'yes']:
                 queryset = queryset.filter(claimed=True)
             elif claimed_param.lower() in ['false', '0', 'no']:
                 queryset = queryset.filter(claimed=False)
             # Handle invalid claimed_param value? DRF might handle it.

        return queryset


    def get_permissions(self):
        """
        Assign permissions based on the action.
        """
        # 'list' and 'retrieve' actions are covered by the ViewSet's permissions.
        # SearchFilter and OrderingFilter work with standard list/retrieve permissions.
        if self.action in ['list', 'retrieve', 'sample_lookup']:
            permission_classes = [permissions.AllowAny] # Anyone can list, retrieve, sample lookup
        elif self.action in ['create', 'contact_leads']:
            permission_classes = [permissions.IsAdminUser] # Admins only
        elif self.action == 'claim':
            permission_classes = [permissions.IsAuthenticated] # Any authenticated user
        elif self.action in ['update', 'partial_update', 'destroy']:
             # Owner or admin can update/delete (IsOwnerOrAdminOrReadOnly allows GET for others on detail view)
            permission_classes = [IsOwnerOrAdminOrReadOnly]
        else:
             # Default for any other custom action not listed
            permission_classes = [permissions.IsAdminUser] # Or adjust default permission
        return [permission() for permission in permission_classes]

    # Standard CRUD methods (list, create, retrieve, update, partial_update, destroy)
    # Update extend_schema for list to include the 'search' parameter documentation

    @extend_schema(
        tags=['Salons'],
        summary="List salons",
        description="Returns paginated list of salons with optional search and filtering.",
        parameters=[
            # Keep location filter param documentation if you re-add manual filtering
            # OpenApiParameter(
            #     name='location',
            #     description='Filter by location (contains search)',
            #     required=False,
            #     type=str,
            #     location=OpenApiParameter.QUERY
            # ),
             # --- Document the 'search' parameter provided by SearchFilter ---
            OpenApiParameter(
                name='search',
                description='Search term for salon name, location, or description.', # Update description
                required=False,
                type=str,
                location=OpenApiParameter.QUERY
            ),
            # Document pagination parameters if using LimitOffsetPagination
            OpenApiParameter(name='limit', type=int, location=OpenApiParameter.QUERY, required=False, description='Number of results to return per page.'),
            OpenApiParameter(name='offset', type=int, location=OpenApiParameter.QUERY, required=False, description='The initial index from which to return the results.'),
             # Document ordering parameter if using OrderingFilter
            OpenApiParameter(
                name='ordering',
                description='Which field to use when ordering the results.',
                required=False,
                type=str, # e.g., 'name', '-created_at'
                location=OpenApiParameter.QUERY,
                # Example: add enum for allowed fields if you have ordering_fields defined
                # enum=['name', '-name', 'location', '-location']
            ),
             # Example: Document the custom 'claimed' parameter if you kept that logic
            OpenApiParameter(
                 name='claimed',
                 description='Filter by claimed status (true or false).',
                 required=False,
                 type=OpenApiTypes.BOOL, # Use OpenApiTypes.BOOL
                 location=OpenApiParameter.QUERY
             ),
        ],
        responses={200: SalonSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        # SearchFilter and other filters are applied automatically by the ViewSet's
        # list method after calling get_queryset(). No custom logic needed here just for search.
        return super().list(request, *args, **kwargs)


    # Keep create, retrieve, update, partial_update, destroy with their extend_schema decorators and custom logic

    @extend_schema(tags=['Salons'], summary="Create salon", description="Admin-only endpoint to create new salon (sample site).", request=SalonSerializer, responses={201: SalonSerializer, 400: OpenApiResponse(ErrorSerializer, description="Invalid data"), 403: OpenApiResponse(ErrorSerializer, description="Forbidden - Admin only")})
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
             try:
                Stats.objects.filter(pk=1).update(
                    total_salons=F('total_salons') + 1,
                    sample_sites=F('sample_sites') + 1,
                    pending_contacts=F('pending_contacts') + 1
                )
             except Stats.DoesNotExist: print("Warning: Stats object with pk=1 not found during Salon creation.")
             except Exception as e: print(f"ERROR updating stats during Salon creation: {e}")
        return response

    @extend_schema(tags=['Salons'], summary="Retrieve salon", description="Get detailed information about a specific salon.", responses={200: SalonSerializer, 404: OpenApiResponse(ErrorSerializer, description="Salon not found")})
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(tags=['Salons'], summary="Update salon (full)", description="Owner or admin can fully update a salon.", request=SalonSerializer, responses={200: SalonSerializer, 400: OpenApiResponse(ErrorSerializer, description="Invalid data"), 403: OpenApiResponse(ErrorSerializer, description="Forbidden - Not owner/admin"), 404: OpenApiResponse(ErrorSerializer, description="Salon not found")})
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(tags=['Salons'], summary="Update salon (partial)", description="Owner or admin can partially update a salon.", request=SalonSerializer, responses={200: SalonSerializer, 400: OpenApiResponse(ErrorSerializer, description="Invalid data"), 403: OpenApiResponse(ErrorSerializer, description="Forbidden - Not owner/admin"), 404: OpenApiResponse(ErrorSerializer, description="Salon not found")})
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(tags=['Salons'], summary="Delete salon", description="Owner or admin can delete a salon.", responses={204: OpenApiResponse(None, description="No content - Successfully deleted"), 403: OpenApiResponse(ErrorSerializer, description="Forbidden - Not owner/admin"), 404: OpenApiResponse(ErrorSerializer, description="Salon not found")})
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        response = super().destroy(request, *args, **kwargs)
        if response.status_code == status.HTTP_204_NO_CONTENT:
            try:
                update_fields = {
                    'total_salons': F('total_salons') - 1,
                    'sample_sites': F('sample_sites') - 1,
                }
                if instance.contact_status == 'notContacted':
                    update_fields['pending_contacts'] = F('pending_contacts') - 1
                Stats.objects.filter(pk=1).update(**update_fields)
            except Stats.DoesNotExist: print("Warning: Stats object with pk=1 not found during Salon deletion.")
            except Exception as e: print(f"ERROR updating stats during Salon deletion: {e}")
        return response


    # Custom Actions (sample_lookup, claim, contact_leads) - Keep these as they are custom endpoints

    @extend_schema(tags=['Salons'], summary="Get salon by sample URL", description="Retrieve salon details using its unique sample URL.", parameters=[OpenApiParameter(name='sample_url', description='Unique sample URL of the salon', required=True, type=str, location=OpenApiParameter.PATH)], responses={200: SalonSerializer, 404: OpenApiResponse(ErrorSerializer, description="Salon not found")})
    @action(detail=False, methods=['get'], url_path='sample/(?P<sample_url>[^/.]+)')
    def sample_lookup(self, request, sample_url=None):
        """Lookup a salon based on its sample_url."""
        salon = get_object_or_404(self.get_queryset(), sample_url=sample_url)
        serializer = self.get_serializer(salon)
        return Response(serializer.data)

    @extend_schema(tags=['Salons'], summary="Claim a salon", description="Authenticated users can claim an unclaimed sample salon.", responses={200: SalonSerializer, 400: OpenApiResponse(ErrorSerializer, description="Bad Request - Already claimed or owned"), 401: OpenApiResponse(ErrorSerializer, description="Unauthorized - Not authenticated"), 404: OpenApiResponse(ErrorSerializer, description="Salon not found")})
    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        """Allows an authenticated user to claim an unclaimed sample salon."""
        salon = self.get_object()
        user = request.user

        if not user.is_authenticated:
             return Response({"error": "Authentication required to claim a salon."}, status=status.HTTP_401_UNAUTHORIZED)
        if salon.claimed or salon.owner is not None: # Check owner explicitly too
            return Response({"error": "This salon has already been claimed or assigned."}, status=status.HTTP_400_BAD_REQUEST)

        update_fields = ['owner', 'claimed', 'claimed_at', 'updated_at']
        was_pending_contact = (salon.contact_status == 'notContacted')

        salon.owner = user
        salon.claimed = True
        salon.claimed_at = timezone.now()
        salon.save(update_fields=update_fields)

        try:
            update_stats_fields = {'sample_sites': F('sample_sites') - 1}
            if was_pending_contact:
                 update_stats_fields['pending_contacts'] = F('pending_contacts') - 1
            Stats.objects.filter(pk=1).update(**update_stats_fields)
        except Stats.DoesNotExist: print("Warning: Stats object with pk=1 not found during Salon claim.")
        except Exception as e: print(f"ERROR updating stats during Salon claim: {e}")

        serializer = self.get_serializer(salon)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(tags=['Salons'], summary="Mark leads as contacted", description="Admin-only endpoint to mark multiple salons as contacted.", request=OpenApiTypes.OBJECT, examples=[OpenApiExample('Example Request', value={"leadIds": [1, 2, 3]}, request_only=True)], responses={200: OpenApiResponse({'type': 'object', 'properties': {'message': {'type': 'string'}}}, description="Successfully marked X leads as contacted"), 400: OpenApiResponse(ErrorSerializer, description="Bad Request - Invalid input"), 403: OpenApiResponse(ErrorSerializer, description="Forbidden - Admin only")})
    @action(detail=False, methods=['post'], url_path='contact-leads')
    def contact_leads(self, request):
        """Admin-only action to mark a list of salon IDs as 'contacted'."""
        lead_ids = request.data.get('leadIds')

        if not isinstance(lead_ids, list) or not lead_ids: # Combine empty check
             return Response({"error": "Required data: 'leadIds' (must be a non-empty list of integers)."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Use a list comprehension for cleaner conversion/validation
            valid_ids = [int(item) for item in lead_ids]
        except (ValueError, TypeError):
            return Response({"error": "'leadIds' must be a list of valid integers."}, status=status.HTTP_400_BAD_REQUEST)

        updated_count = Salon.objects.filter(
            pk__in=valid_ids,
            contact_status='notContacted'
        ).update(contact_status='contacted')

        try:
            # Find the single Stats object and recalculate pending contacts
            stats_obj = Stats.objects.get(pk=1)
            stats_obj.pending_contacts = Salon.objects.filter(contact_status='notContacted').count()
            stats_obj.save(update_fields=['pending_contacts']) # Use update_fields for efficiency

        except Stats.DoesNotExist: print("Warning: Stats object with pk=1 not found during contact_leads update.")
        except Exception as e: print(f"ERROR updating pending contacts stats: {e}")

        return Response({"message": f"Successfully marked {updated_count} leads as contacted."}, status=status.HTTP_200_OK)