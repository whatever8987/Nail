from rest_framework import serializers
from .models import Template, Salon

# Optional: Add a generic ErrorSerializer here or use one from core/serializers.py
class ErrorSerializer(serializers.Serializer):
    detail = serializers.CharField()

class TemplateSerializer(serializers.ModelSerializer):
    """
    Serializer for the Template model.
    """

    class Meta:
        model = Template
        fields = [
            'id',
            'name',
            'description',
            'preview_image',
            'features',
            'is_mobile_optimized',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SalonSerializer(serializers.ModelSerializer):
    """
    Serializer for the Salon model.
    Handles both reading and writing data including related fields like owner and template.
    """
    owner = serializers.StringRelatedField(read_only=True)  # Display username instead of ID
    template = TemplateSerializer(read_only=True)
    template_id = serializers.PrimaryKeyRelatedField(
        queryset=Template.objects.all(),
        source='template',
        required=False,
        allow_null=True,
        write_only=True
    )

    class Meta:
        model = Salon
        fields = [
            'id',
            'name',
            'location',
            'address',
            'phone_number',
            'email',
            'description',
            'services',
            'opening_hours',
            'sample_url',
            'owner',
            'template',
            'template_id',
            'claimed',
            'claimed_at',
            'contact_status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'sample_url',
            'owner',
            'claimed',
            'claimed_at',
            'created_at',
            'updated_at',
        ]

    def validate_contact_status(self, value):
        valid_choices = dict(Salon.CONTACT_STATUS_CHOICES).keys()
        if value not in valid_choices:
            raise serializers.ValidationError(f"Invalid contact status. Must be one of {list(valid_choices)}")
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Optional: Customize representation if needed
        return data