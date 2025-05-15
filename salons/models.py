# salon_app/models.py

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
# Make sure you import timezone for the claimed_at logic
# from django.utils import timezone # Ensure this is imported if not already

# Using settings.AUTH_USER_MODEL is the standard way to refer to your user model
User = settings.AUTH_USER_MODEL

# salon_app/models.py (Your Template model remains the same)
class Template(models.Model):
    name = models.CharField(max_length=100, verbose_name=_('Template Name'))
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    preview_image = models.ImageField(
        upload_to='templates/previews/',
        blank=True,
        null=True
    )
    # Assuming you added these fields back based on previous discussions
    primary_color = models.CharField(max_length=7, blank=True, null=True, verbose_name=_('Primary Color'))
    secondary_color = models.CharField(max_length=7, blank=True, null=True, verbose_name=_('Secondary Color'))
    font_family = models.CharField(max_length=50, blank=True, null=True, verbose_name=_('Font Family'))
    background_color = models.CharField(max_length=7, blank=True, null=True, verbose_name=_('Background Color'))
    text_color = models.CharField(max_length=7, blank=True, null=True, verbose_name=_('Text Color'))
    default_cover_image = models.CharField(max_length=255, blank=True, null=True, verbose_name=_('Default Cover Image URL'))
    default_about_image = models.CharField(max_length=255, blank=True, null=True, verbose_name=_('Default About Image URL'))
    features = models.JSONField(default=dict, blank=True, verbose_name=_('Template Features'))
    is_mobile_optimized = models.BooleanField(default=True, verbose_name=_('Is Mobile Optimized'))


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Template")
        verbose_name_plural = _("Templates")


class Salon(models.Model):
    """Represents a single salon business."""
    CONTACT_STATUS_CHOICES = (
        ('notContacted', _('Not Contacted')),
        ('contacted', _('Contacted')),
        ('interested', _('Interested')),
        ('notInterested', _('Not Interested')),
        ('subscribed', _('Subscribed')),
    )

    # Core Details (Existing)
    name = models.CharField(max_length=200, verbose_name=_('Salon Name'))
    location = models.CharField(max_length=200, help_text=_('e.g., City, State or Neighborhood'), verbose_name=_('Location'))
    address = models.CharField(max_length=255, blank=True, null=True, verbose_name=_('Address'))
    phone_number = models.CharField(max_length=25, blank=True, null=True, verbose_name=_('Phone Number'))
    email = models.EmailField(blank=True, null=True, verbose_name=_('Email Address'))
    image = models.ImageField(
        upload_to='media/',
        blank=True,
        null=True,
        default='media/default.png',
        verbose_name=_('Image')
    )

    # Website Content
    description = models.TextField(blank=True, null=True, verbose_name=_('Description'))
    services = models.JSONField(default=list, blank=True, help_text=_('List of services'), verbose_name=_('Services'))
    opening_hours = models.TextField(blank=True, null=True, help_text=_('e.g., Mon-Fri: 9am-7pm\\nSat: 10am-5pm'), verbose_name=_('Opening Hours'))

    # New Content Fields for Templates
    logo_image = models.ImageField(upload_to='salon_logos/', blank=True, null=True, verbose_name=_('Logo Image'))
    cover_image = models.ImageField(upload_to='salon_covers/', blank=True, null=True, verbose_name=_('Cover Image'))
    about_image = models.ImageField(upload_to='salon_about/', blank=True, null=True, verbose_name=_('About Image'))
    footer_logo_image = models.ImageField(upload_to='salon_logos/', blank=True, null=True, verbose_name=_('Footer Logo Image'))

    hero_subtitle = models.CharField(max_length=255, blank=True, null=True, help_text=_('Subtitle'), verbose_name=_('Hero Subtitle'))
    services_tagline = models.CharField(max_length=255, blank=True, null=True, help_text=_('Services header description'), verbose_name=_('Services Tagline'))
    gallery_tagline = models.CharField(max_length=255, blank=True, null=True, help_text=_('Gallery header description'), verbose_name=_('Gallery Tagline'))
    footer_about = models.TextField(blank=True, null=True, help_text=_('About text in footer'), verbose_name=_('Footer About'))

    booking_url = models.URLField(max_length=200, blank=True, null=True, help_text=_('Online booking URL'), verbose_name=_('Booking URL'))
    gallery_url = models.URLField(max_length=200, blank=True, null=True, help_text=_('Full gallery page URL'), verbose_name=_('Gallery URL'))
    services_url = models.URLField(max_length=200, blank=True, null=True, help_text=_('Full services menu URL'), verbose_name=_('Services URL'))
    map_embed_url = models.URLField(max_length=500, blank=True, null=True, help_text=_('Map embed URL'), verbose_name=_('Map Embed URL'))

    gallery_images = models.JSONField(default=list, blank=True, help_text=_('List of image URLs for gallery'), verbose_name=_('Gallery Images'))
    testimonials = models.JSONField(default=list, blank=True, help_text=_('List of testimonials'), verbose_name=_('Testimonials'))
    social_links = models.JSONField(default=list, blank=True, help_text=_('List of social media links'), verbose_name=_('Social Links'))

    # Site Configuration & Ownership
    sample_url = models.SlugField(max_length=100, unique=True, blank=True, help_text=_('Unique URL-friendly identifier (leave blank to auto-generate)'), verbose_name=_('Sample URL'))
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='owned_salons', blank=True, null=True, verbose_name=_('Owner'))
    template = models.ForeignKey(Template, on_delete=models.SET_NULL, related_name='salons', blank=True, null=True, verbose_name=_('Template'))

    # Claiming & Status
    claimed = models.BooleanField(default=False, verbose_name=_('Claimed'))
    claimed_at = models.DateTimeField(blank=True, null=True, verbose_name=_('Claimed At'))
    contact_status = models.CharField(max_length=20, choices=CONTACT_STATUS_CHOICES, default='notContacted', verbose_name=_('Contact Status'))

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    def save(self, *args, **kwargs):
        # Only generate slug if it doesn't exist
        if not self.sample_url:
            # --- UPDATED SLUG GENERATION LOGIC ---
            base_slug_source = self.name # Start with just the name

            # Add the first part of the location if it exists and is not empty
            if self.location:
                 location_part = ""
                 try:
                     # Attempt to split by comma and take the first part
                     location_part = self.location.split(',')[0].strip()
                 except IndexError:
                     # If there's no comma, just use the whole location string
                     location_part = self.location.strip()

                 # Only append location part if it's a non-empty string
                 if location_part:
                     base_slug_source = f"{self.name}-{location_part}"

            # Generate the initial slug from the constructed source string
            base_slug = slugify(base_slug_source)

            # Fallback if the base slug is empty (e.g., name was problematic for slugify)
            if not base_slug:
                 import random # Need random
                 import string # Need string
                 # Use a generic prefix + random characters
                 base_slug = slugify(f"salon-{''.join(random.choices(string.ascii_lowercase + string.digits, k=6))}")


            # Ensure uniqueness
            unique_slug = base_slug
            counter = 1
            # When checking for existing slugs, exclude the current object if it already has a primary key (i.e., it's being updated)
            while Salon.objects.filter(sample_url=unique_slug).exclude(pk=self.pk).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1

            self.sample_url = unique_slug
            # --- END UPDATED SLUG GENERATION LOGIC ---

        # Automatically set claimed_at if the salon is marked as claimed for the first time
        if self.claimed and self.claimed_at is None:
             # Ensure timezone is imported (from django.utils import timezone)
             self.claimed_at = timezone.now()

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Salon")
        verbose_name_plural = _("Salons")