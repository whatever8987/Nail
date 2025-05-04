# core/serializers.py
from rest_framework import serializers
from .models import Stats

class StatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stats
        # Exclude the fixed primary key and creation timestamp
        exclude = ('id', 'created_at')
        # Or explicitly list fields:
        # fields = ('total_salons', 'sample_sites', 'active_subscriptions', 'pending_contacts', 'last_updated')