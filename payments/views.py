# payments/views.py

import stripe # Stripe library should be initialized in settings.py
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import F
from rest_framework import views, viewsets, permissions, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from drf_spectacular.types import OpenApiTypes

from .models import SubscriptionPlan
from users.models import User
from core.models import Stats # Assuming Stats model is in core

# Import the serializers needed for documentation and potentially validation
from .serializers import (
    SubscriptionPlanSerializer,
    PaymentIntentRequestSerializer,
    PaymentIntentResponseSerializer,
    SubscriptionRequestSerializer,
    SubscriptionResponseSerializer,
    WebhookResponseSerializer
)


# --- Subscription Plan ViewSet ---
class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubscriptionPlan.objects.filter(is_active=True).order_by('price_cents')
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]


# --- Stripe Interaction Views ---
class CreatePaymentIntentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=PaymentIntentRequestSerializer,
        responses={
            200: PaymentIntentResponseSerializer,
            400: OpenApiTypes.OBJECT,
            401: OpenApiTypes.OBJECT,
            500: OpenApiTypes.OBJECT,
        },
        summary="Create Payment Intent",
        description="Initializes a Stripe Payment Intent for a one-time payment."
    )
    def post(self, request, *args, **kwargs):
        serializer = PaymentIntentRequestSerializer(data=request.data)
        if not serializer.is_valid():
             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        amount_cents = validated_data['amount_cents']
        description = validated_data.get('description', 'One-time payment')
        currency = validated_data.get('currency', 'usd').lower()
        user = request.user

        if not stripe.api_key:
             return Response({"error": "Stripe is not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            customer_id = user.stripe_customer_id
            if not customer_id:
                customer = stripe.Customer.create(
                    email=user.email,
                    name=user.username,
                    metadata={'user_id': user.id}
                )
                customer_id = customer.id
                User.objects.filter(pk=user.pk).update(stripe_customer_id=customer_id)
                user.refresh_from_db(fields=['stripe_customer_id'])

            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency,
                customer=customer_id,
                description=description,
                metadata={'user_id': user.id}
            )
            return Response({'clientSecret': intent.client_secret, 'intentId': intent.id})

        except stripe.error.StripeError as e:
            print(f"Stripe Error (PaymentIntent): {e}")
            return Response({"error": f"Stripe error: {e.user_message or str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error creating PaymentIntent: {e}")
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreateSubscriptionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=SubscriptionRequestSerializer,
        responses={
            200: SubscriptionResponseSerializer,
            400: OpenApiTypes.OBJECT,
            401: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT,
            500: OpenApiTypes.OBJECT,
        },
        summary="Create Subscription",
        description="Initiates a Stripe subscription for the selected plan."
    )
    def post(self, request, *args, **kwargs):
         serializer = SubscriptionRequestSerializer(data=request.data)
         if not serializer.is_valid():
              return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

         plan_pk = serializer.validated_data['plan_id']
         user = request.user

         if not stripe.api_key:
              return Response({"error": "Stripe is not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

         try:
             plan = get_object_or_404(SubscriptionPlan, pk=plan_pk, is_active=True)

             customer_id = user.stripe_customer_id
             if not customer_id:
                 customer = stripe.Customer.create(
                     email=user.email,
                     name=user.username,
                     metadata={'user_id': user.id}
                 )
                 customer_id = customer.id
                 User.objects.filter(pk=user.pk).update(stripe_customer_id=customer_id)
                 user.refresh_from_db(fields=['stripe_customer_id'])

             if user.stripe_subscription_id:
                 try:
                     existing_sub = stripe.Subscription.retrieve(user.stripe_subscription_id)
                     if existing_sub.status in ['active', 'trialing']:
                         if existing_sub.latest_invoice and \
                            existing_sub.latest_invoice.payment_intent and \
                            existing_sub.latest_invoice.payment_intent.status == 'requires_payment_method':
                              return Response({
                                  'subscriptionId': existing_sub.id,
                                  'clientSecret': existing_sub.latest_invoice.payment_intent.client_secret,
                                  'message': 'Existing subscription requires payment confirmation.'
                              }, status=status.HTTP_200_OK) # Send 200 but with message/secret
                         else:
                              return Response(
                                  {"error": f"User already has an '{existing_sub.status}' subscription."},
                                  status=status.HTTP_400_BAD_REQUEST
                              )
                 except stripe.error.InvalidRequestError:
                     User.objects.filter(pk=user.pk).update(stripe_subscription_id=None)
                     user.refresh_from_db(fields=['stripe_subscription_id'])

             subscription_params = {
                 'customer': customer_id,
                 'items': [{'price': plan.stripe_price_id}],
                 'payment_behavior': 'default_incomplete',
                 'expand': ['latest_invoice.payment_intent'],
                 'metadata': {'user_id': user.id, 'plan_id': plan.id}
             }
             if plan.trial_period_days > 0:
                 subscription_params['trial_period_days'] = plan.trial_period_days

             subscription = stripe.Subscription.create(**subscription_params)

             User.objects.filter(pk=user.pk).update(stripe_subscription_id=subscription.id)

             # Optional Stats Update - more reliable via webhook
             # if Stats and F and subscription.status in ['active', 'trialing']:
             #     try:
             #         Stats.objects.filter(pk=1).update(active_subscriptions=F('active_subscriptions') + 1)
             #     except Stats.DoesNotExist: pass # Or log

             client_secret = None
             if subscription.latest_invoice and subscription.latest_invoice.payment_intent:
                 client_secret = subscription.latest_invoice.payment_intent.client_secret

             return Response({
                 'subscriptionId': subscription.id,
                 'clientSecret': client_secret
             })

         except SubscriptionPlan.DoesNotExist:
             return Response({"error": "Selected plan not found or is inactive."}, status=status.HTTP_404_NOT_FOUND)
         except stripe.error.StripeError as e:
             print(f"Stripe Error (Subscription): {e}")
             if isinstance(e, stripe.error.InvalidRequestError) and 'No such price' in str(e):
                  error_msg = f"Stripe error: Invalid Price ID ('{plan.stripe_price_id}'). Please check Stripe configuration."
             else:
                 error_msg = f"Stripe error: {e.user_message or str(e)}"
             return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)
         except Exception as e:
             print(f"Error creating Subscription: {e}")
             return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- Stripe Webhook Handler ---
@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={200: WebhookResponseSerializer},
        summary="Stripe Webhook Handler",
        description="Receives and processes events sent from Stripe."
    )
    def post(self, request, format=None):
        payload = request.body
        sig_header = request.headers.get('Stripe-Signature')
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

        if not endpoint_secret:
             print("ERROR: Stripe webhook secret is not configured in settings.")
             return Response({"error": "Webhook secret not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if not sig_header:
             return Response({"error": "Missing Stripe-Signature header."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError as e:
            print(f"Webhook ValueError: {e}")
            return Response({"error": "Invalid payload"}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            print(f"Webhook SignatureVerificationError: {e}")
            return Response({"error": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
             print(f"Webhook general error during construction: {e}")
             return Response({"error": "Webhook processing error"}, status=status.HTTP_400_BAD_REQUEST)

        event_type = event['type']
        data_object = event['data']['object']

        print(f"Received Stripe webhook: {event_type}, Event ID: {event['id']}")

        user_id = data_object.get('metadata', {}).get('user_id')
        customer_id = data_object.get('customer')

        if not user_id and customer_id and isinstance(customer_id, str):
             try:
                 customer = stripe.Customer.retrieve(customer_id)
                 user_id = customer.get('metadata', {}).get('user_id')
             except stripe.error.StripeError as e:
                 print(f"Webhook Error: Could not retrieve customer {customer_id} to find user_id: {e}")

        if event_type.startswith('customer.subscription.'):
            sub_id = data_object['id']
            sub_status = data_object['status']
            print(f"Handling subscription event: Sub ID: {sub_id}, Status: {sub_status}, UserID: {user_id}")
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                    if sub_status in ['canceled', 'unpaid', 'incomplete_expired']:
                        if user.stripe_subscription_id == sub_id:
                            User.objects.filter(id=user_id).update(stripe_subscription_id=None)
                            print(f"Cleared subscription ID for user {user_id} due to status {sub_status}")
                            # Optional Stats Update
                            # if Stats and F: try: Stats.objects.filter(pk=1).update(active_subscriptions=F('active_subscriptions') - 1) except Stats.DoesNotExist: pass

                    elif sub_status == 'active':
                         if user.stripe_subscription_id != sub_id:
                             User.objects.filter(id=user_id).update(stripe_subscription_id=sub_id)
                             print(f"Set active subscription ID {sub_id} for user {user_id}")
                         # Optional Stats Update
                         # if Stats and F: try: Stats.objects.filter(pk=1).update(active_subscriptions=F('active_subscriptions') + 1) # Needs logic for idempotency
                except User.DoesNotExist:
                    print(f"Webhook Error: User with ID {user_id} not found for subscription {sub_id}")
            else:
                print(f"Webhook Warning: No user_id found in metadata for subscription {sub_id}")

        elif event_type == 'payment_intent.succeeded':
            intent = data_object
            print(f"PaymentIntent succeeded: {intent['id']}, Amount: {intent['amount']}, UserID: {user_id}")

        elif event_type == 'payment_intent.payment_failed':
            intent = data_object
            print(f"PaymentIntent failed: {intent['id']}, UserID: {user_id}, Reason: {intent.get('last_payment_error', {}).get('message')}")

        elif event_type == 'invoice.payment_succeeded':
            invoice = data_object
            sub_id = invoice.get('subscription')
            print(f"Invoice payment succeeded: {invoice['id']}, Subscription: {sub_id}, UserID: {user_id}")

        elif event_type == 'invoice.payment_failed':
            invoice = data_object
            sub_id = invoice.get('subscription')
            print(f"Invoice payment failed: {invoice['id']}, Subscription: {sub_id}, UserID: {user_id}")

        else:
            print(f'Webhook Info: Unhandled event type {event_type}')

        return Response({'received': True})