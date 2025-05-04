# salons/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'salons'

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'templates', views.TemplateViewSet, basename='template')
router.register(r'salons', views.SalonViewSet, basename='salon')
# The router generates: /templates/, /templates/{pk}/, /salons/, /salons/{pk}/ etc.
# Custom actions are available at /salons/{pk}/claim/, /salons/contact-leads/, /salons/sample/{sample_url}/

# The API URLs are determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]