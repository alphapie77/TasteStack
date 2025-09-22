# 🔧 Django Development Guide

## 🏗️ Complete Django REST API Development Guide

This comprehensive guide covers building a Django REST API backend from scratch, using Django REST Framework (DRF) with JWT authentication, database management, and production deployment.

## 📋 Table of Contents

1. [Project Setup](#1-project-setup)
2. [Django Configuration](#2-django-configuration)
3. [User Authentication](#3-user-authentication)
4. [Database Models](#4-database-models)
5. [API Serializers](#5-api-serializers)
6. [Views and ViewSets](#6-views-and-viewsets)
7. [URL Routing](#7-url-routing)
8. [Authentication & Permissions](#8-authentication--permissions)
9. [File Uploads](#9-file-uploads)
10. [Database Operations](#10-database-operations)
11. [Production Deployment](#11-production-deployment)

---

## 1. Project Setup

### 1.1 Environment Setup
```bash
# Create project directory
mkdir my-backend-project
cd my-backend-project

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install Django and dependencies
pip install django djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
pip install python-dotenv
pip install Pillow  # For image handling
```

### 1.2 Create Django Project
```bash
# Create Django project
django-admin startproject backend .

# Create Django apps
python manage.py startapp accounts
python manage.py startapp core_app
python manage.py startapp interactions
```

### 1.3 Project Structure
```
my-backend-project/
├── backend/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── accounts/          # User authentication
├── core_app/          # Main business logic
├── interactions/      # User interactions
├── media/            # User uploaded files
├── requirements.txt
├── .env
└── manage.py
```

---

## 2. Django Configuration

### 2.1 Settings Configuration
```python
# backend/settings.py
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    
    # Local apps
    'accounts',
    'core_app',
    'interactions',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Custom user model
AUTH_USER_MODEL = 'accounts.User'

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
}

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
}

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

### 2.2 Environment Variables (.env)
```env
SECRET_KEY=your-super-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

---

## 3. User Authentication

### 3.1 Custom User Model
```python
# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.ImageField(
        upload_to='profile_pictures/', 
        blank=True, 
        null=True
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
```

### 3.2 User Serializers
```python
# accounts/serializers.py
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'bio', 'profile_picture')
        read_only_fields = ('id',)
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm')
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match.")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user
```

### 3.3 Authentication Views
```python
# accounts/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, UserRegistrationSerializer
from .models import User

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'token': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if email and password:
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'token': str(refresh.access_token),
            })
        else:
            return Response({'error': 'Invalid credentials'}, 
                          status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'error': 'Email and password are required'}, 
                      status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
```

---

## 4. Database Models

### 4.1 Core App Models
```python
# core_app/models.py
from django.db import models
from accounts.models import User

class Item(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    image = models.ImageField(upload_to='item_images/', blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='items')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    @property
    def average_rating(self):
        ratings = self.ratings.all()
        if ratings.exists():
            return sum(rating.rating for rating in ratings) / ratings.count()
        return 0
    
    @property
    def likes_count(self):
        return self.likes.count()
```

### 4.2 Interaction Models
```python
# interactions/models.py
from django.db import models
from accounts.models import User
from core_app.models import Item

class Rating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='ratings')
    rating = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)])
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'item')
    
    def __str__(self):
        return f"{self.user.username} - {self.item.title} ({self.rating}/5)"

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'item')
    
    def __str__(self):
        return f"{self.user.username} likes {self.item.title}"

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.item.title}"
```

---

## 5. API Serializers

### 5.1 Core App Serializers
```python
# core_app/serializers.py
from rest_framework import serializers
from .models import Item
from accounts.serializers import UserSerializer
from interactions.models import Rating, Like

class ItemSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    average_rating = serializers.ReadOnlyField()
    likes_count = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Item
        fields = ('id', 'title', 'description', 'difficulty', 'image', 
                 'author', 'created_at', 'updated_at', 'average_rating', 
                 'likes_count', 'is_liked', 'user_rating')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, item=obj).exists()
        return False
    
    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rating = Rating.objects.filter(user=request.user, item=obj).first()
            return rating.rating if rating else None
        return None

class ItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('title', 'description', 'difficulty', 'image')
    
    def create(self, validated_data):
        user = self.context['request'].user
        item = Item.objects.create(author=user, **validated_data)
        return item
```

### 5.2 Interaction Serializers
```python
# interactions/serializers.py
from rest_framework import serializers
from .models import Rating, Like, Comment
from accounts.serializers import UserSerializer

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ('id', 'rating', 'created_at')
        read_only_fields = ('id', 'created_at')
    
    def create(self, validated_data):
        user = self.context['request'].user
        item_id = self.context['view'].kwargs['pk']
        
        rating, created = Rating.objects.update_or_create(
            user=user,
            item_id=item_id,
            defaults={'rating': validated_data['rating']}
        )
        return rating

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ('id', 'user', 'content', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        user = self.context['request'].user
        item_id = self.context.get('item_id')
        comment = Comment.objects.create(
            user=user, 
            item_id=item_id, 
            **validated_data
        )
        return comment
```

---

## 6. Views and ViewSets

### 6.1 Core App Views
```python
# core_app/views.py
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db import models
from .models import Item
from .serializers import ItemSerializer, ItemCreateSerializer
from interactions.models import Rating
from interactions.serializers import RatingSerializer

class ItemListCreateView(generics.ListCreateAPIView):
    queryset = Item.objects.select_related('author').all()
    serializer_class = ItemSerializer
    
    def get_queryset(self):
        queryset = Item.objects.select_related('author').all()
        
        # Search functionality
        search = self.request.query_params.get('q', None)
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) |
                models.Q(description__icontains=search)
            )
        
        # Filter by difficulty
        difficulty = self.request.query_params.get('difficulty', None)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ItemCreateSerializer
        return ItemSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.select_related('author').all()
    serializer_class = ItemSerializer
    permission_classes = [AllowAny]
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.author != request.user:
            return Response(
                {'error': 'You do not have permission to edit this item'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.author != request.user:
            return Response(
                {'error': 'You do not have permission to delete this item'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rate_item(request, pk):
    try:
        item = Item.objects.get(pk=pk)
    except Item.DoesNotExist:
        return Response({'error': 'Item not found'}, 
                      status=status.HTTP_404_NOT_FOUND)
    
    serializer = RatingSerializer(
        data={'rating': request.data.get('rating')}, 
        context={'request': request, 'view': type('obj', (object,), {'kwargs': {'pk': pk}})()}
    )
    if serializer.is_valid():
        serializer.save()
        item_serializer = ItemSerializer(item, context={'request': request})
        return Response(item_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_items(request):
    """Get current user's items"""
    items = Item.objects.filter(author=request.user).order_by('-created_at')
    serializer = ItemSerializer(items, many=True, context={'request': request})
    return Response({
        'results': serializer.data,
        'count': items.count(),
    })
```

---

## 7. URL Routing

### 7.1 Main URLs
```python
# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/items/', include('core_app.urls')),
    path('api/interactions/', include('interactions.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### 7.2 App URLs
```python
# accounts/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('user/', views.user_profile, name='user_profile'),
]

# core_app/urls.py
from django.urls import path
from .views import ItemListCreateView, ItemDetailView, rate_item, my_items

urlpatterns = [
    path('', ItemListCreateView.as_view(), name='item-list-create'),
    path('<int:pk>/', ItemDetailView.as_view(), name='item-detail'),
    path('<int:pk>/rate/', rate_item, name='rate-item'),
    path('my-items/', my_items, name='my-items'),
]
```

---

## 8. Authentication & Permissions

### 8.1 JWT Token Authentication
```python
# Custom authentication in views
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated

class CustomView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Access authenticated user
        user = request.user
        return Response({'user_id': user.id})
```

### 8.2 Custom Permissions
```python
# core_app/permissions.py
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the object.
        return obj.author == request.user
```

---

## 9. File Uploads

### 9.1 Image Upload Handling
```python
# In models.py
class Item(models.Model):
    image = models.ImageField(
        upload_to='item_images/', 
        blank=True, 
        null=True,
        help_text="Upload an image for this item"
    )
    
    def save(self, *args, **kwargs):
        # Delete old image when updating
        if self.pk:
            try:
                old_item = Item.objects.get(pk=self.pk)
                if old_item.image and old_item.image != self.image:
                    old_item.image.delete(save=False)
            except Item.DoesNotExist:
                pass
        super().save(*args, **kwargs)
```

### 9.2 File Upload Views
```python
# In views.py
from rest_framework.parsers import MultiPartParser, FormParser

class ItemCreateView(generics.CreateAPIView):
    serializer_class = ItemCreateSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
```

---

## 10. Database Operations

### 10.1 Django ORM Examples
```python
# CREATE operations
user = User.objects.create_user(
    username='john',
    email='john@example.com',
    password='securepass123'
)

item = Item.objects.create(
    title='My Item',
    description='Item description',
    author=user
)

# READ operations
all_items = Item.objects.all()
user_items = Item.objects.filter(author=user)
item = Item.objects.get(id=1)

# UPDATE operations
item.title = 'Updated Title'
item.save()

# Or bulk update
Item.objects.filter(author=user).update(difficulty='Easy')

# DELETE operations
item.delete()
Item.objects.filter(author=user).delete()

# Complex queries with relationships
items_with_ratings = Item.objects.select_related('author').prefetch_related('ratings')
popular_items = Item.objects.annotate(
    avg_rating=models.Avg('ratings__rating')
).filter(avg_rating__gte=4.0)
```

### 10.2 Database Migrations
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations

# Reverse migrations
python manage.py migrate app_name 0001

# Create empty migration
python manage.py makemigrations --empty app_name
```

---

## 11. Production Deployment

### 11.1 Production Settings
```python
# backend/settings_prod.py
import os
from .settings import *

DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', 'www.your-domain.com']

# Database for production
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Security settings for HTTPS
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Cookie security
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

### 11.2 Deployment Checklist
```bash
# Security
- [ ] Set DEBUG=False
- [ ] Use strong SECRET_KEY
- [ ] Set ALLOWED_HOSTS
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookie flags

# Database
- [ ] Configure production database
- [ ] Set up database backups
- [ ] Run migrations

# Static Files
- [ ] Set up static file serving
- [ ] Configure media file storage
- [ ] Collect static files

# API Configuration
- [ ] Configure CORS for production
- [ ] Set up rate limiting
- [ ] Configure caching

# Infrastructure
- [ ] Set up environment variables
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Configure auto-scaling

# Testing
- [ ] Run test suite
- [ ] Load testing
- [ ] Security scan
```

---

## Project Structure Summary
```
my-backend-project/
├── backend/                    # Main Django project folder
│   ├── __init__.py            # Makes it a Python package
│   ├── settings.py            # Django configuration
│   ├── urls.py                # Main URL routing
│   └── wsgi.py                # Web server interface
├── accounts/                   # User authentication app
│   ├── models.py              # User model definition
│   ├── views.py               # Authentication views
│   ├── serializers.py         # Data serialization
│   └── urls.py                # Auth-related URLs
├── core_app/                   # Main business logic app
│   ├── models.py              # Core data models
│   ├── views.py               # API views/viewsets
│   ├── serializers.py         # Data serialization
│   └── urls.py                # App-specific URLs
├── interactions/               # User interaction features
│   ├── models.py              # Like, Comment models
│   └── ...                    # Views, serializers, etc.
├── media/                      # User uploaded files
│   ├── profile_pictures/      # User profile images
│   └── item_images/           # Content images
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (secret)
├── .env.example               # Environment template
└── manage.py                  # Django management script
```

## Key Concepts Explained

### 1. **Django ORM (Object-Relational Mapping)**
**What it is:** Django ORM translates Python classes into database tables and operations.

**Where you'll find ORM in the guide:**
- **Models** (`models.py` files) - Define database structure
- **QuerySets** - Database queries using Python syntax
- **Relationships** - ForeignKey, ManyToMany, OneToOne
- **Migrations** - Version control for database schema

**ORM Examples from the guide:**
```python
# ORM Model Definition → Creates database table
class User(models.Model):
    email = models.EmailField(unique=True)  # VARCHAR with UNIQUE constraint
    
# ORM Queries → Generates SQL automatically
User.objects.all()                    # SELECT * FROM users
User.objects.filter(email='test')     # SELECT * FROM users WHERE email='test'
user.items.all()                      # JOIN query using relationship

# ORM Relationships → Foreign Keys in database
author = models.ForeignKey(User)      # Creates user_id column + foreign key constraint
```

### 2. **Models** (Database Layer)
- **ORM Classes**: Python classes that represent database tables
- **Field Types**: Define column types and constraints
- **Relationships**: Link tables together (ForeignKey, ManyToMany)
- **Auto-migration**: Django generates SQL schema changes

### 3. **Serializers** (Data Layer)
- Convert between JSON and Python objects
- Validate incoming data
- Control what data is exposed in API
- Handle nested relationships

### 4. **Views/ViewSets** (Logic Layer)
- Handle HTTP requests
- Implement business logic
- Control permissions and authentication
- Return appropriate responses

### 5. **URLs** (Routing Layer)
- Map URLs to views
- Organize endpoints logically
- Enable RESTful API design
- Support URL parameters

### 6. **Authentication Flow (Using ORM)**
1. User registers → **ORM creates User record** in database
2. User logs in → **ORM validates credentials** against database
3. JWT tokens issued → Contains user ID from database
4. API requests include token in header
5. Django validates token → **ORM fetches User object** by ID

### 7. **ORM Query Examples You'll Use (ACTUALLY USED IN THE GUIDE)**
```python
# ✅ USED IN VIEWS: Create (INSERT)
user = User.objects.create_user(**validated_data)  # Used in registration view
item = Item.objects.create(title='My Item', author=user)

# ✅ USED IN VIEWSETS: Read (SELECT)
Item.objects.all()                    # Used in ItemViewSet.queryset
Item.objects.filter(author=user)      # Used in my_items() method
User.objects.get(id=token_user_id)    # Used when validating JWT tokens

# ✅ USED IN SERIALIZERS: Update (UPDATE)
item.title = 'New Title'
item.save()                           # Called by serializer.save()

# ✅ USED IN VIEWSETS: Delete (DELETE)
item.delete()                         # Available via DELETE /api/items/{id}/

# ✅ USED VIA RELATIONSHIPS: Reverse lookups (JOIN)
user.items.all()                      # Available via related_name='items'
item.likes.count()                    # Count likes (if you add Like model)
item.comments.all()                   # Get comments (if you add Comment model)
```

**🎯 WHERE THESE QUERIES ARE ACTUALLY EXECUTED:**

1. **`Item.objects.all()`** → Used in `ItemViewSet.queryset`
2. **`Item.objects.filter(author=user)`** → Used in `my_items()` method
3. **`User.objects.get()`** → Used internally by Django when validating JWT tokens
4. **`user.items.all()`** → Available via `related_name='items'` in ForeignKey
5. **`item.save()`** → Called automatically by DRF serializers
6. **`item.delete()`** → Available via DELETE HTTP method on ViewSet

## Next Steps
1. **Customize models** based on your specific requirements
   - Replace "Item" with your main entity (Recipe, Post, Product)
   - Add fields specific to your domain
   - Define proper relationships

2. **Add business logic**
   - Custom validation rules
   - Complex queries and filtering
   - Business rule enforcement

3. **Implement advanced features**
   - Search functionality (full-text search)
   - Real-time notifications (WebSockets)
   - Caching for performance
   - File upload handling

4. **Add comprehensive testing**
   - Unit tests for models
   - API endpoint tests
   - Integration tests
   - Performance tests

5. **Set up CI/CD pipeline**
   - Automated testing
   - Code quality checks
   - Automated deployment

6. **Deploy to production**
   - Choose hosting platform (AWS, Heroku, DigitalOcean)
   - Set up production database
   - Configure domain and SSL
   - Monitor and maintain

## Learning Resources
- **Django Documentation**: https://docs.djangoproject.com/
- **DRF Documentation**: https://www.django-rest-framework.org/
- **JWT Authentication**: Understanding token-based auth
- **Database Design**: Learn about relationships and normalization
- **API Design**: REST principles and best practices

This guide provides a solid foundation for building a Django REST API backend. The commented code helps you understand not just *what* to do, but *why* each component is necessary and how they work together to create a robust, scalable backend system.