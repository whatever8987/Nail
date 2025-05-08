from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError  # For custom validation
from salons.models import Salon

UserModel = get_user_model()

# Add this class:
class MessageResponseSerializer(serializers.Serializer):
    """Serializer for simple success messages like {'message': '...'}"""
    message = serializers.CharField()


class LoginRequestSerializer(serializers.Serializer):
    """For documenting login request body in Swagger."""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, style={'input_type': 'password'})


class LogoutResponseSerializer(serializers.Serializer):
    """For documenting logout response body in Swagger."""
    message = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for displaying User information (read-only for sensitive fields)."""
    salon = serializers.StringRelatedField(read_only=True)  # Show salon name from __str__()

    class Meta:
        model = UserModel
        # List fields to expose (exclude password!)
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'salon')  # <-- Added 'salon'
        read_only_fields = ('role',)


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password], style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm Password", style={'input_type': 'password'})

    class Meta:
        model = UserModel
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 'phone_number')
        extra_kwargs = {
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'phone_number': {'required': False, 'allow_blank': True, 'allow_null': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = UserModel.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change endpoint."""
    current_password = serializers.CharField(required=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, validators=[validate_password], style={'input_type': 'password'})
    new_password2 = serializers.CharField(required=True, label="Confirm New Password", style={'input_type': 'password'})

    def validate_new_password2(self, value):
        if self.initial_data.get('new_password') != value:
            raise serializers.ValidationError("New passwords must match.")
        return value


# Optional: Serializer for general profile updates (if different from UserSerializer)
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    salon = serializers.PrimaryKeyRelatedField(
        queryset=Salon.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = UserModel
        fields = ('first_name', 'last_name', 'phone_number', 'salon')  # <-- 'salon' included here
        extra_kwargs = {
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'phone_number': {'required': False, 'allow_blank': True, 'allow_null': True}
        }