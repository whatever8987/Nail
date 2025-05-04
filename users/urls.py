# users/urls.py
from django.urls import path
from . import views

app_name = 'users' # Keep app_name for namespacing

urlpatterns = [
    # --- Keep these user management endpoints ---
    path('register/', views.RegisterView.as_view(), name='register'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
]