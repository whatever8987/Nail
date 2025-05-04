# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError # For custom validation

UserModel = get_user_model()
from rest_framework import serializers

class LoginRequestSerializer(serializers.Serializer): # For documenting request body
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, style={'input_type': 'password'})

class LogoutResponseSerializer(serializers.Serializer): # For documenting response body
    message = serializers.CharField()
    

class UserSerializer(serializers.ModelSerializer):
    """Serializer for displaying User information (read-only for sensitive fields)."""
    class Meta:
        model = UserModel
        # List fields to expose (exclude password!)
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role')
        # Protect role, it shouldn't be updated directly via the general profile update
        read_only_fields = ('role',)

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password], style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm Password", style={'input_type': 'password'})

    class Meta:
        model = UserModel
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 'phone_number')
        extra_kwargs = {
            # Make optional fields explicitly optional in the API
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'phone_number': {'required': False, 'allow_blank': True, 'allow_null': True}
        }

    def validate(self, attrs):
        # Check if passwords match
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Password fields didn't match."})

        # Note: Unique checks for username/email are handled by the model's unique=True,
        # DRF validation will raise an error automatically if they exist.
        # You could add explicit checks here if you preferred a different error message.
        # Example:
        # if UserModel.objects.filter(email=attrs['email']).exists():
        #     raise serializers.ValidationError({"email": "A user with that email already exists."})
        # if UserModel.objects.filter(username=attrs['username']).exists():
        #     raise serializers.ValidationError({"username": "A user with that username already exists."})

        return attrs

    def create(self, validated_data):
        # Create the user object
        user = UserModel.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number')
        )

        # Set the password correctly (hashes it)
        user.set_password(validated_data['password'])
        # Role defaults to 'user' as defined in the model
        user.save()
        return user

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change endpoint."""
    current_password = serializers.CharField(required=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, validators=[validate_password], style={'input_type': 'password'})
    new_password2 = serializers.CharField(required=True, label="Confirm New Password", style={'input_type': 'password'})

    def validate_new_password2(self, value):
        # Check if new passwords match
        if self.initial_data.get('new_password') != value:
             raise serializers.ValidationError("New passwords must match.")
        return value

# Optional: Serializer for general profile updates (if different from UserSerializer)
class UserProfileUpdateSerializer(serializers.ModelSerializer):
     class Meta:
         model = UserModel
         fields = ('first_name', 'last_name', 'phone_number') # Only allow updating these fields
         extra_kwargs = {
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'phone_number': {'required': False, 'allow_blank': True, 'allow_null': True}
        }