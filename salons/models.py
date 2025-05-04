# salons/models.py
from django.db import models
from django.conf import settings # To reference the AUTH_USER_MODEL
from django.utils import timezone
from django.utils.text import slugify

# Using settings.AUTH_USER_MODEL is the standard way to refer to your user model
User = settings.AUTH_USER_MODEL

class Template(models.Model):
    """Represents a website design template."""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    preview_image_url = models.URLField(max_length=500, blank=True, null=True)
    # Using JSONField requires PostgreSQL or SQLite >= 3.9
    # Alternatively, use a TextField and handle parsing/serialization
    features = models.JSONField(default=list, blank=True)
    is_mobile_optimized = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Salon(models.Model):
    """Represents a single salon business."""
    CONTACT_STATUS_CHOICES = (
        ('notContacted', 'Not Contacted'),
        ('contacted', 'Contacted'),
        ('interested', 'Interested'),
        ('notInterested', 'Not Interested'),
        ('subscribed', 'Subscribed'), # Example if they become a customer
    )

    # Core Details
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200, help_text="e.g., City, State or Neighborhood")
    address = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=25, blank=True, null=True) # Allow blank for sample sites
    email = models.EmailField(blank=True, null=True) # Allow blank for sample sites

    # Website Content
    description = models.TextField(blank=True, null=True)
    services = models.JSONField(default=list, blank=True, help_text="List of services, e.g., ['Manicure - $30', 'Pedicure - $45']")
    opening_hours = models.TextField(blank=True, null=True, help_text="e.g., Mon-Fri: 9am-7pm\\nSat: 10am-5pm")

    # Site Configuration & Ownership
    sample_url = models.SlugField(
        max_length=100, unique=True, blank=True, # Allow blank initially, set on save
        help_text="Unique URL-friendly identifier (leave blank to auto-generate)"
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL, # Keep salon even if owner deleted, set owner to NULL
        related_name='owned_salons',
        blank=True,
        null=True
    )
    template = models.ForeignKey(
        Template,
        on_delete=models.SET_NULL, # Keep salon even if template deleted
        blank=True,
        null=True
    )

    # Claiming & Status
    claimed = models.BooleanField(default=False)
    claimed_at = models.DateTimeField(blank=True, null=True)
    contact_status = models.CharField(
        max_length=20,
        choices=CONTACT_STATUS_CHOICES,
        default='notContacted'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-generate sample_url if it's blank
        if not self.sample_url:
            base_slug = slugify(f"{self.name}-{self.location.split(',')[0].strip()}")
            unique_slug = base_slug
            counter = 1
            # Ensure uniqueness
            while Salon.objects.filter(sample_url=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.sample_url = unique_slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name