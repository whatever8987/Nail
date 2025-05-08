from django.db import models
from django.conf import settings
from django.utils.text import slugify
# from django.urls import reverse # Useful for getting canonical URLs
from django.utils.translation import gettext_lazy as _ # <<< Import this

# Using settings.AUTH_USER_MODEL is the standard way to refer to your user model
User = settings.AUTH_USER_MODEL

class BlogPost(models.Model):
    """Represents a single blog post."""
    # Consider defining choices for categories if you have a fixed set
    # Mark category choices
    CATEGORY_CHOICES = (
        ('nail_art', _('Nail Art')), # <<< Marked choice
        ('marketing', _('Marketing')), # <<< Marked choice
        ('business_advice', _('Business Advice')), # <<< Marked choice
        ('trends', _('Trends')), # <<< Marked choice
        ('product_reviews', _('Product Reviews')), # <<< Marked choice
        ('tutorials', _('Tutorials')), # <<< Marked choice
        ('other', _('Other')), # <<< Marked choice
    )

    title = models.CharField(
        max_length=255,
        verbose_name=_('Title') # <<< Marked verbose_name
    )
    slug = models.SlugField(
        max_length=255,
        unique=True,
        blank=True,
        help_text=_('Unique URL-friendly identifier (leave blank to auto-generate)'), # <<< Marked help_text
        verbose_name=_('Slug') # <<< Marked verbose_name
    )
    content = models.TextField(
        verbose_name=_('Content') # <<< Marked verbose_name
    )
    excerpt = models.TextField(
        blank=True,
        null=True,
        help_text=_('A short summary of the post (optional)'), # <<< Marked help_text
        verbose_name=_('Excerpt') # <<< Marked verbose_name
    )
    cover_image = models.URLField( # Or ImageField if you use that
        max_length=500,
        blank=True,
        null=True,
        help_text=_('URL of the main image for the post'), # <<< Marked help_text
        verbose_name=_('Cover Image') # <<< Marked verbose_name
    )
    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='blog_posts',
        null=True,
        verbose_name=_('Author') # <<< Marked verbose_name
    )
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='other',
        verbose_name=_('Category') # <<< Marked verbose_name
    )
    tags = models.JSONField(
        default=list,
        blank=True,
        help_text=_('List of tags, e.g., ["manicure", "trends"]'), # <<< Marked help_text
        verbose_name=_('Tags') # <<< Marked verbose_name
    )

    # Status & Visibility
    published = models.BooleanField(
        default=False,
        help_text=_('Check this to make the post visible to the public'), # <<< Marked help_text
        verbose_name=_('Published') # <<< Marked verbose_name
    )
    featured = models.BooleanField(
        default=False,
        help_text=_('Check this to feature the post (e.g., on homepage)'), # <<< Marked help_text
        verbose_name=_('Featured') # <<< Marked verbose_name
    )
    published_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text=_('Optional: Set a future date/time to publish'), # <<< Marked help_text
        verbose_name=_('Published At') # <<< Marked verbose_name
    )

    # Stats
    view_count = models.PositiveIntegerField(
        default=0,
        editable=False,
        verbose_name=_('View Count') # <<< Marked verbose_name
    )

    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Created At') # <<< Marked verbose_name
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Updated At') # <<< Marked verbose_name
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = _("Blog Post") # <<< Marked verbose_name
        verbose_name_plural = _("Blog Posts") # <<< Marked verbose_name_plural


    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            unique_slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return f"/api/blog/posts/{self.slug}/" # API URL

class BlogComment(models.Model):
    """Represents a comment on a blog post."""
    post = models.ForeignKey(
        BlogPost,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name=_('Post') # <<< Marked verbose_name
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='blog_comments',
        blank=True,
        null=True,
        verbose_name=_('User') # <<< Marked verbose_name
    )
    name = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Name') # <<< Marked verbose_name
    )
    email = models.EmailField(
        blank=True,
        verbose_name=_('Email Address') # <<< Marked verbose_name
    )

    content = models.TextField(
        verbose_name=_('Content') # <<< Marked verbose_name
    )
    approved = models.BooleanField(
        default=False,
        help_text=_('Comments must be approved to be publicly visible'), # <<< Marked help_text
        verbose_name=_('Approved') # <<< Marked verbose_name
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Created At') # <<< Marked verbose_name
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Updated At') # <<< Marked verbose_name
    )

    class Meta:
        ordering = ['created_at']
        verbose_name = _("Blog Comment") # <<< Marked verbose_name
        verbose_name_plural = _("Blog Comments") # <<< Marked verbose_name_plural


    def __str__(self):
        # The __str__ method content itself is usually not translated,
        # but you could translate the structure around the user/name and title.
        if self.user:
            return _("Comment by %(username)s on %(title)s") % {'username': self.user.username, 'title': self.post.title}
        elif self.name:
             return _("Comment by %(name)s on %(title)s") % {'name': self.name, 'title': self.post.title}
        else:
             return _("Anonymous comment on %(title)s") % {'title': self.post.title}


    def save(self, *args, **kwargs):
        if self.user and not self.pk:
            if not self.name:
                self.name = self.user.get_full_name() or self.user.username
            if not self.email:
                self.email = self.user.email
        super().save(*args, **kwargs)