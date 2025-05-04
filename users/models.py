# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Inherits username, password, email, first_name, last_name, is_staff, is_active, date_joined
    # Add your custom fields here

    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
        # Add other roles if needed
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    # Fields for Stripe (we'll use these later)
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    # subscription_status = models.CharField(max_length=20, blank=True, null=True) # Optional: track locally

    # Ensure email is unique if desired (good practice)
    email = models.EmailField(unique=True, blank=False) # Make email required and unique

    # Optional: Use email for login instead of username
    # USERNAME_FIELD = 'email'
    # REQUIRED_FIELDS = ['username'] # If using email as USERNAME_FIELD, username might still be needed depending on AbstractUser

    def is_admin(self):
        """Helper method to check if user is an admin based on role or superuser status"""
        return self.role == 'admin' or self.is_superuser or self.is_staff

    def __str__(self):
        return self.username # Or self.email if using email as primary identifier