# blog/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'blog'

# Create routers and register viewsets
router = DefaultRouter()
router.register(r'posts', views.BlogPostViewSet, basename='post')
router.register(r'comments', views.BlogCommentViewSet, basename='comment') # For moderation actions

urlpatterns = [
    path('', include(router.urls)),
]
# Router generates:
# /posts/
# /posts/{slug}/
# /posts/{slug}/comments/ (list_comments, create_comment actions)
# /comments/ (base for comment moderation router)
# /comments/{pk}/
# /comments/{pk}/approve/ (approve action)