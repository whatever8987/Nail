from rest_framework import generics, permissions
from drf_spectacular.utils import extend_schema, OpenApiResponse
from drf_spectacular.types import OpenApiTypes

from .models import Stats
from .serializers import StatsSerializer

class StatsView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve site-wide statistics.
    Only accessible by admin users.
    """
    serializer_class = StatsSerializer
    permission_classes = [permissions.IsAdminUser]

    @extend_schema(
        tags=['Statistics'],
        summary="Retrieve site statistics",
        description="""Returns comprehensive site statistics including:
        - Total salons
        - Active subscriptions
        - Pending contacts
        - Sample sites
        Requires admin privileges.""",
        responses={
            200: StatsSerializer,
            403: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Forbidden - Admin access required"
            )
        }
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_object(self):
        """Load the singleton Stats object."""
        return Stats.load()