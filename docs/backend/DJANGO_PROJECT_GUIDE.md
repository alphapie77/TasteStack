# 🔧 Django Backend Project Guide

## 🏗️ Complete Django REST API Development Guide

# This guide teaches you to build a complete Django REST API from scratch
# You'll learn:
# - Django models (database structure)
# - Django REST Framework (API creation)
# - JWT authentication (secure login)
# - File uploads (images)
# - Database relationships (foreign keys)
# - Production deployment

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
mkdir my-backend-project  # Create main project folder
cd my-backend-project     # Navigate into it

# Create virtual environment (isolated Python environment)
# Virtual environments prevent package conflicts between projects
python -m venv venv       # Create virtual environment named 'venv'
venv\Scripts\activate     # Activate on Windows
# source venv/bin/activate  # Activate on macOS/Linux

# Install Django and essential packages
pip install django djangorestframework          # Core Django + REST API framework
pip install djangorestframework-simplejwt       # JWT token authentication
pip install django-cors-headers                 # Handle cross-origin requests from frontend
pip install python-dotenv                       # Load environment variables from .env file
pip install Pillow                              # Python imaging library for image uploads
```

### 1.2 Create Django Project
```bash
# Create Django project (the main project container)
# The '.' creates project in current directory instead of subdirectory
django-admin startproject backend .

# Create Django apps (modular components of your project)
# Each app handles a specific functionality
python manage.py startapp accounts      # User authentication and profiles
python manage.py startapp core_app      # Main business logic (recipes, items, etc.)
python manage.py startapp interactions  # User interactions (likes, comments, follows)

# Django philosophy: "apps should do one thing and do it well"
# This modular approach makes code maintainable and reusable
```

### 1.3 Project Structure
```
my-backend-project/
├── backend/           # Main Django project (configuration)
│   ├── __init__.py   # Makes it a Python package
│   ├── settings.py   # All Django configuration (database, apps, etc.)
│   ├── urls.py       # Main URL routing (directs requests to apps)
│   └── wsgi.py       # Web server interface for deployment
├── accounts/          # Django app for user authentication
├── core_app/          # Django app for main business logic
├── interactions/      # Django app for user interactions
├── media/            # Directory for user uploaded files (images, etc.)
├── requirements.txt  # List of Python packages needed
├── .env             # Environment variables (secrets, config)
└── manage.py        # Django's command-line utility

# Key concept: Django project vs Django app
# - Project: The entire web application
# - App: A module within the project that does one specific thing
```

---

## 2. Django Configuration

### 2.1 Settings Configuration
```python
# backend/settings.py
# Django settings file - configures entire Django project
import os
from pathlib import Path
from dotenv import load_dotenv  # Load environment variables from .env file

load_dotenv()  # Load .env file into environment variables

# Build paths inside the project like this: BASE_DIR / 'subdir'
BASE_DIR = Path(__file__).resolve().parent.parent  # Project root directory

# SECURITY WARNING: keep the secret key used in production secret!
# Secret key is used for cryptographic signing (sessions, tokens, etc.)
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')  # Load from .env or use default

# SECURITY WARNING: don't run with debug turned on in production!
# Debug mode shows detailed error pages (helpful for development, dangerous for production)
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'  # Convert string to boolean

# Hosts that Django will serve (security feature)
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']  # Local development hosts

# Application definition - tells Django which apps to load
INSTALLED_APPS = [
    # Django built-in apps (always needed)
    'django.contrib.admin',        # Admin interface (/admin/)
    'django.contrib.auth',         # User authentication system
    'django.contrib.contenttypes', # Content type framework
    'django.contrib.sessions',     # Session framework
    'django.contrib.messages',     # Messaging framework
    'django.contrib.staticfiles',  # Static file serving (CSS, JS, images)
    
    # Third party apps (external packages)
    'rest_framework',              # Django REST Framework for APIs
    'rest_framework_simplejwt',    # JWT token authentication
    'corsheaders',                 # Cross-Origin Resource Sharing
    
    # Local apps (your custom apps)
    'accounts',                    # User management
    'core_app',                    # Main business logic
    'interactions',                # User interactions
]

# Middleware - processes requests/responses (order matters!)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',           # Handle CORS (must be first)
    'django.middleware.security.SecurityMiddleware',   # Security headers
    'django.contrib.sessions.middleware.SessionMiddleware',  # Session handling
    'django.middleware.common.CommonMiddleware',       # Common functionality
    'django.middleware.csrf.CsrfViewMiddleware',       # CSRF protection
    'django.contrib.auth.middleware.AuthenticationMiddleware',  # User authentication
    'django.contrib.messages.middleware.MessageMiddleware',     # Message framework
    'django.middleware.clickjacking.XFrameOptionsMiddleware',   # Clickjacking protection
]

# Middleware processes every request/response in order:
# Request: top to bottom
# Response: bottom to top

ROOT_URLCONF = 'backend.urls'

# Database configuration
# Django ORM (Object-Relational Mapping) translates Python to SQL
DATABASES = {
    'default': {  # Default database connection
        'ENGINE': 'django.db.backends.sqlite3',  # Database engine (SQLite for development)
        'NAME': BASE_DIR / 'db.sqlite3',          # Database file location
    }
}

# Custom user model (replaces Django's default User model)
# Must be set before first migration
AUTH_USER_MODEL = 'accounts.User'  # Use our custom User model instead of Django's

# Django REST Framework configuration
REST_FRAMEWORK = {
    # How to authenticate users (verify who they are)
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # Use JWT tokens
    ),
    # Default permissions for all API endpoints
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # Require login by default
    ],
    # Pagination settings (split large lists into pages)
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,  # 12 items per page
}

# Authentication vs Authorization:
# - Authentication: "Who are you?" (login)
# - Authorization: "What can you do?" (permissions)

# JWT (JSON Web Token) Settings
from datetime import timedelta

SIMPLE_JWT = {
    # How long access tokens are valid (short for security)
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),  # 1 hour
    
    # How long refresh tokens are valid (longer for convenience)
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),     # 1 week
    
    # Whether to issue new refresh token when refreshing
    'ROTATE_REFRESH_TOKENS': False,  # Keep same refresh token
}

# JWT Token Flow:
# 1. User logs in → get access token + refresh token
# 2. Use access token for API requests (expires in 1 hour)
# 3. When access token expires → use refresh token to get new access token
# 4. When refresh token expires → user must log in again

# CORS (Cross-Origin Resource Sharing) Settings
# Allows frontend (different domain/port) to access API
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",    # React development server
    "http://127.0.0.1:3000",   # Alternative localhost
]

# CORS is needed because:
# - Frontend runs on http://localhost:3000 (React)
# - Backend runs on http://localhost:8000 (Django)
# - Browsers block cross-origin requests by default
# - CORS headers tell browser "it's okay to allow this"

# Media files (user uploads like profile pictures, recipe images)
MEDIA_URL = '/media/'  # URL prefix for media files
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')  # Directory where files are stored

# Static files (CSS, JavaScript, images that are part of your code)
STATIC_URL = '/static/'  # URL prefix for static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # Where static files are collected for production

# File serving:
# - Development: Django serves files automatically
# - Production: Web server (nginx) serves files directly for performance
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
# Models define database structure using Python classes
from django.contrib.auth.models import AbstractUser  # Django's built-in user model
from django.db import models  # Django's model fields

# Custom User model - extends Django's AbstractUser
# AbstractUser includes: username, email, first_name, last_name, password, date_joined, etc.
class User(AbstractUser):
    # Override email field to make it unique (Django's default allows duplicates)
    email = models.EmailField(unique=True)  # Creates UNIQUE constraint in database
    
    # Additional profile fields not in AbstractUser
    bio = models.TextField(max_length=500, blank=True)  # Optional user description
    
    # ImageField for file uploads
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',  # Files saved to media/profile_pictures/
        blank=True,   # Field can be empty in forms
        null=True     # Field can be NULL in database
    )
    
    # Django authentication settings
    USERNAME_FIELD = 'email'  # Use email for login instead of username
    REQUIRED_FIELDS = ['username']  # Required when creating superuser via command line
    
    def __str__(self):
        # String representation (shown in Django admin)
        return self.email
        
    # This model creates a database table with columns:
    # - id (auto-generated primary key)
    # - username, email, first_name, last_name (from AbstractUser)
    # - password (hashed, from AbstractUser)
    # - bio (our custom field)
    # - profile_picture (file path, our custom field)
    # - date_joined, last_login (from AbstractUser)
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
        # Custom validation method - called automatically by DRF
        # Ensure password confirmation matches original password
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match.")
        return data  # Return validated data if all checks pass
    
    def create(self, validated_data):
        # Custom create method - called when serializer.save() is used
        validated_data.pop('password_confirm')  # Remove confirmation field (not needed in model)
        password = validated_data.pop('password')  # Extract password separately
        
        # Create user without password first
        user = User.objects.create(**validated_data)  # **kwargs unpacks dictionary
        
        # Hash password and save (NEVER store plain text passwords!)
        user.set_password(password)  # Django's built-in password hashing
        user.save()  # Save to database
        return user  # Return created user object
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

# Django REST Framework view decorators
@api_view(['POST'])  # Only accept POST requests
@permission_classes([AllowAny])  # Allow unauthenticated users (public endpoint)
def register(request):
    # Function-based view for user registration
    
    # Create serializer with request data (JSON from frontend)
    serializer = UserRegistrationSerializer(data=request.data)
    
    # Validate data using serializer's validation rules
    if serializer.is_valid():
        # Data is valid - create user
        user = serializer.save()  # Calls serializer's create() method
        
        # Generate JWT tokens for immediate login after registration
        refresh = RefreshToken.for_user(user)  # Create refresh token
        
        # Return success response with user data and access token
        return Response({
            'user': UserSerializer(user).data,  # Serialize user for JSON response
            'token': str(refresh.access_token),  # Access token for API requests
        }, status=status.HTTP_201_CREATED)  # 201 = Created
    
    # Data is invalid - return validation errors
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  # 400 = Bad Request

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
# This file defines the main business logic models
from django.db import models  # Django's model fields and classes
from accounts.models import User  # Import our custom User model

# Main Item model - represents the core entity of your app
class Item(models.Model):  # Inherits from Django's Model base class
    # Define choices for difficulty field (stored as tuples)
    # Format: (database_value, human_readable_display)
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),      # Stored as 'Easy' in DB, displayed as 'Easy'
        ('Medium', 'Medium'),  # Stored as 'Medium' in DB, displayed as 'Medium'
        ('Hard', 'Hard'),      # Stored as 'Hard' in DB, displayed as 'Hard'
    ]
    
    # Basic item information fields
    title = models.CharField(max_length=200)  # VARCHAR(200) - item name
    description = models.TextField()  # TEXT field - unlimited length description
    
    # Choice field with predefined options
    difficulty = models.CharField(
        max_length=10,  # Max length for the choice value
        choices=DIFFICULTY_CHOICES  # Restrict to predefined choices
    )
    
    # File upload field for images
    image = models.ImageField(
        upload_to='item_images/',  # Directory where files are saved
        blank=True,  # Field can be empty in forms
        null=True    # Field can be NULL in database
    )
    
    # Foreign Key relationship - links Item to User
    author = models.ForeignKey(
        User,  # The model this field references
        on_delete=models.CASCADE,  # If user deleted, delete their items
        related_name='items'  # Allows user.items.all() reverse lookup
    )
    
    # Automatic timestamp fields
    created_at = models.DateTimeField(auto_now_add=True)  # Set once when created
    updated_at = models.DateTimeField(auto_now=True)  # Updated every save
    
    def __str__(self):
        # String representation for admin interface and debugging
        return self.title
    
    @property
    def average_rating(self):
        # Property decorator makes this a computed field (not stored in database)
        # Calculate average rating from all related Rating objects
        ratings = self.ratings.all()  # Get all ratings for this item (reverse foreign key)
        if ratings.exists():  # Check if any ratings exist
            # Calculate average: sum all rating values / number of ratings
            return sum(rating.rating for rating in ratings) / ratings.count()
        return 0  # Return 0 if no ratings yet
    
    @property
    def likes_count(self):
        # Count total likes for this item using reverse foreign key relationship
        return self.likes.count()  # Efficient database COUNT query
        
    # Properties vs Fields:
    # - Fields: Stored in database (title, description, etc.)
    # - Properties: Calculated on-the-fly (average_rating, likes_count)
    # - Properties are useful for computed values that depend on related data
    
    # This model creates a database table with columns:
    # - id (auto-generated primary key)
    # - title (VARCHAR(200))
    # - description (TEXT)
    # - difficulty (VARCHAR(10) with CHECK constraint)
    # - image (VARCHAR(100) - file path)
    # - author_id (INTEGER - foreign key to User table)
    # - created_at (DATETIME)
    # - updated_at (DATETIME)
```

### 4.2 Interaction Models
```python
# interactions/models.py
from django.db import models
from accounts.models import User
from core_app.models import Item

# Rating model - represents a user's rating of an item
class Rating(models.Model):
    # Foreign Key relationships - create links between tables
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,  # If user deleted, delete their ratings
        related_name='ratings'     # Allows user.ratings.all() reverse lookup
    )
    item = models.ForeignKey(
        Item, 
        on_delete=models.CASCADE,  # If item deleted, delete its ratings
        related_name='ratings'     # Allows item.ratings.all() reverse lookup
    )
    
    # Rating value with choices (1-5 stars)
    rating = models.PositiveIntegerField(
        choices=[(i, i) for i in range(1, 6)]  # Creates choices: [(1,1), (2,2), (3,3), (4,4), (5,5)]
    )
    
    # Automatic timestamp
    created_at = models.DateTimeField(auto_now_add=True)  # Set when object is created
    
    class Meta:
        # Database constraints and options
        unique_together = ('user', 'item')  # One user can only rate each item once
        # This creates a composite unique index in the database
    
    def __str__(self):
        # String representation for admin interface and debugging
        return f"{self.user.username} - {self.item.title} ({self.rating}/5)"
        
    # This model creates a database table with:
    # - id (primary key)
    # - user_id (foreign key to User table)
    # - item_id (foreign key to Item table)
    # - rating (integer 1-5)
    # - created_at (timestamp)
    # - UNIQUE constraint on (user_id, item_id)

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

# Class-based view for listing and creating items
# ListCreateAPIView provides GET (list) and POST (create) methods
class ItemListCreateView(generics.ListCreateAPIView):
    # Base queryset - optimized with select_related to avoid N+1 queries
    queryset = Item.objects.select_related('author').all()  # JOIN with User table
    serializer_class = ItemSerializer  # Default serializer
    
    def get_queryset(self):
        # Custom queryset method - allows dynamic filtering
        queryset = Item.objects.select_related('author').all()
        
        # Search functionality using query parameters
        # Example: /api/items/?q=pizza
        search = self.request.query_params.get('q', None)  # Get 'q' parameter
        if search:
            # Use Q objects for complex queries (OR condition)
            queryset = queryset.filter(
                models.Q(title__icontains=search) |  # Search in title (case-insensitive)
                models.Q(description__icontains=search)  # OR search in description
            )
        
        # Filter by difficulty
        # Example: /api/items/?difficulty=Easy
        difficulty = self.request.query_params.get('difficulty', None)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)  # Exact match
        
        return queryset
    
    def get_serializer_class(self):
        # Use different serializers for different HTTP methods
        if self.request.method == 'POST':  # Creating new item
            return ItemCreateSerializer  # Simpler serializer for creation
        return ItemSerializer  # Full serializer for listing
    
    def get_permissions(self):
        # Dynamic permissions based on HTTP method
        if self.request.method == 'POST':  # Creating requires authentication
            return [IsAuthenticated()]  # Must be logged in
        return [AllowAny()]  # Listing is public

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

# Function-based view for rating items
@api_view(['POST'])  # Only accept POST requests
@permission_classes([IsAuthenticated])  # Require authentication
def rate_item(request, pk):
    # Function-based view for rating an item
    # pk parameter comes from URL: /api/items/123/rate/
    
    try:
        # Try to get the item by primary key
        item = Item.objects.get(pk=pk)  # SELECT * FROM items WHERE id = pk
    except Item.DoesNotExist:
        # Item not found - return 404 error
        return Response({'error': 'Item not found'}, 
                      status=status.HTTP_404_NOT_FOUND)
    
    # Create rating serializer with request data
    serializer = RatingSerializer(
        data={'rating': request.data.get('rating')},  # Extract rating from request
        context={
            'request': request,  # Pass request for user access
            'view': type('obj', (object,), {'kwargs': {'pk': pk}})()  # Mock view object
        }
    )
    
    # Validate and save rating
    if serializer.is_valid():
        serializer.save()  # Create or update rating
        
        # Return updated item data with new rating
        item_serializer = ItemSerializer(item, context={'request': request})
        return Response(item_serializer.data, status=status.HTTP_201_CREATED)
    
    # Validation failed - return errors
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