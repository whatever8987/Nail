# backend/urls.py

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from payments import views as payment_views # Keep for webhook
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from chatbot.views import chat as chatbot_chat_view 
# --- Import Simple JWT Views ---
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Group all authentication related endpoints under /api/auth/
    path('api/', include(([
        # --- Simple JWT Token Endpoints ---
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # POST username/password -> Get tokens
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # POST refresh_token -> Get new access_token
        path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),    # POST token -> Verify token validity

        # --- Custom User Management Endpoints (from users.urls) ---
        # These are now also under /api/auth/
        path('', include('users.urls')), # Include register, profile, change-password

    ], 'auth'), namespace='auth-api')), # Namespace for the whole auth group


    # --- Other App APIs ---
    # This include brings in the urlpatterns from salons/urls.py
    # The 'api/' prefix here combined with the paths in salons/urls.py
    # results in the full URLs:
    # /api/templates/<int:id>/preview/  (From the explicit path)
    # /api/templates/                    (From the router)
    # /api/templates/<pk>/               (From the router)
    # /api/salons/                       (From the router)
    # /api/salons/<pk>/                  (From the router)
    # /api/salons/sample/<sample_url>/   (From the router action)
    # etc.
    path('api/', include('salons.urls', namespace='salons-api')),

    path('api/blog/', include('blog.urls', namespace='blog-api')),
    path('api/payments/', include('payments.urls_api', namespace='payments-api')),
    path('api/core/', include('core.urls', namespace='core-api')),
    path('api/chat/', chatbot_chat_view, name='chat_endpoint'), 
    path('api/tracking/', include('tracking.urls_api', namespace='tracking-api')),

    # --- Schema ---
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # --- Stripe Webhook ---
    path('stripe/webhook/', payment_views.StripeWebhookView.as_view(), name='stripe-webhook'),

    # --- Frontend / SSR (Optional) ---
    # re_path(r'^app/.*$', TemplateView.as_view(template_name='index.html'), name='react-app'),
    # path('', blog_views.home, name='home'), # Assuming blog_views is imported if used
]

# --- Debug Media/Static ---
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)