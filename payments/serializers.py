# payments/serializers.py

from rest_framework import serializers
from .models import SubscriptionPlan
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    display_price = serializers.SerializerMethodField()

    @extend_schema_field(OpenApiTypes.STR)
    def get_display_price(self, obj: SubscriptionPlan) -> str:
        """Calculates and returns the formatted price string."""
        if not isinstance(obj, SubscriptionPlan):
             return ""
        return f"{obj.price_cents / 100.0:.2f}"

    class Meta:
        model = SubscriptionPlan
        fields = (
            'id', 'name', 'description', 'price_cents', 'display_price',
            'currency', 'features', 'stripe_price_id', 'trial_period_days',
            'is_active', 'is_popular'
        )
        read_only_fields = (
            'id', 'display_price', 'is_active'
        )

class PaymentIntentRequestSerializer(serializers.Serializer):
    amount_cents = serializers.IntegerField(required=True, min_value=1)
    description = serializers.CharField(required=False)
    currency = serializers.CharField(required=False, max_length=3, default='usd')

class PaymentIntentResponseSerializer(serializers.Serializer):
    clientSecret = serializers.CharField()
    intentId = serializers.CharField()

class SubscriptionRequestSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField(required=True)

class SubscriptionResponseSerializer(serializers.Serializer):
    subscriptionId = serializers.CharField()
    clientSecret = serializers.CharField(required=False, allow_null=True)
    message = serializers.CharField(required=False)

class WebhookResponseSerializer(serializers.Serializer):
    received = serializers.BooleanField()