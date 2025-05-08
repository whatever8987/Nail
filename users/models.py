from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _ # <<< Import this

class User(AbstractUser):
    # Inherits username, password, email, first_name, last_name, is_staff, is_active, date_joined
    # Add your custom fields here

    ROLE_CHOICES = (
        ('user', _('User')),  # <<< Marked
        ('admin', _('Admin')), # <<< Marked
        # Add other roles if needed
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='user',
        verbose_name=_('Role') # <<< Marked verbose_name
    )
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name=_('Phone Number') # <<< Marked verbose_name
    )
    salon = models.ForeignKey(
        'salons.Salon',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Salon') # <<< Marked verbose_name
    )

    # Fields for Stripe (we'll use these later)
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True) # No need to translate internal IDs
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True) # No need to translate internal IDs

    # Ensure email is unique if desired (good practice)
    email = models.EmailField(
        unique=True,
        blank=False,
        verbose_name=_('Email Address') # <<< Marked verbose_name
    )

    # Optional: Use email for login instead of username
    # USERNAME_FIELD = 'email'
    # REQUIRED_FIELDS = ['username']

    def is_admin(self):
        """Helper method to check if user is an admin based on role or superuser status"""
        # No user-facing strings here, no translation needed
        return self.role == 'admin' or self.is_superuser or self.is_staff

    def __str__(self):
        # __str__ methods are often for internal/admin display,
        # but can be translated if used in user-facing contexts.
        # For a simple username, it's usually not translated.
        return self.username
        # If you wanted to translate "User: username":
        # return _("User: %(username)s") % {'username': self.username}

    class Meta:
        # You might want to translate verbose_name for the model itself
        verbose_name = _("User")
        verbose_name_plural = _("Users")