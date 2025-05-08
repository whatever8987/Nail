from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'salons' # Good practice to have an app_name

# Create a router and register our viewsets with it.
# Basenames are good practice, especially when queryset might not directly
# imply the name or when you want explicit naming for reverse lookups.
router = DefaultRouter()
router.register(r'templates', views.TemplateViewSet, basename='template')
router.register(r'salons', views.SalonViewSet, basename='salon')

# The API URLs are determined automatically by the router, BUT
# we need to add our specific function-based view path explicitly.
urlpatterns = [
    # --- Custom Function View Path ---
    # Define the specific path for the preview *before* including the router URLs.
    # This ensures /api/templates/:id/preview/ matches this pattern first.
    path('templates/<int:id>/preview/', views.template_preview_view, name='template_preview'),

    # --- DRF Router URLs ---
    # Include the router URLs last. These will handle /templates/, /templates/{pk}/
    # and /salons/, /salons/{pk}/, plus the custom actions on SalonViewSet.
    # The router's generic /templates/{pk}/ pattern won't interfere with
    # /templates/{id}/preview/ because the preview path was matched first.
    path('', include(router.urls)),
]