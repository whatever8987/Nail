from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
# from django.urls import reverse
from django.utils.translation import gettext_lazy as _ # <<< Import this

# Using settings.AUTH_USER_MODEL is the standard way to refer to your user model
User = settings.AUTH_USER_MODEL

class Template(models.Model):
    """Represents a website design template."""
    name = models.CharField(
        max_length=100,
        verbose_name=_('Template Name') # <<< Marked verbose_name
    )
    description = models.TextField(
        blank=True,
        verbose_name=_('Description') # <<< Marked verbose_name
    )
    preview_image = models.ImageField(
        upload_to='media/',
        blank=True,
        null=True,
        default='/default.png',
        verbose_name=_('Preview Image') # <<< Marked verbose_name
    )
    # Features JSONField content itself is usually not translated by makemessages,
    # you'd translate the values when displaying on the frontend.
    features = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_('Features') # <<< Marked verbose_name
    )
    is_mobile_optimized = models.BooleanField(
        default=True,
        verbose_name=_('Is Mobile Optimized') # <<< Marked verbose_name
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Created At') # <<< Marked verbose_name
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Updated At') # <<< Marked verbose_name
    )

    class Meta:
        verbose_name = _("Template") # <<< Marked verbose_name
        verbose_name_plural = _("Templates") # <<< Marked verbose_name_plural


    def __str__(self):
        return self.name # Usually not translated

class Salon(models.Model):
    """Represents a single salon business."""
    CONTACT_STATUS_CHOICES = (
        ('notContacted', _('Not Contacted')), # <<< Marked choice
        ('contacted', _('Contacted')),       # <<< Marked choice
        ('interested', _('Interested')),     # <<< Marked choice
        ('notInterested', _('Not Interested')), # <<< Marked choice
        ('subscribed', _('Subscribed')),     # <<< Marked choice
    )

    # Core Details
    name = models.CharField(
        max_length=200,
        verbose_name=_('Salon Name') # <<< Marked verbose_name
    )
    location = models.CharField(
        max_length=200,
        help_text=_('e.g., City, State or Neighborhood'), # <<< Marked help_text
        verbose_name=_('Location') # <<< Marked verbose_name
    )
    address = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_('Address') # <<< Marked verbose_name
    )
    phone_number = models.CharField(
        max_length=25,
        blank=True,
        null=True,
        verbose_name=_('Phone Number') # <<< Marked verbose_name
    )
    email = models.EmailField(
        blank=True,
        null=True,
        verbose_name=_('Email Address') # <<< Marked verbose_name
    )

    # Website Content
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Description') # <<< Marked verbose_name
    )
    services = models.JSONField(
        default=list,
        blank=True,
        help_text=_('List of services, e.g., ["Manicure - $30", "Pedicure - $45"]'), # <<< Marked help_text
        verbose_name=_('Services') # <<< Marked verbose_name
    )
    opening_hours = models.TextField(
        blank=True,
        null=True,
        help_text=_('e.g., Mon-Fri: 9am-7pm\\nSat: 10am-5pm'), # <<< Marked help_text
        verbose_name=_('Opening Hours') # <<< Marked verbose_name
    )

    # Site Configuration & Ownership
    sample_url = models.SlugField(
        max_length=100,
        unique=True,
        blank=True,
        help_text=_('Unique URL-friendly identifier (leave blank to auto-generate)'), # <<< Marked help_text
        verbose_name=_('Sample URL') # <<< Marked verbose_name
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='owned_salons',
        blank=True,
        null=True,
        verbose_name=_('Owner') # <<< Marked verbose_name
    )
    template = models.ForeignKey(
        Template,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Template') # <<< Marked verbose_name
    )

    # Claiming & Status
    claimed = models.BooleanField(
        default=False,
        verbose_name=_('Claimed') # <<< Marked verbose_name
    )
    claimed_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name=_('Claimed At') # <<< Marked verbose_name
    )
    contact_status = models.CharField(
        max_length=20,
        choices=CONTACT_STATUS_CHOICES,
        default='notContacted',
        verbose_name=_('Contact Status') # <<< Marked verbose_name
    )

    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Created At') # <<< Marked verbose_name
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Updated At') # <<< Marked verbose_name
    )

    def save(self, *args, **kwargs):
        # Strings inside methods are usually not translated by makemessages
        # unless they are part of forms/serializers or explicitly marked with _()
        # The generated slug is data, not a UI string.
        if not self.sample_url:
            base_slug = slugify(f"{self.name}-{self.location.split(',')[0].strip()}")
            unique_slug = base_slug
            counter = 1
            while Salon.objects.filter(sample_url=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.sample_url = unique_slug
        super().save(*args, **kwargs)

    def __str__(self):
        # Usually not translated
        return self.name

    class Meta:
        # Translate verbose_name for the model itself
        verbose_name = _("Salon")
        verbose_name_plural = _("Salons")