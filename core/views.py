# core/views.py
from rest_framework import generics, permissions
from .models import Stats
from .serializers import StatsSerializer

class StatsView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve the site-wide statistics.
    Requires admin privileges.
    """
    serializer_class = StatsSerializer
    permission_classes = [permissions.IsAdminUser] # Only admins can view stats

    def get_object(self):
        """Load the singleton Stats object."""
        # Use the load() classmethod defined on the model
        return Stats.load()