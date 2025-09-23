# 🐍 Django Backend Interview Guide for TasteStack

## 🗄️ Database & Models Questions

### Q1: "Why did you choose to extend Django's User model instead of using it directly?"

**Answer:** We extended Django's User model to add custom fields and use email as the primary authentication method.

```python
# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
```

```python
# settings.py
AUTH_USER_MODEL = 'accounts.User'
```

### Q2: "Explain the relationship between Recipe and RecipeImage models."

**Answer:** One-to-Many relationship where each Recipe can have multiple images, with CASCADE delete for data integrity.

```python
# recipes/models.py
class Recipe(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class RecipeImage(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='recipes/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-is_primary', 'id']
```

### Q3: "How do you handle recipe ratings and prevent duplicate ratings?"

**Answer:** Using unique constraint and get_or_create() method to update existing ratings.

```python
# recipes/models.py
class Rating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ratings')
    score = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'recipe')
    
    def __str__(self):
        return f"{self.user.email} - {self.recipe.title}: {self.score}"

# In Recipe model
@property
def average_rating(self):
    return self.ratings.aggregate(models.Avg('score'))['score__avg'] or 0

@property
def rating_count(self):
    return self.ratings.count()
```

```python
# views.py
from django.shortcuts import get_object_or_404

def rate_recipe(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    score = request.data.get('score')
    
    rating, created = Rating.objects.get_or_create(
        user=request.user,
        recipe=recipe,
        defaults={'score': score}
    )
    
    if not created:
        rating.score = score
        rating.save()
    
    return Response({'success': True, 'average': recipe.average_rating})
```

## 🔐 Authentication & Security Questions

### Q4: "How do you secure your API endpoints?"

**Answer:** Using DRF permissions, token authentication, and custom permission classes.

```python
# recipes/permissions.py
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user

class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated
```

```python
# recipes/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_recipe(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    like, created = Like.objects.get_or_create(user=request.user, recipe=recipe)
    
    if not created:
        like.delete()
        return Response({'liked': False})
    
    return Response({'liked': True})
```

### Q5: "What measures prevent unauthorized recipe modifications?"

**Answer:** Custom permissions and ownership validation at multiple levels.

```python
# recipes/views.py
from rest_framework.exceptions import PermissionDenied

class RecipeViewSet(viewsets.ModelViewSet):
    def update(self, request, *args, **kwargs):
        recipe = self.get_object()
        if recipe.author != request.user:
            raise PermissionDenied("You can only edit your own recipes.")
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        recipe = self.get_object()
        if recipe.author != request.user:
            raise PermissionDenied("You can only delete your own recipes.")
        return super().destroy(request, *args, **kwargs)
```

## 🌐 API Design Questions

### Q6: "Why did you use Django REST Framework serializers?"

**Answer:** For automatic validation, nested serialization, and consistent API responses.

```python
# recipes/serializers.py
from rest_framework import serializers

class RecipeImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeImage
        fields = ['id', 'image', 'alt_text', 'is_primary']

class RecipeSerializer(serializers.ModelSerializer):
    images = RecipeImageSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)
    average_rating = serializers.ReadOnlyField()
    rating_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Recipe
        fields = ['id', 'title', 'description', 'author', 'author_name', 
                 'images', 'average_rating', 'rating_count', 'created_at']
        read_only_fields = ['author']
    
    def validate_title(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters long.")
        return value

class UserSerializer(serializers.ModelSerializer):
    recipe_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'bio', 'profile_picture', 'recipe_count']
    
    def get_recipe_count(self, obj):
        return obj.recipes.count()
```

### Q7: "How do you handle file uploads for recipe images?"

**Answer:** Using ImageField with proper validation and storage configuration.

```python
# settings.py
import os
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# File upload validation
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
```

```python
# recipes/models.py
def validate_image_size(image):
    max_size = 5 * 1024 * 1024  # 5MB
    if image.size > max_size:
        raise ValidationError("Image size cannot exceed 5MB.")

class RecipeImage(models.Model):
    image = models.ImageField(
        upload_to='recipes/%Y/%m/%d/',
        validators=[validate_image_size]
    )
    
    def save(self, *args, **kwargs):
        # Resize image if too large
        super().save(*args, **kwargs)
        if self.image:
            from PIL import Image
            img = Image.open(self.image.path)
            if img.height > 800 or img.width > 800:
                img.thumbnail((800, 800))
                img.save(self.image.path)
```

```python
# recipes/views.py
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_recipe_image(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id, author=request.user)
    
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=400)
    
    image = RecipeImage.objects.create(
        recipe=recipe,
        image=request.FILES['image'],
        alt_text=request.data.get('alt_text', '')
    )
    
    serializer = RecipeImageSerializer(image)
    return Response(serializer.data, status=201)
```

## 📊 Performance & Optimization Questions

### Q8: "How would you optimize database queries for the recipe feed?"

**Answer:** Using select_related, prefetch_related, and proper indexing.

```python
# recipes/views.py
class RecipeViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return Recipe.objects.select_related('author').prefetch_related(
            'images', 'ratings', 'likes'
        ).annotate(
            avg_rating=models.Avg('ratings__score'),
            like_count=models.Count('likes')
        )

# Optimized recipe feed
def get_recipe_feed(request):
    recipes = Recipe.objects.select_related('author').prefetch_related(
        'images', 'ratings'
    ).annotate(
        avg_rating=models.Avg('ratings__score'),
        rating_count=models.Count('ratings')
    ).order_by('-created_at')[:20]
    
    serializer = RecipeSerializer(recipes, many=True)
    return Response(serializer.data)
```

```python
# recipes/models.py
class Recipe(models.Model):
    title = models.CharField(max_length=200, db_index=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['created_at', 'author']),
            models.Index(fields=['title']),
        ]
```

### Q9: "How do you handle recipe search functionality?"

**Answer:** Using database indexes, Q objects, and full-text search.

```python
# recipes/views.py
from django.db.models import Q

@api_view(['GET'])
def search_recipes(request):
    query = request.GET.get('q', '')
    
    if not query:
        return Response({'results': []})
    
    recipes = Recipe.objects.filter(
        Q(title__icontains=query) |
        Q(description__icontains=query) |
        Q(author__username__icontains=query)
    ).select_related('author').prefetch_related('images')[:20]
    
    serializer = RecipeSerializer(recipes, many=True)
    return Response({'results': serializer.data})

# Advanced search with PostgreSQL full-text search
from django.contrib.postgres.search import SearchVector

def advanced_search(request):
    query = request.GET.get('q', '')
    
    recipes = Recipe.objects.annotate(
        search=SearchVector('title', 'description')
    ).filter(search=query)
    
    return Response(RecipeSerializer(recipes, many=True).data)
```

## 🔧 Django Admin Questions

### Q10: "Why did you customize the Django admin interface?"

**Answer:** For better user management, content moderation, and efficient data entry.

```python
# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'username', 'is_active', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'date_joined']
    search_fields = ['email', 'username']
    ordering = ['-date_joined']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('bio', 'profile_picture', 'date_of_birth')
        }),
    )
```

```python
# recipes/admin.py
class RecipeImageInline(admin.TabularInline):
    model = RecipeImage
    extra = 1
    fields = ['image', 'alt_text', 'is_primary']

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'created_at', 'average_rating']
    list_filter = ['created_at', 'author']
    search_fields = ['title', 'description', 'author__email']
    inlines = [RecipeImageInline]
    
    fieldsets = (
        ('Recipe Info', {
            'fields': ('title', 'description', 'author')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ['created_at']
    
    def average_rating(self, obj):
        return f"{obj.average_rating:.1f}" if obj.average_rating else "No ratings"
    average_rating.short_description = "Avg Rating"

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['user', 'recipe', 'score', 'created_at']
    list_filter = ['score', 'created_at']
    search_fields = ['user__email', 'recipe__title']
```

## 🏗️ Architecture Questions

### Q11: "How is your Django project structured?"

**Answer:** Organized into separate apps with clear separation of concerns.

```
TasteStack/
├── backend/
│   ├── accounts/          # User management
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── admin.py
│   ├── recipes/           # Recipe functionality
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── permissions.py
│   ├── tastestack/        # Main project settings
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   └── urls.py
│   └── manage.py
```

```python
# tastestack/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/recipes/', include('recipes.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### Q12: "How do you handle different environments (development, production)?"

**Answer:** Using separate settings files and environment variables.

```python
# tastestack/settings/base.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'accounts',
    'recipes',
]

AUTH_USER_MODEL = 'accounts.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}
```

```python
# tastestack/settings/development.py
from .base import *

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

```python
# tastestack/settings/production.py
from .base import *
import os

DEBUG = False
ALLOWED_HOSTS = [os.getenv('ALLOWED_HOST', 'yourdomain.com')]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Security settings
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
```

## 🔄 Data Management Questions

### Q13: "How do you handle recipe data validation?"

**Answer:** Multi-level validation using model clean methods, serializers, and custom validators.

```python
# recipes/models.py
from django.core.exceptions import ValidationError

class Recipe(models.Model):
    title = models.CharField(max_length=200)
    prep_time = models.PositiveIntegerField(help_text="Preparation time in minutes")
    
    def clean(self):
        if self.prep_time and self.prep_time > 1440:  # 24 hours
            raise ValidationError("Preparation time cannot exceed 24 hours.")
        
        if self.title and len(self.title.strip()) < 3:
            raise ValidationError("Title must be at least 3 characters long.")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
```

```python
# recipes/serializers.py
class RecipeSerializer(serializers.ModelSerializer):
    def validate_prep_time(self, value):
        if value <= 0:
            raise serializers.ValidationError("Preparation time must be positive.")
        if value > 1440:
            raise serializers.ValidationError("Preparation time cannot exceed 24 hours.")
        return value
    
    def validate(self, data):
        # Cross-field validation
        if 'title' in data and 'description' in data:
            if data['title'].lower() in data['description'].lower():
                raise serializers.ValidationError(
                    "Description should not just repeat the title."
                )
        return data
```

### Q14: "How would you implement recipe categories or tags?"

**Answer:** Using Many-to-Many relationships with through models for additional metadata.

```python
# recipes/models.py
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default="#007bff")  # Hex color
    
    def __str__(self):
        return self.name

class Recipe(models.Model):
    # ... existing fields ...
    categories = models.ManyToManyField(Category, blank=True)
    tags = models.ManyToManyField(Tag, through='RecipeTag')

class RecipeTag(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    added_by = models.ForeignKey(User, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('recipe', 'tag')
```

```python
# recipes/views.py
@api_view(['GET'])
def recipes_by_category(request, category_slug):
    category = get_object_or_404(Category, slug=category_slug)
    recipes = Recipe.objects.filter(categories=category).select_related('author')
    serializer = RecipeSerializer(recipes, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_tag_to_recipe(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    tag_name = request.data.get('tag_name')
    
    tag, created = Tag.objects.get_or_create(name=tag_name)
    recipe_tag, created = RecipeTag.objects.get_or_create(
        recipe=recipe,
        tag=tag,
        defaults={'added_by': request.user}
    )
    
    return Response({'success': True, 'created': created})
```

## 🚀 Deployment & Scalability Questions

### Q15: "How would you deploy this Django application?"

**Answer:** Using WSGI server with proper static file handling and database configuration.

```python
# requirements.txt
Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
Pillow==10.0.1
gunicorn==21.2.0
psycopg2-binary==2.9.7
python-decouple==3.8
```

```python
# wsgi.py
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tastestack.settings.production')
application = get_wsgi_application()
```

```bash
# Deployment script
#!/bin/bash
# deploy.sh

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Start Gunicorn
gunicorn tastestack.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

### Q16: "How would you scale this application for more users?"

**Answer:** Implementing caching, database optimization, and load balancing strategies.

```python
# settings/production.py
# Redis caching
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Database connection pooling
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'OPTIONS': {
            'MAX_CONNS': 20,
            'CONN_MAX_AGE': 600,
        }
    }
}
```

```python
# recipes/views.py
from django.core.cache import cache
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)  # Cache for 15 minutes
def popular_recipes(request):
    cache_key = 'popular_recipes'
    recipes = cache.get(cache_key)
    
    if not recipes:
        recipes = Recipe.objects.annotate(
            like_count=Count('likes')
        ).order_by('-like_count')[:10]
        cache.set(cache_key, recipes, 60 * 60)  # Cache for 1 hour
    
    serializer = RecipeSerializer(recipes, many=True)
    return Response(serializer.data)

# Database read replica
class DatabaseRouter:
    def db_for_read(self, model, **hints):
        return 'replica'
    
    def db_for_write(self, model, **hints):
        return 'default'
```

This comprehensive guide covers all major Django backend concepts with practical code examples from your TasteStack project. Each question demonstrates real-world implementation patterns and best practices.

## 🆕 Live Coding Challenge

### Q17: "Create a new Cookbook model with full backend implementation - model, serializer, views, URLs, and admin."

**Answer:** Complete implementation of a Cookbook feature from scratch.

#### Step 1: Create the Model
```python
# recipes/models.py
class Cookbook(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cookbooks')
    recipes = models.ManyToManyField(Recipe, blank=True, related_name='cookbooks')
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('owner', 'name')
    
    def __str__(self):
        return f"{self.name} by {self.owner.username}"
    
    @property
    def recipe_count(self):
        return self.recipes.count()
```

#### Step 2: Create Serializers
```python
# recipes/serializers.py
class CookbookSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    recipe_count = serializers.ReadOnlyField()
    recipes = RecipeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Cookbook
        fields = ['id', 'name', 'description', 'owner', 'owner_name', 
                 'recipes', 'recipe_count', 'is_public', 'created_at']
        read_only_fields = ['owner']
    
    def validate_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return value.strip()

class CookbookListSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    recipe_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Cookbook
        fields = ['id', 'name', 'description', 'owner_name', 'recipe_count', 
                 'is_public', 'created_at']
```

#### Step 3: Create Views
```python
# recipes/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

class CookbookViewSet(viewsets.ModelViewSet):
    serializer_class = CookbookSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Cookbook.objects.filter(
                models.Q(owner=self.request.user) | models.Q(is_public=True)
            ).select_related('owner').prefetch_related('recipes')
        return Cookbook.objects.filter(is_public=True).select_related('owner')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CookbookListSerializer
        return CookbookSerializer
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_recipe(self, request, pk=None):
        cookbook = self.get_object()
        if cookbook.owner != request.user:
            return Response({'error': 'Permission denied'}, status=403)
        
        recipe_id = request.data.get('recipe_id')
        try:
            recipe = Recipe.objects.get(id=recipe_id)
            cookbook.recipes.add(recipe)
            return Response({'success': True, 'message': 'Recipe added to cookbook'})
        except Recipe.DoesNotExist:
            return Response({'error': 'Recipe not found'}, status=404)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def remove_recipe(self, request, pk=None):
        cookbook = self.get_object()
        if cookbook.owner != request.user:
            return Response({'error': 'Permission denied'}, status=403)
        
        recipe_id = request.data.get('recipe_id')
        try:
            recipe = Recipe.objects.get(id=recipe_id)
            cookbook.recipes.remove(recipe)
            return Response({'success': True, 'message': 'Recipe removed from cookbook'})
        except Recipe.DoesNotExist:
            return Response({'error': 'Recipe not found'}, status=404)
    
    @action(detail=False, methods=['get'])
    def my_cookbooks(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        
        cookbooks = Cookbook.objects.filter(owner=request.user)
        serializer = CookbookListSerializer(cookbooks, many=True)
        return Response(serializer.data)
```

#### Step 4: Create URLs
```python
# recipes/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'recipes', views.RecipeViewSet)
router.register(r'cookbooks', views.CookbookViewSet, basename='cookbook')

urlpatterns = [
    path('', include(router.urls)),
    # Other existing URLs...
]
```

#### Step 5: Admin Configuration
```python
# recipes/admin.py
@admin.register(Cookbook)
class CookbookAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'recipe_count', 'is_public', 'created_at']
    list_filter = ['is_public', 'created_at', 'owner']
    search_fields = ['name', 'description', 'owner__username']
    filter_horizontal = ['recipes']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'description', 'owner', 'is_public')
        }),
        ('Recipes', {
            'fields': ('recipes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def recipe_count(self, obj):
        return obj.recipe_count
    recipe_count.short_description = "Recipe Count"
```

#### Step 6: Migration
```bash
# Terminal commands
python manage.py makemigrations
python manage.py migrate
```

#### Step 7: API Endpoints Created
```
GET    /api/recipes/cookbooks/           # List all public cookbooks
POST   /api/recipes/cookbooks/           # Create new cookbook
GET    /api/recipes/cookbooks/{id}/      # Get cookbook details
PUT    /api/recipes/cookbooks/{id}/      # Update cookbook
DELETE /api/recipes/cookbooks/{id}/      # Delete cookbook
GET    /api/recipes/cookbooks/my_cookbooks/  # Get user's cookbooks
POST   /api/recipes/cookbooks/{id}/add_recipe/     # Add recipe to cookbook
DELETE /api/recipes/cookbooks/{id}/remove_recipe/ # Remove recipe from cookbook
```

#### Step 8: Test the API
```python
# Test in Django shell or create test file
from recipes.models import Cookbook, Recipe
from accounts.models import User

# Create test data
user = User.objects.first()
cookbook = Cookbook.objects.create(
    name="My Favorite Recipes",
    description="Collection of my best recipes",
    owner=user,
    is_public=True
)

# Add recipes to cookbook
recipe = Recipe.objects.first()
cookbook.recipes.add(recipe)

print(f"Cookbook: {cookbook.name} has {cookbook.recipe_count} recipes")
```

**This demonstrates:**
- ✅ Model creation with relationships
- ✅ Serializer implementation with validation
- ✅ ViewSet with custom actions
- ✅ Permission handling
- ✅ URL routing
- ✅ Admin interface
- ✅ Database migrations
- ✅ API testing
## 🔄 Request Flow & Authentication Deep Dive

### Q18: "Explain the complete request flow from URL to response with authentication."

**Answer:** Step-by-step breakdown of Django request processing with authentication.

#### Complete Request Flow Diagram
```
Client Request → Django URLs → Middleware → Authentication → Permissions → View → Response
```

#### Step 1: URL Routing Configuration
```python
# tastestack/urls.py (Main project URLs)
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),      # Authentication endpoints
    path('api/recipes/', include('recipes.urls')),    # Recipe endpoints
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

```python
# accounts/urls.py (Authentication URLs)
from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from . import views

urlpatterns = [
    path('login/', obtain_auth_token, name='api_token_auth'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
]
```

```python
# recipes/urls.py (Recipe URLs)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.RecipeViewSet, basename='recipe')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:recipe_id>/rate/', views.rate_recipe, name='rate_recipe'),
    path('<int:recipe_id>/like/', views.like_recipe, name='like_recipe'),
]
```

#### Step 2: Authentication Setup
```python
# settings.py
INSTALLED_APPS = [
    'rest_framework',
    'rest_framework.authtoken',  # Token authentication
    'accounts',
    'recipes',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}

# Create tokens for users automatically
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

@receiver(post_save, sender='accounts.User')
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
```

#### Step 3: Authentication Views
```python
# accounts/views.py
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create token for new user
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        # Delete the user's token to logout
        request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out'})
    except:
        return Response({'error': 'Error logging out'}, status=400)

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
```

#### Step 4: Complete Request Flow Example

**Example Request:** `POST /api/recipes/` (Create new recipe)

**Step 4.1: Client sends request**
```javascript
// Frontend request
fetch('/api/recipes/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b'  // User's token
    },
    body: JSON.stringify({
        title: 'Pasta Carbonara',
        description: 'Classic Italian pasta dish'
    })
})
```

**Step 4.2: Django URL Resolution**
```python
# Django processes the URL
# /api/recipes/ → recipes/urls.py → router → RecipeViewSet.create()

# URL matching process:
# 1. tastestack/urls.py: 'api/recipes/' → recipes.urls
# 2. recipes/urls.py: '' → RecipeViewSet (router handles POST to create)
```

**Step 4.3: Middleware Processing**
```python
# settings.py - Middleware order matters!
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',  # Processes auth
    'django.contrib.messages.middleware.MessageMiddleware',
]
```

**Step 4.4: Authentication Process**
```python
# DRF Authentication classes process the request
# 1. TokenAuthentication checks for 'Authorization: Token <token>' header
# 2. Looks up token in database
# 3. Sets request.user to the token's user
# 4. If no token or invalid token, request.user = AnonymousUser

# rest_framework/authentication.py (simplified)
class TokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth = get_authorization_header(request).split()
        
        if not auth or auth[0].lower() != b'token':
            return None
            
        token = auth[1].decode()
        return self.authenticate_credentials(token)
    
    def authenticate_credentials(self, key):
        try:
            token = Token.objects.get(key=key)
        except Token.DoesNotExist:
            raise AuthenticationFailed('Invalid token')
        
        if not token.user.is_active:
            raise AuthenticationFailed('User inactive')
            
        return (token.user, token)  # Sets request.user and request.auth
```

**Step 4.5: Permission Checking**
```python
# recipes/views.py
class RecipeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    # DRF checks permissions before calling view method
    # 1. IsAuthenticatedOrReadOnly: POST requires authentication
    # 2. IsOwnerOrReadOnly: Not applicable for create (no existing object)
    
    def create(self, request, *args, **kwargs):
        # This method only runs if permissions pass
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def perform_create(self, serializer):
        # Set the author to the authenticated user
        serializer.save(author=self.request.user)
```

**Step 4.6: View Processing & Response**
```python
# The complete flow in RecipeViewSet.create():

def create(self, request, *args, **kwargs):
    # 1. Get serializer with request data
    serializer = self.get_serializer(data=request.data)
    
    # 2. Validate data
    serializer.is_valid(raise_exception=True)
    
    # 3. Save to database (calls perform_create)
    self.perform_create(serializer)
    
    # 4. Return response
    headers = self.get_success_headers(serializer.data)
    return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

def perform_create(self, serializer):
    # Set author to authenticated user (request.user set by authentication)
    serializer.save(author=self.request.user)
```

#### Step 5: Authentication Flow Visualization

```python
# Complete authentication check process:

# 1. Request arrives: POST /api/recipes/
# 2. URL routing: tastestack/urls.py → recipes/urls.py → RecipeViewSet
# 3. DRF processes authentication:
#    - Checks Authorization header
#    - Validates token
#    - Sets request.user
# 4. DRF checks permissions:
#    - IsAuthenticatedOrReadOnly: ✓ (user is authenticated)
#    - IsOwnerOrReadOnly: ✓ (not applicable for create)
# 5. View method executes:
#    - Validates data with serializer
#    - Saves with request.user as author
#    - Returns response
```

#### Step 6: Error Handling in Authentication

```python
# What happens when authentication fails:

# Case 1: No token provided
# Request: POST /api/recipes/ (no Authorization header)
# Result: request.user = AnonymousUser
# Permission check: IsAuthenticatedOrReadOnly fails for POST
# Response: 401 Unauthorized

# Case 2: Invalid token
# Request: POST /api/recipes/ with Authorization: Token invalid_token
# Result: AuthenticationFailed exception
# Response: 401 Unauthorized {"detail": "Invalid token"}

# Case 3: Valid token, wrong user trying to edit
# Request: PUT /api/recipes/1/ (recipe belongs to different user)
# Result: IsOwnerOrReadOnly permission fails
# Response: 403 Forbidden {"detail": "You do not have permission..."}
```

#### Step 7: Custom Authentication Middleware (Optional)

```python
# Custom middleware to log authentication attempts
class AuthenticationLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Log authentication attempts
        if hasattr(request, 'user') and request.user.is_authenticated:
            print(f"Authenticated request from {request.user.email}")
        
        response = self.get_response(request)
        return response

# Add to MIDDLEWARE in settings.py
MIDDLEWARE = [
    # ... other middleware
    'path.to.AuthenticationLoggingMiddleware',
]
```

**This demonstrates:**
- ✅ Complete URL routing hierarchy
- ✅ Authentication class processing
- ✅ Token validation flow
- ✅ Permission checking sequence
- ✅ View method execution
- ✅ Error handling scenarios
- ✅ Request/response lifecycle
- ✅ Middleware integration