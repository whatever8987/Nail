# blog/admin.py
from django.contrib import admin
from .models import BlogPost, BlogComment

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'published', 'featured', 'view_count', 'created_at', 'updated_at')
    list_filter = ('published', 'featured', 'category', 'author', 'created_at')
    search_fields = ('title', 'content', 'excerpt', 'author__username', 'tags')
    ordering = ('-created_at',)
    prepopulated_fields = {'slug': ('title',)} # Auto-fills slug based on title (in admin only)
    readonly_fields = ('view_count', 'created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'author', 'content', 'excerpt')
        }),
        ('Details & Visibility', {
            'fields': ('category', 'tags', 'cover_image', 'published', 'featured', 'published_at')
        }),
         ('Stats & Timestamps', {
            'fields': ('view_count', 'created_at', 'updated_at'),
             'classes': ('collapse',)
        }),
    )

@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'user', 'name', 'email', 'approved', 'created_at')
    list_filter = ('approved', 'created_at', 'post__title')
    search_fields = ('content', 'name', 'email', 'user__username', 'post__title')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    # Action to approve comments directly from the admin list view
    actions = ['approve_comments']

    fieldsets = (
         (None, {
             'fields': ('post', 'user', 'name', 'email', 'content', 'approved')
         }),
          ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
             'classes': ('collapse',)
        }),
    )

    def approve_comments(self, request, queryset):
        queryset.update(approved=True)
    approve_comments.short_description = "Mark selected comments as Approved"