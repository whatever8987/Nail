from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiParameter, OpenApiResponse, OpenApiTypes

# Import the new serializer from your serializers.py
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    ChangePasswordSerializer,
    UserProfileUpdateSerializer,
    MessageResponseSerializer,  # <--- Make sure MessageResponseSerializer is imported
)
from core.serializers import ErrorSerializer # Assuming ErrorSerializer is in core app

UserModel = get_user_model()
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileUpdateSerializer


class UpdateUserSalonView(generics.UpdateAPIView):
    """Updates only the salon assignment of the authenticated user."""
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileUpdateSerializer

    def get_object(self):
        return self.request.user

    @extend_schema(
        summary="Update User Salon",
        description="Assign or update the salon associated with the current user.",
        request=UserProfileUpdateSerializer,
        responses={
            200: UserProfileUpdateSerializer,
            400: OpenApiResponse(ErrorSerializer, description="Bad Request - Invalid data")
        }
    )
    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def perform_update(self, serializer):
        # Only update the salon field
        salon = serializer.validated_data.get('salon')
        if salon is not None:
            serializer.save(salon=salon)
# ====================== REMOVED VIEWS ======================
# ... (Keep this comment or your actual removed code if it was present) ...


# ================== KEPT USER MANAGEMENT ==================

# Keep your RegisterView exactly as it is:
class RegisterView(generics.CreateAPIView):
    """Registers a new user."""
    queryset = UserModel.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    @extend_schema(
        summary="User Registration",
        description="Creates a new user account with the provided details.",
        request=RegisterSerializer,
        responses={
            201: RegisterSerializer,
            400: OpenApiResponse(ErrorSerializer, description="Bad Request - Invalid input")
        },
        examples=[
            OpenApiExample(
                'Example Request',
                value={
                    "username": "newuser",
                    "email": "user@example.com",
                    "password": "securepassword123",
                    "password2": "securepassword123"
                },
                request_only=True
            ),
            OpenApiExample(
                'Success Response',
                value={
                    "username": "newuser",
                    "email": "user@example.com"
                },
                response_only=True,
                status_codes=['201']
            )
        ]
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


# Keep your UserProfileView exactly as it is:
class UserProfileView(generics.RetrieveUpdateAPIView):
    """Gets or updates the profile of the currently authenticated user."""
    
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    @extend_schema(
        summary="Retrieve User Profile",
        description="Returns all profile details for the authenticated user.",
        responses={200: UserSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update User Profile (Full)",
        description="Completely replaces the user's profile information.",
        request=UserProfileUpdateSerializer,
        responses={
            200: UserProfileUpdateSerializer,
            400: OpenApiResponse(ErrorSerializer, description="Bad Request - Invalid data")
        }
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @extend_schema(
        summary="Update User Profile (Partial)",
        description="Partially updates the user's profile information.",
        request=UserProfileUpdateSerializer,
        responses={
            200: UserProfileUpdateSerializer,
            400: OpenApiResponse(ErrorSerializer, description="Bad Request - Invalid data")
        }
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


# --- MODIFY THE CHANGE PASSWORD VIEW ---
class ChangePasswordView(generics.UpdateAPIView):
    """Changes the password for the currently authenticated user (using JWT)."""
    serializer_class = ChangePasswordSerializer
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(
        summary="Change User Password",
        responses={
            # --- CHANGE THIS LINE ---
            # Use the MessageResponseSerializer to define the schema for the 200 OK response
            200: MessageResponseSerializer, # This tells drf-spectacular to expect the schema defined by this serializer
            400: OpenApiResponse(ErrorSerializer, description="Bad Request - Invalid input")
        }
        # You can optionally add a response description here if you didn't put it in the serializer
        # response_description="Password updated successfully.",
    )
    def put(self, request, *args, **kwargs):
        # Keep the existing logic that calls update
        return self.update(request, *args, **kwargs)


    @extend_schema(
        summary="Change User Password (Partial - not typical)",
        responses={
            # --- CHANGE THIS LINE ---
            # Use the same serializer for consistency on the PATCH method
            200: MessageResponseSerializer, # This tells drf-spectacular to expect the schema defined by this serializer
            400: OpenApiResponse(ErrorSerializer, description="Bad Request - Invalid input")
        }
        # You can optionally add a response description here if you didn't put it in the serializer
        # response_description="Password updated successfully.",
    )
    def patch(self, request, *args, **kwargs):
        # Keep the existing logic that calls update
        return self.update(request, *args, **kwargs)

    # Keep get_object and update methods exactly as they were,
    # as they correctly return {'message': '...'} which matches the serializer structure.
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
        # Consider token invalidation logic here if needed
        # This response body {'message': '...'} correctly matches the MessageResponseSerializer structure
        return Response({"message": "Password updated successfully."})