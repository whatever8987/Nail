# salons/admin.py

from django.contrib import admin
# Import your models
from .models import Template, Salon
# Import forms if needed for custom form logic (usually not needed just for layout)
from django import forms # Import forms if using custom forms

# --- Optional: Import third-party JSON editor if desired ---
# Example using django-jsoneditor:
# pip install django-jsoneditor
# Add 'django_jsoneditor' to INSTALLED_APPS in settings.py
# from django_jsoneditor.forms import JSONEditor

# Define a custom form for the Salon model (Optional - for better JSON editing)
# class SalonAdminForm(forms.ModelForm):
#     # Override JSONField widgets with the JSONEditor
#     # These field names must match the model field names
#     services = forms.CharField(widget=JSONEditor())
#     gallery_images = forms.CharField(widget=JSONEditor())
#     testimonials = forms.CharField(widget=JSONEditor())
#     social_links = forms.CharField(widget=JSONEditor())
#     # If Template model uses JSONField 'features' and you want JSONEditor there too, add it here
#     # features = forms.CharField(widget=JSONEditor())


#     class Meta:
#         model = Salon
#         # Use '__all__' or explicitly list the fields you want in this form
#         # Using '__all__' is usually fine unless you need to exclude/reorder fields
#         fields = '__all__'
# ----------------------------------------------------------


# Define Custom Admin classes
class TemplateAdmin(admin.ModelAdmin):
    """
    Custom Admin options for the Template model.
    Configures list view, search, filters, and form layout.
    """
    # Fields shown in the list view in the admin dashboard
    list_display = ('name', 'is_mobile_optimized', 'primary_color', 'created_at')
    # Fields to enable search on in the list view
    search_fields = ('name', 'description')
    # Fields to add filters to the sidebar of the list view
    list_filter = ('is_mobile_optimized', 'created_at')

    # Group fields into fieldsets for better organization on the add/edit form
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'preview_image', 'is_mobile_optimized')
        }),
        ('Styling Options', {
            # Fields related to template appearance
            'fields': ('primary_color', 'secondary_color', 'font_family', 'background_color', 'text_color', 'default_cover_image', 'default_about_image')
        }),
        ('Features (JSON)', {
            # JSONField for template features
            'fields': ('features',),
            'description': 'Enter JSON data for template-specific features (e.g., {"show_gallery": true, "show_map": true})'
        }),
        ('Timestamps', {
            # Auto-generated timestamps
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',), # Make this section collapsible by default
        }),
    )

    # Fields that should be displayed but not editable in the form
    readonly_fields = ('created_at', 'updated_at')

    # If you want to use a custom form (e.g., for better JSON widget for 'features')
    # form = CustomTemplateAdminForm # Define CustomTemplateAdminForm if needed


class SalonAdmin(admin.ModelAdmin):
    """
    Custom Admin options for the Salon model.
    Configures list view, search, filters, and form layout for Salon instances.
    """
    # Fields shown in the list view in the admin dashboard
    list_display = ('name', 'location', 'sample_url', 'template', 'owner', 'claimed', 'contact_status')
    # Fields to enable search on in the list view
    search_fields = ('name', 'location', 'address', 'sample_url', 'owner__username') # Include owner username for search
    # Fields to add filters to the sidebar of the list view
    list_filter = ('template', 'claimed', 'contact_status', 'created_at', 'location') # Filter by template, status, etc.

    # Group fields into fieldsets for better organization on the add/edit form
    fieldsets = (
        (None, { # Basic Details section (no title)
            # Core identifying fields for the salon
            'fields': ('name', 'sample_url', 'owner', 'template')
        }),
        ('Contact Details', {
            # Fields related to how customers can contact the salon
            'fields': ('location', 'address', 'phone_number', 'email', 'map_embed_url')
        }),
        ('Status & Claiming', {
            # Fields related to the state and ownership of the sample site
            'fields': ('claimed', 'claimed_at', 'contact_status'),
            'classes': ('collapse',), # Make this section collapsible
        }),
        ('Website Content (Text)', {
            # Text-based content fields that populate the website sections
            'fields': ('description', 'hero_subtitle', 'opening_hours', 'services_tagline', 'gallery_tagline', 'footer_about')
        }),
        ('Website Content (Images)', {
            # --- Add the new 'image' field here ---
            # Fields for uploading various images for the salon's website
            'fields': ('image', 'logo_image', 'cover_image', 'about_image', 'footer_logo_image'),
             'description': 'Upload images for the salon website sections.'
        }),
        ('Website Content (URLs)', {
            # Fields for external links
            'fields': ('booking_url', 'gallery_url', 'services_url'),
        }),
        ('Website Content (JSON Data)', {
            # JSONFields storing structured data
            'fields': ('services', 'gallery_images', 'testimonials', 'social_links'),
             'description': 'Enter JSON data for services, gallery images, testimonials, and social links. Use the format specified in model help text.'
        }),
        ('Timestamps', {
            # Auto-generated timestamps
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',), # Make this section collapsible
        }),
    )

    # Fields that should be displayed but not editable in the form
    readonly_fields = (
        'sample_url', # Usually auto-generated or set once, not edited manually
        'owner', # Owner is typically assigned programmatically (e.g., during claim)
        'claimed', # Status is changed via specific actions/logic
        'claimed_at', # Timestamp is set automatically
        'created_at', # Auto-generated
        'updated_at', # Auto-updated
        # Image fields are read-only in the default ModelForm if not explicitly listed
        # but listing them here ensures they are always read-only regardless of form overrides
        # 'image', 'logo_image', 'cover_image', 'about_image', 'footer_logo_image',
    )

    # If you want to use a custom form (e.g., for better JSON widget)
    # form = SalonAdminForm


# Register your models with the custom admin classes
admin.site.register(Template, TemplateAdmin) # Register Template with its custom admin class
admin.site.register(Salon, SalonAdmin)       # Register Salon with its custom admin class