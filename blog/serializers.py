# blog/serializers.py
from rest_framework import serializers
from .models import BlogPost, BlogComment
from users.serializers import UserSerializer # To show author/commenter details

class BlogCommentSerializer(serializers.ModelSerializer):
    # Display user details if comment is by a registered user
    user = UserSerializer(read_only=True)
    # Allow name/email to be provided for guest comments during creation
    name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = BlogComment
        fields = ('id', 'post', 'user', 'name', 'email', 'content', 'approved', 'created_at')
        read_only_fields = ('approved', 'created_at', 'user', 'updated_at')
        # 'post' will usually be determined by the URL, not sent in the body for creation
        extra_kwargs = {
            'post': {'write_only': True, 'required': False}
        }

    def validate(self, data):
        # Access the request context if passed from the view
        request = self.context.get('request')
        is_authenticated = request and request.user.is_authenticated

        # Require name and email for guest comments
        if not is_authenticated:
            if not data.get('name'):
                raise serializers.ValidationError({"name": "This field is required for guest comments."})
            if not data.get('email'):
                raise serializers.ValidationError({"email": "This field is required for guest comments."})
        return data

class BlogPostSerializer(serializers.ModelSerializer):
    # Display author details instead of just ID
    author = UserSerializer(read_only=True)
    # Include related comments (read-only in this context)
    # Can be computationally expensive if there are many comments, consider pagination or separate endpoint
    comments = BlogCommentSerializer(many=True, read_only=True)
    # You might want a simpler serializer for list views without comments:
    # comments_count = serializers.IntegerField(source='comments.count', read_only=True)

    class Meta:
        model = BlogPost
        fields = (
            'id', 'title', 'slug', 'content', 'excerpt', 'cover_image',
            'author', 'category', 'tags', 'published', 'featured',
            'published_at', 'view_count', 'created_at', 'updated_at',
            'comments', # Include the nested comments
            # 'comments_count', # Optional alternative
        )
        # Slug is read-only as it's auto-generated
        # Author is set based on authenticated user during creation
        # Comments are read-only here; created via separate endpoint/action
        read_only_fields = ('slug', 'author', 'view_count', 'created_at', 'updated_at', 'comments')

# Optional: A simpler serializer for list views
class BlogPostListSerializer(serializers.ModelSerializer):
     author = UserSerializer(read_only=True)
     comments_count = serializers.IntegerField(source='comments.count', read_only=True)

     class Meta:
         model = BlogPost
         fields = (
             'id', 'title', 'slug', 'excerpt', 'cover_image', 'author',
             'category', 'tags', 'published', 'featured', 'published_at',
             'view_count', 'created_at', 'comments_count',
         )
         read_only_fields = ('slug', 'author', 'view_count', 'created_at', 'comments_count')