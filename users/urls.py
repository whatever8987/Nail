# users/urls.py
from django.urls import path
from . import views
from users.views import UpdateUserSalonView
app_name = 'users' # Keep app_name for namespacing

urlpatterns = [
    # --- Keep these user management endpoints ---
    path('register/', views.RegisterView.as_view(), name='register'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
]# users/urls.py

from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    RegisterView,
    UserProfileView,
    ChangePasswordView, # Assuming you have this view
    # Import any other views from your users app
)

urlpatterns = [
    # Authentication Endpoints using simplejwt views
    # These map to /api/auth/token/, /api/auth/token/refresh/, /api/auth/token/verify/
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # Handles POST for login
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # Handles POST for token refresh
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'), # Handles POST for token verification

    # User Registration (using your existing RegisterView)
    # This maps to /api/auth/register/
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('users/me/salon/', UpdateUserSalonView.as_view(), name='update_user_salon'),

    # User Profile (using your existing UserProfileView)
    # This maps to /api/auth/profile/
    path('user/me/', views.UserProfileView.as_view(), name='user-profile'),
    # Change Password (using your existing ChangePasswordView)
    # This maps to /api/auth/change-password/
    path('change-password/', ChangePasswordView.as_view(), name='auth_change_password'),

    # Include other user-related URLs here if you have them
]