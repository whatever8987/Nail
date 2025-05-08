import os
from pathlib import Path
from dotenv import load_dotenv
import stripe # <<< Added import
from datetime import timedelta
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file in project root ONCE
load_dotenv(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-fallback-key-set-in-env')

DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['localhost', '127.0.0.1'] # Add production hosts later

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic', # Helps serve static files correctly with runserver + whitenoise
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework_simplejwt.token_blacklist',
    'rest_framework_simplejwt',
    'rest_framework',
    'drf_spectacular',
    'corsheaders',
    # Your apps
    'users.apps.UsersConfig',
    'salons.apps.SalonsConfig',
    'blog.apps.BlogConfig',
    'payments.apps.PaymentsConfig',
    'core.apps.CoreConfig',
    'chatbot.apps.ChatbotConfig',
    'tracking.apps.TrackingConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware', # Place CORS high
    'whitenoise.middleware.WhiteNoiseMiddleware', # Place after security, before session
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'tracking.middleware.VisitorTrackingMiddleware',
    
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates'),
            os.path.join(BASE_DIR, 'frontend/dist'), # Find React index.html
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

LANGUAGES = [
    ('en', ('English')),
    ('es', ('Spanish')),
    ('vi', ('Vietnamese')), # <<< Add Vietnamese here
    # Add other languages here
]


LOCALE_PATHS = [
    BASE_DIR / 'locale', # Python 3.4+ Path object syntax
    # If using older Python or prefer string path:
    # os.path.join(BASE_DIR, 'locale'),
]


# Static files
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'), # For Django's project-level static files ONLY
    # <<< REMOVED frontend/dist/assets - collectstatic handles this >>>
]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles') # Simplified path for collected files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Auth
AUTH_USER_MODEL = 'users.User'

# DRF
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        # REMOVE SessionAuthentication, TokenAuthentication
        'rest_framework_simplejwt.authentication.JWTAuthentication', # <<< ONLY JWT
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PERMISSION_CLASSES': [
        # Choose one based on your API's needs:
        'rest_framework.permissions.IsAuthenticated',
        # OR
        # 'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 10
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60), # e.g., 1 hour
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),   # e.g., 1 week
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,          # Requires blacklist app
    "UPDATE_LAST_LOGIN": True,

    "ALGORITHM": "HS256",
    # "SIGNING_KEY": settings.SECRET_KEY, # Default uses settings.SECRET_KEY

    "AUTH_HEADER_TYPES": ("Bearer",),       # Standard "Bearer <token>"
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",

    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",

    # These serializers are used by the token views
    "TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainPairSerializer",
    "TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSerializer",
    "TOKEN_VERIFY_SERIALIZER": "rest_framework_simplejwt.serializers.TokenVerifySerializer",
    "TOKEN_BLACKLIST_SERIALIZER": "rest_framework_simplejwt.serializers.TokenBlacklistSerializer", # Requires blacklist app
}


# Stripe
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')

if not STRIPE_SECRET_KEY:
    print("\nWARNING: STRIPE_SECRET_KEY environment variable not set.\n")
if not STRIPE_WEBHOOK_SECRET:
    print("\nWARNING: STRIPE_WEBHOOK_SECRET environment variable not set. Webhooks will be insecure.\n")

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY
else:
    print("\nWARNING: Stripe API key not configured. Stripe integration will fail.\n")


SPECTACULAR_SETTINGS = {
    'TITLE': 'Salon API',
    'DESCRIPTION': 'API for managing salons and user accounts',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/',
}

# CORS - Cross-Origin Resource Sharing
CORS_ALLOW_ALL_ORIGINS = True
# OR whitelist specific domains:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://yourfrontend.com",
]

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'