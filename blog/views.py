# blog/views.py
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import F
from rest_framework.pagination import LimitOffsetPagination

from .models import BlogPost, BlogComment
from .serializers import (
    BlogPostSerializer,
    BlogPostListSerializer, # Import the list serializer
    BlogCommentSerializer
)

# Define custom pagination (optional, DRF has defaults)
class StandardResultsSetPagination(LimitOffsetPagination):
    default_limit = 10
    max_limit = 100

class BlogPostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Blog Posts. Supports CRUD, filtering, and comment management.
    Uses slug for detail lookups.
    """
    serializer_class = BlogPostSerializer # Default serializer for detail view
    pagination_class = StandardResultsSetPagination
    lookup_field = 'slug' # Use slug in URL instead of PK

    def get_queryset(self):
        """Determine the base queryset based on user permissions and query params."""
        queryset = BlogPost.objects.select_related('author').prefetch_related('comments') # Optimize queries

        # Check if the user is an admin
        is_admin = self.request.user.is_authenticated and self.request.user.is_admin()

        # Filter by published status unless admin
        if not is_admin:
            queryset = queryset.filter(published=True, published_at__lte=timezone.now())
        else:
            # Admins can optionally filter by published status
            published_param = self.request.query_params.get('published')
            if published_param is not None:
                 is_published = published_param.lower() in ['true', '1', 'yes']
                 queryset = queryset.filter(published=is_published)

        # Filtering based on query parameters
        category = self.request.query_params.get('category')
        featured = self.request.query_params.get('featured')
        tag = self.request.query_params.get('tag') # Example tag filter

        if category:
            queryset = queryset.filter(category=category)
        if featured is not None:
            is_featured = featured.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(featured=is_featured)
        if tag:
            # Assumes tags is a JSON list: ['tag1', 'tag2']
            queryset = queryset.filter(tags__contains=tag) # Basic contains filter

        return queryset.order_by('-published_at', '-created_at') # Order by publish date primarily

    def get_serializer_class(self):
        """Use a simpler serializer for the list action."""
        if self.action == 'list':
            return BlogPostListSerializer
        return BlogPostSerializer # Use full serializer for retrieve, create, update

    def get_permissions(self):
        """Assign permissions based on action."""
        if self.action in ['list', 'retrieve', 'list_comments', 'create_comment']:
            # Allow reading posts and comments, allow creating comments
            permission_classes = [permissions.AllowAny]
        elif self.action in ['create', 'update', 'partial_update', 'destroy', 'approve_comment', 'delete_comment']:
             # Only Admins can create/edit/delete posts or moderate comments
             permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAdminUser] # Default restrict
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Set the author automatically when creating a post."""
        if self.request.user.is_authenticated:
            serializer.save(author=self.request.user)
        else:
            # Should not happen if IsAdminUser permission is applied correctly
            serializer.save() # Or raise an error

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to increment view count."""
        instance = self.get_object() # Gets post by slug

        # Increment view count atomically only for published posts being viewed
        if instance.published and (not instance.published_at or instance.published_at <= timezone.now()):
             BlogPost.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
             instance.refresh_from_db(fields=['view_count']) # Get updated count

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    # --- Comment Actions (Nested within Post) ---

    # GET /api/blog/posts/{post_slug}/comments/
    @action(detail=True, methods=['get'], url_path='comments', serializer_class=BlogCommentSerializer)
    def list_comments(self, request, slug=None):
        """Lists comments for a specific blog post."""
        post = self.get_object() # Gets post by slug
        is_admin = request.user.is_authenticated and request.user.is_admin()

        comments_queryset = post.comments.select_related('user').order_by('created_at')

        # Filter unapproved unless user is admin
        if not is_admin:
            comments_queryset = comments_queryset.filter(approved=True)

        # Paginate comments if needed (using the viewset's pagination)
        page = self.paginate_queryset(comments_queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(comments_queryset, many=True)
        return Response(serializer.data)

    # POST /api/blog/posts/{post_slug}/comments/
    @action(detail=True, methods=['post'], url_path='comments', serializer_class=BlogCommentSerializer)
    def create_comment(self, request, slug=None):
        """Creates a new comment on a specific blog post."""
        post = self.get_object() # Gets post by slug
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request} # Pass request to serializer context
        )
        serializer.is_valid(raise_exception=True)

        # Determine user (logged-in or None for guest)
        user = request.user if request.user.is_authenticated else None
        serializer.save(post=post, user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# Separate ViewSet for Comment Moderation Actions by ID (Optional, but cleaner)
class BlogCommentViewSet(viewsets.GenericViewSet):
     """
     API endpoint for moderation actions on comments (approve, delete).
     Accessed via /api/blog/comments/{comment_pk}/action/
     Requires Admin permissions.
     """
     queryset = BlogComment.objects.all()
     serializer_class = BlogCommentSerializer
     permission_classes = [permissions.IsAdminUser]

     # POST /api/blog/comments/{pk}/approve/
     @action(detail=True, methods=['post'])
     def approve(self, request, pk=None):
         comment = self.get_object()
         if not comment.approved:
             comment.approved = True
             comment.save()
         serializer = self.get_serializer(comment)
         return Response(serializer.data)

     # DELETE /api/blog/comments/{pk}/
     def destroy(self, request, *args, **kwargs):
         """Deletes a blog comment."""
         instance = self.get_object()
         self.perform_destroy(instance)
         return Response(status=status.HTTP_204_NO_CONTENT)

     def perform_destroy(self, instance):
         instance.delete()