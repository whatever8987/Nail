# users/views.py
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.contrib.auth import get_user_model
# Removed DRF Token import
# from rest_framework.authtoken.models import Token
from drf_spectacular.utils import extend_schema
# Removed Simple JWT imports if added previously, views are used in urls.py now

from .serializers import (
    UserSerializer,
    RegisterSerializer,
    ChangePasswordSerializer,
    UserProfileUpdateSerializer,
    # LoginRequestSerializer - No longer needed here, handled by TokenObtainPairView
    # LogoutResponseSerializer - No longer needed here
)

UserModel = get_user_model()

# ====================== REMOVED VIEWS ======================
# class LoginView(views.APIView): <--- REMOVED
#     ...

# class LogoutView(views.APIView): <--- REMOVED
#     ...


# ================== KEPT USER MANAGEMENT ==================
class RegisterView(generics.CreateAPIView):
    """Registers a new user."""
    queryset = UserModel.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer
    # Optional: Add schema decoration if desired
    @extend_schema(summary="User Registration")
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Gets or updates the profile of the currently authenticated user (using JWT).
    """
    permission_classes = (permissions.IsAuthenticated,) # Works with JWTAuthentication

    # Optional: Add schema decoration
    @extend_schema(summary="Retrieve User Profile", responses={200: UserSerializer})
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(summary="Update User Profile (Full)", request=UserProfileUpdateSerializer, responses={200: UserProfileUpdateSerializer})
    def put(self, request, *args, **kwargs):
         return super().put(request, *args, **kwargs)

    @extend_schema(summary="Update User Profile (Partial)", request=UserProfileUpdateSerializer, responses={200: UserProfileUpdateSerializer})
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    def get_object(self):
        # request.user is populated by JWTAuthentication
        return self.request.user

    def get_serializer_class(self):
        # Use UserSerializer for GET, UserProfileUpdateSerializer for PUT/PATCH
        if self.request.method == 'GET':
            return UserSerializer
        return UserProfileUpdateSerializer


class ChangePasswordView(generics.UpdateAPIView):
    """Changes the password for the currently authenticated user (using JWT)."""
    serializer_class = ChangePasswordSerializer
    permission_classes = (permissions.IsAuthenticated,) # Works with JWTAuthentication

    # Optional: Add schema decoration
    @extend_schema(summary="Change User Password")
    def put(self, request, *args, **kwargs):
         # PUT not strictly needed if only using UpdateAPIView's default update
         return self.update(request, *args, **kwargs)

    @extend_schema(summary="Change User Password (Partial - not typical)")
    def patch(self, request, *args, **kwargs):
         # PATCH not strictly needed if only using UpdateAPIView's default update
         return self.update(request, *args, **kwargs)


    def get_object(self):
        # request.user is populated by JWTAuthentication
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not user.check_password(serializer.validated_data["current_password"]):
            return Response(
                {"current_password": ["Wrong password."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        # Password change might invalidate refresh tokens depending on settings/logic
        # Consider blacklisting refresh tokens here if needed
        return Response({"message": "Password updated successfully."})