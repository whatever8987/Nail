# salons/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import F

# Models and Serializers from this app
from .models import Template, Salon
from .serializers import TemplateSerializer, SalonSerializer

# Shared components from the 'core' app
# Use try-except for Stats initially if 'core' might not exist yet,
# but since we just created it, direct import is fine.
from core.models import Stats
from core.permissions import IsOwnerOrAdmin, IsOwnerOrAdminOrReadOnly


class TemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows Templates to be viewed. Read-only.
    """
    queryset = Template.objects.all().order_by('name')
    serializer_class = TemplateSerializer
    permission_classes = [permissions.AllowAny] # Anyone can view templates

    # Example structure for a preview action (implement logic as needed)
    # @action(detail=True, methods=['get'], url_path='preview')
    # def preview(self, request, pk=None):
    #     template = self.get_object()
    #     # Logic to generate sample data based on the template
    #     sample_data = {'name': f'Preview for {template.name}', ...}
    #     return Response(sample_data)

class SalonViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Salons.
    Handles CRUD, retrieving by sample_url, claiming, and marking leads as contacted.
    Permissions vary by action.
    """
    queryset = Salon.objects.select_related('owner', 'template').all().order_by('name') # Optimize query
    serializer_class = SalonSerializer
    # Allow lookup by PK (default) for standard actions,
    # and handle sample_url lookup via a custom action.
    lookup_field = 'pk'

    def get_queryset(self):
        """
        Override to apply additional filtering from query parameters if needed.
        """
        queryset = super().get_queryset()
        location_param = self.request.query_params.get('location')
        if location_param:
            queryset = queryset.filter(location__icontains=location_param)
        # Add other filters as necessary
        return queryset

    def get_permissions(self):
        """
        Dynamically assign permissions based on the requested action.
        """
        if self.action in ['list', 'retrieve', 'sample_lookup']:
            # Public read access
            permission_classes = [permissions.AllowAny]
        elif self.action == 'create' or self.action == 'contact_leads':
            # Admin only actions
            permission_classes = [permissions.IsAdminUser]
        elif self.action == 'claim':
            # Requires user to be logged in
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Requires owner or admin for modification/deletion
            # IsOwnerOrAdminOrReadOnly allows GET on these detail endpoints too
            permission_classes = [IsOwnerOrAdminOrReadOnly]
        else:
            # Default restrictive permission for any other actions
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """
        Logic executed when an admin creates a new Salon via POST.
        Updates site-wide statistics.
        """
        # sample_url is auto-generated in the model's save method if blank
        serializer.save() # Owner is not set here (must be admin creating)

        # --- Update Stats ---
        try:
            # Atomically update the singleton Stats object (pk=1)
            Stats.objects.filter(pk=1).update(
                total_salons=F('total_salons') + 1,
                sample_sites=F('sample_sites') + 1,  # New salons start as samples
                pending_contacts=F('pending_contacts') + 1 # New salons need contact
            )
        except Exception as e:
            # Log error if stats update fails, but don't fail the request
            print(f"ERROR updating stats during Salon creation: {e}")
        # Note: No need to return the salon object here, DRF handles the response

    # Custom action mapped to GET /api/salons/sample/{sample_url}/
    @action(detail=False, methods=['get'], url_path='sample/(?P<sample_url>[^/.]+)')
    def sample_lookup(self, request, sample_url=None):
        """
        Retrieves a single salon instance using its unique 'sample_url'.
        """
        # Apply base queryset filters if any
        queryset = self.filter_queryset(self.get_queryset())
        # Perform lookup using the sample_url from the URL
        salon = get_object_or_404(queryset, sample_url=sample_url)
        # Serialize and return the found salon
        serializer = self.get_serializer(salon)
        return Response(serializer.data)

    # Custom action mapped to POST /api/salons/{pk}/claim/
    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        """
        Allows an authenticated user to claim an unclaimed salon.
        Updates ownership and statistics.
        """
        salon = self.get_object() # Retrieves salon by primary key (pk)
        user = request.user

        # --- Validation ---
        if salon.claimed:
            return Response({"error": "This salon has already been claimed."}, status=status.HTTP_400_BAD_REQUEST)
        if salon.owner is not None:
             # Should ideally not happen if claimed is False, but good defensive check
             return Response({"error": "This salon is already assigned to an owner."}, status=status.HTTP_400_BAD_REQUEST)

        # --- Perform Claim ---
        salon.owner = user
        salon.claimed = True
        salon.claimed_at = timezone.now()
        salon.save(update_fields=['owner', 'claimed', 'claimed_at', 'updated_at']) # Update specific fields

        # --- Update Stats ---
        try:
            # Atomically decrement sample sites count
            Stats.objects.filter(pk=1).update(
                sample_sites=F('sample_sites') - 1
            )
        except Exception as e:
            # Log error if stats update fails
            print(f"ERROR updating stats during Salon claim: {e}")

        # Return the updated salon data
        serializer = self.get_serializer(salon)
        return Response(serializer.data)

    # Custom action mapped to POST /api/salons/contact-leads/
    @action(detail=False, methods=['post'], url_path='contact-leads')
    def contact_leads(self, request):
        """
        Admin action to mark multiple salons (by ID) as having been contacted.
        Updates contact_status and recalculates pending contacts statistics.
        Expects JSON: {"leadIds": [1, 2, ...]}
        """
        lead_ids = request.data.get('leadIds')

        # --- Input Validation ---
        if not isinstance(lead_ids, list):
            return Response({"error": "Required data: 'leadIds' (must be a list)."}, status=status.HTTP_400_BAD_REQUEST)
        if not lead_ids:
             return Response({"error": "'leadIds' list cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Ensure all IDs are integers
            valid_ids = [int(id) for id in lead_ids]
        except (ValueError, TypeError):
             return Response({"error": "'leadIds' must be a list of valid integers."}, status=status.HTTP_400_BAD_REQUEST)

        # --- Perform Update ---
        # Update only those salons that are currently 'notContacted'
        updated_count = Salon.objects.filter(
            pk__in=valid_ids,
            contact_status='notContacted'
        ).update(contact_status='contacted') # Change status to 'contacted'

        # --- Update Stats ---
        # Recalculate the pending count accurately after the update
        try:
            current_pending = Salon.objects.filter(contact_status='notContacted').count()
            Stats.objects.filter(pk=1).update(pending_contacts=current_pending)
        except Exception as e:
            # Log error if stats update fails
            print(f"ERROR updating pending contacts stats: {e}")

        return Response({"message": f"Successfully marked {updated_count} leads as contacted."})