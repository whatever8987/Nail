# salons/admin.py
from django.contrib import admin
from .models import Template, Salon

@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'is_mobile_optimized', 'created_at')
    search_fields = ('name', 'description')

@admin.register(Salon)
class SalonAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'owner', 'template', 'claimed', 'contact_status', 'sample_url', 'created_at')
    list_filter = ('claimed', 'contact_status', 'template', 'location')
    search_fields = ('name', 'location', 'email', 'sample_url', 'owner__username', 'owner__email')
    ordering = ('-created_at',)
    # Make sample_url read-only in admin after creation if desired
    readonly_fields = ('sample_url', 'created_at', 'updated_at', 'claimed_at')
    # Customize fieldsets for better layout in admin add/change forms
    fieldsets = (
        (None, {
            'fields': ('name', 'location', 'address', 'phone_number', 'email')
        }),
        ('Website Content', {
            'fields': ('description', 'services', 'opening_hours')
        }),
        ('Configuration & Ownership', {
            'fields': ('owner', 'template', 'sample_url')
        }),
         ('Status', {
            'fields': ('claimed', 'claimed_at', 'contact_status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',) # Keep timestamps collapsed by default
        }),
    )