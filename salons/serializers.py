# salon_app/serializers.py

from rest_framework import serializers
from .models import Template, Salon

# Assuming core.serializers has ErrorSerializer or define it locally
class ErrorSerializer(serializers.Serializer):
    detail = serializers.CharField()

class TemplateSerializer(serializers.ModelSerializer):
    """
    Serializer for the Template model.
    Includes the new 'slug' field.
    """
    preview_image = serializers.ImageField(read_only=True)
    default_cover_image = serializers.ImageField(read_only=True, allow_null=True)
    default_about_image = serializers.ImageField(read_only=True, allow_null=True)

    class Meta:
        model = Template
        fields = [
            'id',
            'name',
            'slug', # --- Include the slug field ---
            'description',
            'preview_image',
            'features',
            'is_mobile_optimized',
            'primary_color',
            'secondary_color',
            'font_family',
            'background_color',
            'text_color',
            'default_cover_image',
            'default_about_image',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class SalonSerializer(serializers.ModelSerializer):
    """
    Serializer for the Salon model.
    Includes the new 'image' field and other fields.
    """
    owner = serializers.StringRelatedField(read_only=True)
    template = TemplateSerializer(read_only=True)
    template_id = serializers.PrimaryKeyRelatedField(
        queryset=Template.objects.all(),
        source='template',
        required=False,
        allow_null=True,
        write_only=True
    )

    # --- Add the new image field ---
    # ImageField serializers automatically provide the URL when read
    image = serializers.ImageField(read_only=True, allow_null=True)
    # -------------------------------

    # Existing image fields (also read_only=True)
    logo_image = serializers.ImageField(read_only=True, allow_null=True)
    cover_image = serializers.ImageField(read_only=True, allow_null=True)
    about_image = serializers.ImageField(read_only=True, allow_null=True)
    footer_logo_image = serializers.ImageField(read_only=True, allow_null=True)

    # Existing other fields...
    hero_subtitle = serializers.CharField(max_length=255, required=False, allow_null=True)
    services_tagline = serializers.CharField(max_length=255, required=False, allow_null=True)
    gallery_tagline = serializers.CharField(max_length=255, required=False, allow_null=True)
    footer_about = serializers.CharField(required=False, allow_null=True)
    booking_url = serializers.URLField(required=False, allow_null=True)
    gallery_url = serializers.URLField(required=False, allow_null=True)
    services_url = serializers.URLField(required=False, allow_null=True)
    map_embed_url = serializers.URLField(required=False, allow_null=True)
    services = serializers.JSONField(required=False, allow_null=True)
    opening_hours = serializers.CharField(required=False, allow_null=True) # Or TextField, serializes similarly
    gallery_images = serializers.JSONField(required=False, allow_null=True)
    testimonials = serializers.JSONField(required=False, allow_null=True)
    social_links = serializers.JSONField(required=False, allow_null=True)


    class Meta:
        model = Salon
        fields = [
            'id', 'name', 'location', 'address', 'phone_number', 'email',
            'description', 'services', 'opening_hours', 'sample_url',
            'owner', 'template', 'template_id', 'claimed', 'claimed_at',
            'contact_status', 'created_at', 'updated_at',
            # --- Include the new 'image' field here ---
            'image',
            # -------------------------------------------
            # Include existing other new fields
            'logo_image', 'cover_image', 'about_image', 'footer_logo_image',
            'hero_subtitle', 'services_tagline', 'gallery_tagline', 'footer_about',
            'booking_url', 'gallery_url', 'services_url', 'map_embed_url',
            'gallery_images', 'testimonials', 'social_links',
        ]
        read_only_fields = [
            'id', 'sample_url', 'owner', 'claimed', 'claimed_at',
            'created_at', 'updated_at',
            # Image fields are typically read-only in serializers for reads
            'image', 'logo_image', 'cover_image', 'about_image', 'footer_logo_image',
        ]

    def validate_contact_status(self, value):
        valid_choices = dict(Salon.CONTACT_STATUS_CHOICES).keys()
        if value not in valid_choices:
            raise serializers.ValidationError(f"Invalid contact status. Must be one of {list(valid_choices)}")
        return value