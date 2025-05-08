from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import chat

app_name = 'chatbot'

# Create a router and register our viewsets with it.
router = DefaultRouter()


urlpatterns = [
    path('', include(router.urls)),
]