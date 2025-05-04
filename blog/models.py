# blog/models.py
from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.urls import reverse # Useful for getting canonical URLs

# Using settings.AUTH_USER_MODEL is the standard way to refer to your user model
User = settings.AUTH_USER_MODEL

class BlogPost(models.Model):
    """Represents a single blog post."""
    # Consider defining choices for categories if you have a fixed set
    CATEGORY_CHOICES = (
        ('nail_art', 'Nail Art'),
        ('marketing', 'Marketing'),
        ('business_advice', 'Business Advice'),
        ('trends', 'Trends'),
        ('product_reviews', 'Product Reviews'),
        ('tutorials', 'Tutorials'),
        ('other', 'Other'),
    )

    title = models.CharField(max_length=255)
    # Slug will be auto-generated from title, ensure it's unique
    slug = models.SlugField(max_length=255, unique=True, blank=True, help_text="Unique URL-friendly identifier (leave blank to auto-generate)")
    content = models.TextField()
    excerpt = models.TextField(blank=True, null=True, help_text="A short summary of the post (optional)")
    # Use URLField for simplicity, or ImageField if you want to handle uploads
    cover_image = models.URLField(max_length=500, blank=True, null=True, help_text="URL of the main image for the post")
    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL, # Keep post even if author deleted, set author to NULL
        related_name='blog_posts',
        null=True # Allow posts with no author (e.g., imported posts)
    )
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    # Using JSONField for tags, could also use django-taggit package
    tags = models.JSONField(default=list, blank=True, help_text="List of tags, e.g., ['manicure', 'trends']")

    # Status & Visibility
    published = models.BooleanField(default=False, help_text="Check this to make the post visible to the public")
    featured = models.BooleanField(default=False, help_text="Check this to feature the post (e.g., on homepage)")
    published_at = models.DateTimeField(blank=True, null=True, help_text="Optional: Set a future date/time to publish")

    # Stats
    view_count = models.PositiveIntegerField(default=0, editable=False) # Track views

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at'] # Default ordering for queries

    def save(self, *args, **kwargs):
        # Auto-generate slug if it's blank
        if not self.slug:
            base_slug = slugify(self.title)
            unique_slug = base_slug
            counter = 1
            # Ensure uniqueness
            while BlogPost.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        # Example: Useful if you have server-rendered detail pages
        # Requires a URL pattern named 'blog:post_detail' that takes 'slug'
        # return reverse('blog:post_detail', kwargs={'slug': self.slug})
        # For API-only, this might not be strictly needed
        return f"/api/blog/posts/{self.slug}/" # Or return API URL

class BlogComment(models.Model):
    """Represents a comment on a blog post."""
    post = models.ForeignKey(
        BlogPost,
        on_delete=models.CASCADE, # Delete comments if the post is deleted
        related_name='comments'
    )
    # Link to registered user if available, otherwise use name/email fields
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL, # Keep comment if user deleted, set user to NULL
        related_name='blog_comments',
        blank=True,
        null=True
    )
    # Fields for guest comments
    name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)

    content = models.TextField()
    approved = models.BooleanField(default=False, help_text="Comments must be approved to be publicly visible")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at'] # Show older comments first

    def __str__(self):
        if self.user:
            return f"Comment by {self.user.username} on {self.post.title}"
        else:
            return f"Comment by {self.name} on {self.post.title}"

    def save(self, *args, **kwargs):
        # If comment is made by a logged-in user, populate name/email from user profile
        if self.user and not self.pk: # Only on creation if user is set
            if not self.name:
                self.name = self.user.get_full_name() or self.user.username
            if not self.email:
                self.email = self.user.email
        super().save(*args, **kwargs)