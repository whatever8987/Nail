from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import F
from rest_framework.pagination import LimitOffsetPagination
from drf_spectacular.utils import (
    extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse
)
from drf_spectacular.types import OpenApiTypes

from .models import BlogPost, BlogComment
from .serializers import (
    BlogPostSerializer,
    BlogPostListSerializer,
    BlogCommentSerializer
)

class StandardResultsSetPagination(LimitOffsetPagination):
    default_limit = 10
    max_limit = 100

class BlogPostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing blog posts with nested comments.
    Uses slug for lookups and supports filtering by category, tags, and status.
    """
    serializer_class = BlogPostSerializer
    pagination_class = StandardResultsSetPagination
    lookup_field = 'slug'

    @extend_schema(
        tags=['Blog'],
        summary="List blog posts",
        description="""Returns paginated list of blog posts.
        Public posts are visible to all, drafts only to admins.
        Filterable by category, tags, and featured status.""",
        parameters=[
            OpenApiParameter(
                name='category',
                description='Filter by category slug',
                required=False,
                type=str,
                location=OpenApiParameter.QUERY
            ),
            OpenApiParameter(
                name='tag',
                description='Filter by tag name',
                required=False,
                type=str,
                location=OpenApiParameter.QUERY
            ),
            OpenApiParameter(
                name='featured',
                description='Filter featured posts (true/false)',
                required=False,
                type=bool,
                location=OpenApiParameter.QUERY
            ),
            OpenApiParameter(
                name='published',
                description='Filter by published status (admins only)',
                required=False,
                type=bool,
                location=OpenApiParameter.QUERY
            )
        ],
        responses={
            200: BlogPostListSerializer(many=True),
            400: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Invalid filter parameters"
            )
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Blog'],
        summary="Retrieve blog post",
        description="""Get full details of a blog post by slug.
        Automatically increments view count for published posts.""",
        responses={
            200: BlogPostSerializer,
            404: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Post not found"
            )
        }
    )
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.published and (not instance.published_at or instance.published_at <= timezone.now()):
            BlogPost.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
            instance.refresh_from_db(fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @extend_schema(
        tags=['Blog'],
        summary="Create blog post",
        description="Create a new blog post (admin only).",
        request=BlogPostSerializer,
        responses={
            201: BlogPostSerializer,
            400: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Invalid post data"
            ),
            403: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Forbidden - Admin access required"
            )
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        tags=['Blog'],
        summary="Update blog post",
        description="Update an existing blog post (admin only).",
        request=BlogPostSerializer,
        responses={
            200: BlogPostSerializer,
            400: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Invalid post data"
            ),
            403: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Forbidden - Admin access required"
            ),
            404: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Post not found"
            )
        }
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        tags=['Blog'],
        summary="Delete blog post",
        description="Delete a blog post (admin only).",
        responses={
            204: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="No content - Successfully deleted"
            ),
            403: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Forbidden - Admin access required"
            ),
            404: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Post not found"
            )
        }
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        tags=['Blog'],
        summary="List post comments",
        description="""List comments for a specific blog post.
        Only shows approved comments unless user is admin.""",
        responses={
            200: BlogCommentSerializer(many=True),
            404: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Post not found"
            )
        }
    )
    @action(detail=True, methods=['get'], url_path='comments', serializer_class=BlogCommentSerializer)
    def list_comments(self, request, slug=None):
        post = self.get_object()
        is_admin = request.user.is_authenticated and request.user.is_admin()
        comments_queryset = post.comments.select_related('user').order_by('created_at')
        if not is_admin:
            comments_queryset = comments_queryset.filter(approved=True)
        page = self.paginate_queryset(comments_queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(comments_queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        tags=['Blog'],
        summary="Create post comment",
        description="""Add a comment to a blog post.
        Anonymous comments are allowed but may require approval.""",
        request=BlogCommentSerializer,
        responses={
            201: BlogCommentSerializer,
            400: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Invalid comment data"
            ),
            404: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Post not found"
            )
        }
    )
    @action(detail=True, methods=['post'], url_path='comments', serializer_class=BlogCommentSerializer)
    def create_comment(self, request, slug=None):
        post = self.get_object()
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        user = request.user if request.user.is_authenticated else None
        serializer.save(post=post, user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        queryset = BlogPost.objects.select_related('author').prefetch_related('comments')
        is_admin = self.request.user.is_authenticated and self.request.user.is_admin()
        if not is_admin:
            queryset = queryset.filter(published=True, published_at__lte=timezone.now())
        else:
            published_param = self.request.query_params.get('published')
            if published_param is not None:
                is_published = published_param.lower() in ['true', '1', 'yes']
                queryset = queryset.filter(published=is_published)
        category = self.request.query_params.get('category')
        featured = self.request.query_params.get('featured')
        tag = self.request.query_params.get('tag')
        if category:
            queryset = queryset.filter(category=category)
        if featured is not None:
            is_featured = featured.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(featured=is_featured)
        if tag:
            queryset = queryset.filter(tags__contains=tag)
        return queryset.order_by('-published_at', '-created_at')

    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        return BlogPostSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'list_comments', 'create_comment']:
            permission_classes = [permissions.AllowAny]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(author=self.request.user)
        else:
            serializer.save()

class BlogCommentViewSet(viewsets.GenericViewSet):
    """
    API endpoint for comment moderation actions.
    Requires admin privileges.
    """
    queryset = BlogComment.objects.all()
    serializer_class = BlogCommentSerializer
    permission_classes = [permissions.IsAdminUser]

    @extend_schema(
        tags=['Blog'],
        summary="Approve comment",
        description="Approve a pending comment (admin only).",
        responses={
            200: BlogCommentSerializer,
            403: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Forbidden - Admin access required"
            ),
            404: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Comment not found"
            )
        }
    )
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        comment = self.get_object()
        if not comment.approved:
            comment.approved = True
            comment.save()
        serializer = self.get_serializer(comment)
        return Response(serializer.data)

    @extend_schema(
        tags=['Blog'],
        summary="Delete comment",
        description="Delete a comment (admin only).",
        responses={
            204: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="No content - Successfully deleted"
            ),
            403: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Forbidden - Admin access required"
            ),
            404: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description="Comment not found"
            )
        }
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)