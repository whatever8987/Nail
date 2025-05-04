# salons/serializers.py
from rest_framework import serializers
from .models import Template, Salon
from users.serializers import UserSerializer # Optional: For nested owner display

class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = '__all__' # Expose all fields for templates

class SalonSerializer(serializers.ModelSerializer):
    # --- Optional: Nested Serializers for Richer Output ---
    # Uncomment these lines to show full owner/template details instead of just IDs
    # owner = UserSerializer(read_only=True)
    # template = TemplateSerializer(read_only=True)
    # If using nested serializers, you might need PrimaryKeyRelatedField for writing
    # owner_id = serializers.PrimaryKeyRelatedField(
    #     queryset=User.objects.all(), source='owner', write_only=True, required=False, allow_null=True
    # )
    # template_id = serializers.PrimaryKeyRelatedField(
    #     queryset=Template.objects.all(), source='template', write_only=True, required=False, allow_null=True
    # )
    # --- End Optional ---

    class Meta:
        model = Salon
        fields = '__all__' # Start by exposing all fields
        # Define fields that should not be directly set via POST/PUT/PATCH
        # sample_url is generated automatically or looked up, owner set via claim/admin
        # claimed/claimed_at set via claim action
        read_only_fields = ('id', 'owner', 'claimed', 'claimed_at', 'created_at', 'updated_at')

    # Add custom validation if needed (e.g., complex rules)
    # def validate(self, data):
    #     # example validation
    #     if 'some_field' in data and data['some_field'] == 'invalid':
    #         raise serializers.ValidationError("Some field cannot be 'invalid'")
    #     return data