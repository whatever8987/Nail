# payments/models.py
from django.db import models

class SubscriptionPlan(models.Model):
    """Represents a subscribable plan offered to users."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    # Store price in the smallest currency unit (e.g., cents for USD) to avoid floating point issues
    # Or use DecimalField for more precision if needed. Let's use cents (integer).
    price_cents = models.PositiveIntegerField(help_text="Price in cents (e.g., 7900 for $79.00)")
    # Alternatively: price = models.DecimalField(max_digits=7, decimal_places=2) # e.g., 79.00

    currency = models.CharField(max_length=3, default='usd')
    # Using JSONField requires PostgreSQL or SQLite >= 3.9
    features = models.JSONField(default=list, blank=True, help_text="List of features included in the plan")

    # This MUST match a Price ID created in your Stripe Dashboard
    stripe_price_id = models.CharField(
        max_length=255,
        unique=True,
        help_text="Stripe Price ID (e.g., price_xxxxxxxxxxxx)"
    )
    trial_period_days = models.PositiveIntegerField(default=0, help_text="Number of trial days (0 for no trial)")
    is_active = models.BooleanField(default=True, help_text="Whether this plan is available for new subscriptions")
    is_popular = models.BooleanField(default=False, help_text="Mark as popular for highlighting in UI")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        # Display price nicely
        display_price = self.price_cents / 100.0
        # if using DecimalField: display_price = self.price
        return f"{self.name} (${display_price:.2f}/{self.currency.upper()})"

    @property
    def display_price(self):
         # Helper property to get formatted price
         return f"{self.price_cents / 100.0:.2f}"
         # if using DecimalField: return f"{self.price:.2f}"