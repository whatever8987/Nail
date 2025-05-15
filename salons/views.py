# salon_app/views.py

# Standard Django Imports
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import F
from django.conf import settings # Import settings to get MEDIA_URL

# Django REST Framework Imports
# Import necessary DRF modules including serializers and filters
from rest_framework import viewsets, permissions, status, serializers, filters
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
# If these models/permissions are not in core app, adjust imports
# from core.models import Stats
# from core.permissions import IsOwnerOrAdmin, IsOwnerOrAdminOrReadOnly
# from core.serializers import ErrorSerializer

# --- Placeholder/Mock for core imports if they aren't available ---
# Keep these mocks if you haven't integrated the real core models/permissions
class Stats:
    """Mock Stats model for seeding/views if core app is not ready."""
    @staticmethod
    def objects():
        # Mock manager methods needed by the views
        class MockQueryset:
            def filter(self, *a, **kw): return self
            def update(self, *a, **kw): pass
            def get(self, *a, **kw): return Stats() # Mock get to return a dummy instance
            def count(self): return 0 # Mock count
        return MockQueryset()

class IsOwnerOrAdmin(permissions.BasePermission):
    """Mock IsOwnerOrAdmin permission."""
    def has_object_permission(self, request, view, obj):
        # In mock, assume permission granted for simplicity, or implement basic check
        # return obj.owner == request.user or request.user.is_staff # Example real check
        return True

class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """Mock IsOwnerOrAdminOrReadOnly permission."""
    def has_object_permission(self, request, view, obj):
        # In mock, allow read for anyone, write for owner/admin
        # if request.method in permissions.SAFE_METHODS: return True # Read allowed
        # return obj.owner == request.user or request.user.is_staff # Write for owner/admin
        return True # Simple mock allows all

class ErrorSerializer(serializers.Serializer):
    """Mock ErrorSerializer."""
    detail = serializers.CharField()
# -------------------------------------------------------------------


# --- Constants for Sample Data (Used in Preview) ---
SAMPLE_SERVICES = [
  {"name": "Classic Manicure", "price": "$35", "description": "Clean and shape nails, cuticle care, massage, and polish."},
  {"name": "Gel Pedicure", "price": "$45", "description": "Soaking, exfoliation, cuticle care, massage, gel polish."},
  {"name": "Nail Extensions", "price": "$60", "description": "Acrylic or gel extensions for length and strength."},
  {"name": "Nail Art", "price": "$20", "description": "Creative designs and embellishments."},
  {"name": "Waxing", "price": "$15+", "description": "Smooth skin with our waxing services."}
]
SAMPLE_OPENING_HOURS = "Monday - Friday: 9:00 AM - 7:00 PM\nSaturday: 9:00 AM - 6:00 PM\nSunday: Closed"
SAMPLE_DESCRIPTION = "Welcome to our Sample Salon! We offer a range of services to make you look and feel great. This is a placeholder description for the preview."
SAMPLE_TAGLINE = "Experience our quality services."
SAMPLE_HERO_SUBTITLE = "Your Beauty, Our Passion"
SAMPLE_FOOTER_ABOUT = "Providing excellent nail care and beauty services since 2023."
SAMPLE_BOOKING_URL = "#" # Placeholder for preview
SAMPLE_GALLERY_URL = "#" # Placeholder for preview
SAMPLE_SERVICES_URL = "#" # Placeholder for preview
SAMPLE_MAP_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.264387659134!2d-74.01283148459468!3d40.7484402793281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259bf5c1654f3%3A0x2c159c7f79a37921!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1645745845828!5m2!1sen!2sus"
# Note: Using settings.STATIC_URL requires STATIC_URL to be configured and static files collected/served.
# If you don't have sample images in static, use placeholder URLs like https://placehold.co/
SAMPLE_GALLERY_IMAGES = [
    f"{settings.STATIC_URL}sample_images/gallery1.jpg" if settings.STATIC_URL else 'https://placehold.co/600x400?text=Gallery+1',
    f"{settings.STATIC_URL}sample_images/gallery2.jpg" if settings.STATIC_URL else 'https://placehold.co/600x400?text=Gallery+2',
    f"{settings.STATIC_URL}sample_images/gallery3.jpg" if settings.STATIC_URL else 'https://placehold.co/600x400?text=Gallery+3',
    f"{settings.STATIC_URL}sample_images/gallery4.jpg" if settings.STATIC_URL else 'https://placehold.co/600x400?text=Gallery+4',
]
SAMPLE_TESTIMONIALS = [
    {"quote": "Amazing experience! Highly recommend.", "name": "A. Customer"}, # Changed client_name to name for consistency with some samples
    {"quote": "Friendly staff and great results!", "name": "B. Client"},
]
SAMPLE_SOCIAL_LINKS = [
    {"platform": "Facebook", "url": "#"},
    {"platform": "Instagram", "url": "#"},
]
# --- Default image URLs for preview if Template model lacks default images ---
DEFAULT_PREVIEW_IMAGE_URL = settings.STATIC_URL + 'media/default.png' if settings.STATIC_URL else 'https://placehold.co/300x200?text=Preview'
DEFAULT_COVER_IMAGE_URL = settings.STATIC_URL + 'template_defaults/default_cover.jpg' if settings.STATIC_URL else 'https://placehold.co/1200x600?text=Cover'
DEFAULT_ABOUT_IMAGE_URL = settings.STATIC_URL + 'template_defaults/default_about.jpg' if settings.STATIC_URL else 'https://placehold.co/800x600?text=About'
DEFAULT_LOGO_IMAGE_URL = settings.STATIC_URL + 'salon_logos/default_logo.png' if settings.STATIC_URL else 'https://placehold.co/180x50?text=Logo'
# ---------------------------------------------------


# --- Function-Based View for Template Preview ---
# This uses standard Django's JsonResponse
# (Keep this function as it is not part of the ViewSet, linked via urls.py path)
def template_preview_view(request, id):
    """
    API endpoint to generate a sample salon preview based on a template ID.
    Corresponds to GET /api/templates/:id/preview/
    Returns data structured like a Salon object but with sample content and template details.
    """
    if request.method != 'GET':
         return JsonResponse({"detail": "Method not allowed"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    try:
        template = get_object_or_404(Template, pk=id)

        # Use the TemplateSerializer to get the template details as a dictionary
        # This includes styling fields and default images URLs if available on the Template model
        template_serializer = TemplateSerializer(template)
        template_data = template_serializer.data

        # --- Manually construct sample salon data ---
        # This structure MUST match the Salon serializer output shape expected by the frontend
        sample_salon_data = {
            # Basic identifying fields
            "id": 999, # Use a clear dummy ID for previews
            "name": f"Sample Salon ({template.name} Preview)", # Indicate template being previewed
            "sample_url": f"sample-preview-{template.id}", # Dummy sample URL for preview

            # Contact Details with sample data
            "location": "Sample City, ST",
            "address": "123 Main Street",
            "phone_number": "(555) 123-4567",
            "email": "contact@samplesalon.com",
            "map_embed_url": SAMPLE_MAP_EMBED_URL,

            # Website Content (Text & JSON) with sample data
            "description": SAMPLE_DESCRIPTION,
            "hero_subtitle": SAMPLE_HERO_SUBTITLE,
            "opening_hours": SAMPLE_OPENING_HOURS,
            "services_tagline": SAMPLE_TAGLINE,
            "gallery_tagline": SAMPLE_TAGLINE, # Can reuse taglines
            "footer_about": SAMPLE_FOOTER_ABOUT,
            "services": SAMPLE_SERVICES, # Use structured sample services (list of dicts)
            "gallery_images": SAMPLE_GALLERY_IMAGES, # Use sample gallery image URLs
            "testimonials": SAMPLE_TESTIMONIALS, # Use sample testimonials (list of dicts)
            "social_links": SAMPLE_SOCIAL_LINKS, # Use sample social links (list of dicts)

            # Website Content (Image URLs) - Use template defaults if available, otherwise generic placeholders
            # The serializer for Template already gave us URLs for default images if they exist
            "image": DEFAULT_PREVIEW_IMAGE_URL, # A general preview image, maybe template.preview_image? Or a generic one. Let's use template preview image
            "logo_image": template_data.get('preview_image') if template_data.get('preview_image') else DEFAULT_LOGO_IMAGE_URL, # Use template preview as logo? Or specific logo field? Let's use generic default
            "cover_image": template_data.get('default_cover_image') if template_data.get('default_cover_image') else DEFAULT_COVER_IMAGE_URL, # Use template default cover or generic
            "about_image": template_data.get('default_about_image') if template_data.get('default_about_image') else DEFAULT_ABOUT_IMAGE_URL, # Use template default about or generic
            "footer_logo_image": template_data.get('preview_image') if template_data.get('preview_image') else DEFAULT_LOGO_IMAGE_URL, # Use template preview as footer logo? Or specific field? Let's use generic default

            # URL Fields with sample data
            "booking_url": SAMPLE_BOOKING_URL,
            "gallery_url": SAMPLE_GALLERY_URL,
            "services_url": SAMPLE_SERVICES_URL,

            # Site Configuration & Ownership with dummy/default data
            "owner": None, # StringRelatedField becomes None for null
            "template": template_data, # Embed the full template data here for the frontend component
            "template_id": template.id, # Also include the ID directly

            # Status & Claiming with dummy data
            "claimed": False,
            "claimed_at": None,
            "contact_status": "notContacted",

            # Timestamps with dummy data (current time or fixed)
            "created_at": timezone.now().isoformat(), # Ensure ISO format for JSON
            "updated_at": timezone.now().isoformat(), # Ensure ISO format for JSON
        }

        # JsonResponse handles simple types, lists, and dicts.
        # Datetime objects should be converted to strings (isoformat) for consistency.
        # ImageFields' URLs from the serializer are already strings.

        return JsonResponse(sample_salon_data, status=status.HTTP_200_OK)

    except Template.DoesNotExist:
        return JsonResponse({"detail": "Template not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"An error occurred in template_preview_view: {e}")
        return JsonResponse({"detail": "Error generating template preview"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- Django REST Framework ViewSets ---

class TemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows Templates to be viewed (Read-only).
    Uses slug for retrieval instead of ID.
    """
    queryset = Template.objects.all().order_by('name')
    serializer_class = TemplateSerializer
    permission_classes = [permissions.AllowAny]

    # --- Set the lookup field to 'slug' ---
    lookup_field = 'slug'
    # -------------------------------------

    # DRF automatically handles list and retrieve methods using the serializer.
    # The serializer includes styling fields and default image URLs.
    # Now, retrieve will expect a slug parameter in the URL (e.g., /templates/modern/)

    @extend_schema(tags=['Templates'], summary="List all templates", description="Returns a paginated list of all available salon templates.", responses={200: TemplateSerializer(many=True)})
    def list(self, request, *args, **kwargs):
        # This is where frontend's API.templates.list() hits.
        # It will still list templates, including their slugs.
        return super().list(request, *args, **kwargs)

    # Update the schema documentation for retrieve to reflect using slug
    @extend_schema(
        tags=['Templates'], summary="Retrieve template details by slug",
        description="Returns detailed information about a specific template using its slug.",
        parameters=[
            OpenApiParameter(name='slug', description='Unique slug of the template', required=True, type=str, location=OpenApiParameter.PATH)
        ],
        responses={200: TemplateSerializer, 404: OpenApiResponse(ErrorSerializer, description="Template not found")}
    )
    def retrieve(self, request, *args, **kwargs):
        # This is where frontend's API.templates.get(slug) will hit (you'll need to update the frontend API client)
        # DRF's retrieve method automatically uses self.lookup_field (which is now 'slug')
        return super().retrieve(request, *args, **kwargs)


class SalonViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Salons with custom actions.
    Includes all salon content and configuration fields.
    Supports filtering, searching, claiming, etc.
    """
    # Select related template and owner for efficient retrieval in list and retrieve actions
    queryset = Salon.objects.select_related('owner', 'template').all().order_by('name')
    serializer_class = SalonSerializer
    lookup_field = 'pk' # Default lookup is by primary key (id)

    # Configure filters and search
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    # Define which fields are searchable via the ?search= query parameter
    search_fields = ['name', 'location', 'address', 'description', 'hero_subtitle', 'services_tagline', 'gallery_tagline'] # Added address for search

    # Optional: Define which fields can be used for ordering via the ?ordering= query parameter
    # ordering_fields = ['name', 'location', 'created_at', 'claimed']


    def get_queryset(self):
        """
        Optionally filter queryset based on request parameters.
        SearchFilter and OrderingFilter are applied automatically *after* this method.
        """
        queryset = super().get_queryset()

        # Example of manually applying a filter not handled by SearchFilter (like boolean 'claimed')
        claimed_param = self.request.query_params.get('claimed', None)
        if claimed_param is not None:
             # Convert the query parameter string to a boolean
             if claimed_param.lower() in ['true', '1', 'yes']:
                 queryset = queryset.filter(claimed=True)
             elif claimed_param.lower() in ['false', '0', 'no']:
                 queryset = queryset.filter(claimed=False)
             # Note: Invalid claimed_param values will just result in no filter applied by this logic

        return queryset


    def get_permissions(self):
        """
        Assign permissions based on the action being performed.
        """
        # list and retrieve are public (for displaying on the SalonsPage)
        # sample_lookup is also public (for displaying individual salon sites)
        if self.action in ['list', 'retrieve', 'sample_lookup']:
            permission_classes = [permissions.AllowAny]
        # create and contact_leads are admin-only actions
        elif self.action in ['create', 'contact_leads']:
            permission_classes = [permissions.IsAdminUser] # Assumes Django's IsAdminUser
        # claim requires user to be authenticated
        elif self.action == 'claim':
            permission_classes = [permissions.IsAuthenticated] # Assumes Django's IsAuthenticated
        # update, partial_update, destroy require ownership or admin status
        elif self.action in ['update', 'partial_update', 'destroy']:
             # Assumes IsOwnerOrAdminOrReadOnly permission class from core.permissions
             # This requires the object instance to have an 'owner' field or similar check
            permission_classes = [IsOwnerOrAdminOrReadOnly]
        else:
             # Default permission for any other custom action not explicitly listed
            permission_classes = [permissions.IsAdminUser] # Default to admin protection

        # Instantiate and return the permission classes
        return [permission() for permission in permission_classes]


    # --- DRF ViewSet Methods ---
    # list, create, retrieve, update, partial_update, destroy methods are provided by ModelViewSet.
    # They automatically use the configured serializer and queryset.
    # We add extend_schema decorators for API documentation.

    @extend_schema(
        tags=['Salons'], summary="List salons",
        description="Returns a paginated list of salons with optional search, filtering, and ordering.",
        parameters=[
            OpenApiParameter(
                name='search', description='Search term for salon name, location, address, description, or taglines.',
                required=False, type=str, location=OpenApiParameter.QUERY
            ),
            OpenApiParameter(name='limit', type=int, location=OpenApiParameter.QUERY, required=False, description='Number of results to return per page.'),
            OpenApiParameter(name='offset', type=int, location=OpenApiParameter.QUERY, required=False, description='The initial index from which to return the results.'),
            OpenApiParameter(
                name='ordering', description='Which field to use when ordering the results (e.g., name, -created_at).',
                required=False, type=str, location=OpenApiParameter.QUERY,
                # enum=... # Optional: List allowed fields if using ordering_fields
            ),
            OpenApiParameter(
                 name='claimed', description='Filter by claimed status (true or false).',
                 required=False, type=OpenApiTypes.BOOL, location=OpenApiParameter.QUERY
             ),
        ],
        responses={200: SalonSerializer(many=True), 400: OpenApiResponse(ErrorSerializer, description="Invalid parameters")}
    )
    def list(self, request, *args, **kwargs):
        # Frontend's API.salons.list({ search: '...' }) hits here.
        # SearchFilter and other filters are applied automatically by super().list()
        return super().list(request, *args, **kwargs)


    @extend_schema(tags=['Salons'], summary="Create salon", description="Admin-only endpoint to create a new salon (sample site).", request=SalonSerializer, responses={201: SalonSerializer, 400: OpenApiResponse(ErrorSerializer, description="Invalid data"), 403: OpenApiResponse(ErrorSerializer, description="Forbidden - Admin only")})
    def create(self, request, *args, **kwargs):
        # Frontend could potentially hit this if an admin creates a sample site.
        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
             try:
                # Update stats after successful creation
                # Requires Stats model from core.models
                Stats.objects.filter(pk=1).update(
                    total_salons=F('total_salons') + 1,
                    sample_sites=F('sample_sites') + 1,
                    pending_contacts=F('pending_contacts') + 1
                )
             except Stats.DoesNotExist: print("Warning: Stats object with pk=1 not found during Salon creation.")
             except Exception as e: print(f"ERROR updating stats during Salon creation: {e}")
        return response

    @extend_schema(tags=['Salons'], summary="Retrieve salon", description="Get detailed information about a specific salon by ID.", responses={200: SalonSerializer, 404: OpenApiResponse(ErrorSerializer, description="Salon not found")})
    def retrieve(self, request, *args, **kwargs):
        # Frontend could hit this if accessing a salon by ID (less common than by sample_url)
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(tags=['Salons'], summary="Update salon (full)", description="Owner or admin can fully update a salon by ID.", request=SalonSerializer, responses={200: SalonSerializer, 400: OpenApiResponse(ErrorSerializer, description="Invalid data"), 403: OpenApiResponse(ErrorSerializer, description="Forbidden - Not owner/admin"), 404: OpenApiResponse(ErrorSerializer, description="Salon not found")})
    def update(self, request, *args, **kwargs):
        # Frontend portal/dashboard could hit this for editing salon details
        return super().update(request, *args, **kwargs)

    @extend_schema(tags=['Salons'], summary="Update salon (partial)", description="Owner or admin can partially update a salon by ID.", request=SalonSerializer, responses={200: SalonSerializer, 400: OpenApiResponse(ErrorSerializer, description="Invalid data"), 403: OpenApiResponse(ErrorSerializer, description="Forbidden - Not owner/admin"), 404: OpenApiResponse(ErrorSerializer, description="Salon not found")})
    def partial_update(self, request, *args, **kwargs):
        # Frontend portal/dashboard could hit this for editing specific fields
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(tags=['Salons'], summary="Delete salon", description="Owner or admin can delete a salon by ID.", responses={204: OpenApiResponse(None, description="No content - Successfully deleted"), 403: OpenApiResponse(ErrorSerializer, description="Forbidden - Not owner/admin"), 404: OpenApiResponse(ErrorSerializer, description="Salon not found")})
    def destroy(self, request, *args, **kwargs):
        # Frontend portal/dashboard could hit this for deleting a salon
        instance = self.get_object()
        response = super().destroy(request, *args, **kwargs)
        if response.status_code == status.HTTP_204_NO_CONTENT:
            try:
                # Update stats after successful deletion
                 # Requires Stats model from core.models
                update_fields = {
                    'total_salons': F('total_salons') - 1,
                    'sample_sites': F('sample_sites') - 1,
                }
                # Decrement pending contacts if the deleted salon was in that status
                if instance.contact_status == 'notContacted':
                    update_fields['pending_contacts'] = F('pending_contacts') - 1
                Stats.objects.filter(pk=1).update(**update_fields)
            except Stats.DoesNotExist: print("Warning: Stats object with pk=1 not found during Salon deletion.")
            except Exception as e: print(f"ERROR updating stats during Salon deletion: {e}")
        return response


    # --- Custom Actions ---

    @extend_schema(tags=['Salons'], summary="Get salon by sample URL", description="Retrieve salon details using its unique sample URL slug.", parameters=[OpenApiParameter(name='sample_url', description='Unique sample URL of the salon', required=True, type=str, location=OpenApiParameter.PATH)], responses={200: SalonSerializer, 404: OpenApiResponse(ErrorSerializer, description="Salon not found")})
    @action(detail=False, methods=['get'], url_path='sample/(?P<sample_url>[^/.]+)')
    def sample_lookup(self, request, sample_url=None):
        """Lookup a salon based on its sample_url slug."""
        # This action is hit by frontend's API.salons.getBySampleUrl(sampleUrl)
        salon = get_object_or_404(self.get_queryset(), sample_url=sample_url)
        serializer = self.get_serializer(salon) # Use the ViewSet's serializer
        return Response(serializer.data)

    @extend_schema(tags=['Salons'], summary="Claim a salon", description="Authenticated users can claim an unclaimed sample salon by its ID.", responses={200: SalonSerializer, 400: OpenApiResponse(ErrorSerializer, description="Bad Request - Already claimed or owned"), 401: OpenApiResponse(ErrorSerializer, description="Unauthorized - Not authenticated"), 404: OpenApiResponse(ErrorSerializer, description="Salon not found")})
    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        """Allows an authenticated user to claim an unclaimed sample salon by its primary key (id)."""
        # This action is hit by frontend's API.salons.claim(id)
        salon = self.get_object() # Get the salon instance based on the URL pk
        user = request.user # Get the authenticated user

        # Check if user is authenticated (redundant with IsAuthenticated permission, but safe)
        if not user.is_authenticated:
             return Response({"detail": "Authentication required to claim a salon."}, status=status.HTTP_401_UNAUTHORIZED)
        # Check if the salon is already claimed or has an owner
        if salon.claimed or salon.owner is not None:
            return Response({"detail": "This salon has already been claimed or assigned."}, status=status.HTTP_400_BAD_REQUEST)

        # Store whether it was pending contact BEFORE updating, for stats
        was_pending_contact = (salon.contact_status == 'notContacted')

        # Assign the user as the owner and mark as claimed
        salon.owner = user
        salon.claimed = True
        salon.claimed_at = timezone.now()
        # Change contact status if it was 'notContacted' (optional business logic)
        if was_pending_contact:
             salon.contact_status = 'subscribed' # Or 'contacted', depending on flow

        # Save only the fields that changed for efficiency
        update_fields_list = ['owner', 'claimed', 'claimed_at', 'updated_at']
        if was_pending_contact:
             update_fields_list.append('contact_status')
        salon.save(update_fields=update_fields_list)


        try:
            # Update stats after successful claim
            # Requires Stats model from core.models
            # Decrement sample_sites count
            update_stats_fields = {'sample_sites': F('sample_sites') - 1}
            # If it was pending contact, decrement pending_contacts as well
            if was_pending_contact:
                 update_stats_fields['pending_contacts'] = F('pending_contacts') - 1

            Stats.objects.filter(pk=1).update(**update_stats_fields)

        except Stats.DoesNotExist: print("Warning: Stats object with pk=1 not found during Salon claim.")
        except Exception as e: print(f"ERROR updating stats during Salon claim: {e}")

        # Re-fetch or serialize the updated instance to include latest changes and all fields
        salon.refresh_from_db() # Get the latest state from the db, including updated fields
        serializer = self.get_serializer(salon) # Serialize the updated salon object
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(tags=['Salons'], summary="Mark leads as contacted", description="Admin-only endpoint to mark multiple salons as contacted by their IDs.", request=OpenApiTypes.OBJECT, examples=[OpenApiExample('Example Request', value={"leadIds": [1, 2, 3]}, request_only=True)], responses={200: OpenApiResponse({'type': 'object', 'properties': {'message': {'type': 'string'}}}, description="Successfully marked X leads as contacted"), 400: OpenApiResponse(ErrorSerializer, description="Bad Request - Invalid input"), 403: OpenApiResponse(ErrorSerializer, description="Forbidden - Admin only")})
    @action(detail=False, methods=['post'], url_path='contact-leads')
    def contact_leads(self, request):
        """Admin-only action to mark a list of salon IDs as 'contacted'."""
        # This action is hit by frontend admin dashboard/leads management
        lead_ids = request.data.get('leadIds')

        if not isinstance(lead_ids, list) or not lead_ids: # Check if it's a non-empty list
             return Response({"detail": "Required data: 'leadIds' (must be a non-empty list of integers)."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Use a list comprehension for cleaner conversion/validation
            valid_ids = [int(item) for item in lead_ids]
        except (ValueError, TypeError):
            # Handle cases where list items are not valid integers
            return Response({"detail": "'leadIds' must be a list of valid integers."}, status=status.HTTP_400_BAD_REQUEST)

        # Get salons that match IDs and are currently 'notContacted'
        salons_to_update = Salon.objects.filter(
            pk__in=valid_ids,
            contact_status='notContacted'
        )

        # Update the contact status for the filtered salons
        updated_count = salons_to_update.update(contact_status='contacted')

        # --- Update Stats ---
        # We need to count how many were 'notContacted' before the update
        # A more efficient way to update stats might involve F() expressions or signals,
        # but recalculating here is simple after the update.
        try:
             # Requires Stats model from core.models
            stats_obj = Stats.objects.get(pk=1)
            # Recalculate the number of pending contacts directly from the DB
            stats_obj.pending_contacts = Salon.objects.filter(contact_status='notContacted').count()
            stats_obj.save(update_fields=['pending_contacts']) # Save only the updated field

        except Stats.DoesNotExist: print("Warning: Stats object with pk=1 not found during contact_leads update.")
        except Exception as e: print(f"ERROR updating pending contacts stats: {e}")

        return Response({"message": f"Successfully marked {updated_count} leads as contacted."}, status=status.HTTP_200_OK)