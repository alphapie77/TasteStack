from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
from recipes.models import Recipe, RecipeImage
from interactions.models import Rating, Like, Comment, Follow

# Custom User Admin
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'username')}),
        ('Profile', {'fields': ('bio', 'location', 'website', 'profile_picture')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )

# Recipe Admin
class RecipeImageInline(admin.TabularInline):
    model = RecipeImage
    extra = 1

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'difficulty', 'prep_time', 'cook_time', 'servings', 'created_at')
    list_filter = ('difficulty', 'created_at', 'author')
    search_fields = ('title', 'description', 'author__username', 'author__email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'average_rating', 'likes_count')
    
    fieldsets = (
        ('Basic Info', {'fields': ('title', 'description', 'author')}),
        ('Recipe Details', {'fields': ('ingredients', 'instructions', 'prep_time', 'cook_time', 'servings')}),
        ('Classification', {'fields': ('difficulty', 'category', 'image')}),
        ('Statistics', {'fields': ('average_rating', 'likes_count'), 'classes': ('collapse',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    
    inlines = [RecipeImageInline]

# Rating Admin
@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'recipe', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__username', 'user__email', 'recipe__title')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

# Like Admin
@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'recipe', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'user__email', 'recipe__title')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

# Comment Admin
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'recipe', 'content_preview', 'hidden', 'created_at')
    list_filter = ('hidden', 'created_at')
    search_fields = ('user__username', 'user__email', 'recipe__title', 'content')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    actions = ['hide_comments', 'show_comments']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'
    
    def hide_comments(self, request, queryset):
        queryset.update(hidden=True)
    hide_comments.short_description = 'Hide selected comments'
    
    def show_comments(self, request, queryset):
        queryset.update(hidden=False)
    show_comments.short_description = 'Show selected comments'

# Follow Admin
@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ('follower', 'following', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('follower__username', 'follower__email', 'following__username', 'following__email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

# Recipe Image Admin
@admin.register(RecipeImage)
class RecipeImageAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('recipe__title',)
    ordering = ('-uploaded_at',)
    readonly_fields = ('uploaded_at',)
