# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin # Import the base admin
from .models import User

# Define a custom UserAdmin to display your extra fields
class UserAdmin(BaseUserAdmin):
    # Add your custom fields to the display, search, and filter options
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'stripe_customer_id')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups', 'role')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)

    # Add custom fields to the fieldsets for the add/change forms
    # This adds a 'Custom Fields' section to the admin change form
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'phone_number', 'stripe_customer_id', 'stripe_subscription_id')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
         ('Custom Fields', {'fields': ('role', 'phone_number')}),
    )


# Register your custom user model with the custom admin options
admin.site.register(User, UserAdmin)