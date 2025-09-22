# 🍽️ TasteStack Complete Tutorial
## Learn Django, React, ORM & SQLite Step by Step

### Table of Contents
1. [Project Overview](#project-overview)
2. [Backend Setup (Django)](#backend-setup)
3. [Database Design (SQLite + ORM)](#database-design)
4. [Authentication System](#authentication-system)
5. [Recipe Management](#recipe-management)
6. [Social Features](#social-features)
7. [Frontend Setup (React)](#frontend-setup)
8. [API Integration](#api-integration)
9. [Media File Handling](#media-file-handling)
10. [Docker Deployment](#docker-deployment)

---

## 1. Project Overview

TasteStack is a recipe sharing platform built with:
- **Backend**: Django REST Framework ✅ **LIVE**
- **Frontend**: React with Tailwind CSS 🔄 **PENDING**
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT tokens ✅ **WORKING**
- **Deployment**: PythonAnywhere + Vercel

### Architecture
```
Frontend (React) ←→ API (Django REST) ←→ Database (SQLite)
     Vercel           PythonAnywhere        SQLite
```

### 🌐 Live Demo
- **Backend API**: https://shksabbir7.pythonanywhere.com/
- **Admin Panel**: https://shksabbir7.pythonanywhere.com/admin/
- **Status**: ✅ Production Ready with 5 sample recipes

---

## 2. Backend Setup (Django)

### Step 1: Create Django Project
```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install Django
pip install django djangorestframework

# Create project
django-admin startproject tastestack
cd tastestack
```

### Step 2: Project Structure
```
backend/
├── tastestack/          # Main project
│   ├── __init__.py
│   ├── settings.py      # Configuration
│   ├── urls.py          # URL routing
│   └── wsgi.py
├── accounts/            # User management app
├── recipes/             # Recipe management app
├── interactions/        # Social features app
└── manage.py
```

### Step 3: Settings Configuration
```python
# tastestack/settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'accounts',
    'recipes',
    'interactions',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12
}

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Media Files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

---

## 3. Database Design (SQLite + ORM)

### Understanding Django ORM
Django ORM (Object-Relational Mapping) converts Python classes to database tables.

### Step 1: User Model (Custom User)
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
    date_joined = models.DateTimeField(auto_now_add=True)
    followers = models.ManyToManyField(
        'self', 
        symmetrical=False, 
        related_name='following',
        blank=True
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
```

### Step 2: Recipe Model
```python
# recipes/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Recipe(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    ingredients = models.TextField()
    instructions = models.TextField()
    prep_time = models.PositiveIntegerField()  # in minutes
    cook_time = models.PositiveIntegerField()  # in minutes
    servings = models.PositiveIntegerField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    cuisine = models.CharField(max_length=100)
    image = models.ImageField(upload_to='recipe_images/', blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def total_time(self):
        return self.prep_time + self.cook_time
    
    @property
    def average_rating(self):
        ratings = self.ratings.all()
        if ratings:
            return sum(r.rating for r in ratings) / len(ratings)
        return 0
```

### Step 3: Social Interaction Models
```python
# interactions/models.py
from django.db import models
from django.contrib.auth import get_user_model
from recipes.models import Recipe

User = get_user_model()

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'recipe')

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

class Rating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ratings')
    rating = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)])
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'recipe')
```

### Step 4: Database Migrations
```bash
# Create migrations
python manage.py makemigrations accounts
python manage.py makemigrations recipes
python manage.py makemigrations interactions

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Understanding SQLite
SQLite is a file-based database perfect for development:
- **File**: `db.sqlite3` in your project root
- **No server required**: Embedded in your application
- **ACID compliant**: Reliable transactions
- **SQL syntax**: Standard SQL queries

---

## 4. Authentication System

### Step 1: JWT Configuration
```python
# tastestack/settings.py
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### Step 2: User Serializers
```python
# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'bio')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    recipes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'bio', 'profile_picture', 
                 'date_joined', 'followers_count', 'following_count', 'recipes_count')
        read_only_fields = ('id', 'date_joined')
    
    def get_followers_count(self, obj):
        return obj.followers.count()
    
    def get_following_count(self, obj):
        return obj.following.count()
    
    def get_recipes_count(self, obj):
        return obj.recipes.count()
```

### Step 3: Authentication Views
```python
# accounts/views.py
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import UserRegistrationSerializer, UserProfileSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if email and password:
        user = authenticate(username=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserProfileSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
    
    return Response(
        {'error': 'Invalid credentials'}, 
        status=status.HTTP_401_UNAUTHORIZED
    )

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
```

### Step 4: URL Configuration
```python
# accounts/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
]

# tastestack/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

---

## 5. Recipe Management

### Step 1: Recipe Serializers
```python
# recipes/serializers.py
from rest_framework import serializers
from .models import Recipe
from accounts.serializers import UserProfileSerializer

class RecipeSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    average_rating = serializers.ReadOnlyField()
    total_time = serializers.ReadOnlyField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Recipe
        fields = '__all__'
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class RecipeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ('title', 'description', 'ingredients', 'instructions', 
                 'prep_time', 'cook_time', 'servings', 'difficulty', 'cuisine', 'image')
```

### Step 2: Recipe Views
```python
# recipes/views.py
from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Recipe
from .serializers import RecipeSerializer, RecipeCreateSerializer

class RecipeListCreateView(generics.ListCreateAPIView):
    queryset = Recipe.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['difficulty', 'cuisine', 'author']
    search_fields = ['title', 'description', 'ingredients']
    ordering_fields = ['created_at', 'prep_time', 'cook_time']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RecipeCreateSerializer
        return RecipeSerializer

class RecipeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.IsAuthenticatedOrReadOnly()]

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_recipes(request):
    recipes = Recipe.objects.filter(author=request.user)
    serializer = RecipeSerializer(recipes, many=True, context={'request': request})
    return Response(serializer.data)
```

### Step 3: Recipe URLs
```python
# recipes/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.RecipeListCreateView.as_view(), name='recipe-list-create'),
    path('<int:pk>/', views.RecipeDetailView.as_view(), name='recipe-detail'),
    path('my-recipes/', views.my_recipes, name='my-recipes'),
]
```

---

## 6. Social Features

### Step 1: Interaction Serializers
```python
# interactions/serializers.py
from rest_framework import serializers
from .models import Like, Comment, Rating
from accounts.serializers import UserProfileSerializer

class CommentSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ('id', 'user', 'content', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

class RatingSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Rating
        fields = ('id', 'user', 'rating', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ('id', 'created_at')
```

### Step 2: Interaction Views
```python
# interactions/views.py
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from recipes.models import Recipe
from .models import Like, Comment, Rating
from .serializers import CommentSerializer, RatingSerializer

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_like(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    like, created = Like.objects.get_or_create(user=request.user, recipe=recipe)
    
    if not created:
        like.delete()
        return Response({'liked': False, 'likes_count': recipe.likes.count()})
    
    return Response({'liked': True, 'likes_count': recipe.likes.count()})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_comment(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    serializer = CommentSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save(user=request.user, recipe=recipe)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_comments(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    comments = Comment.objects.filter(recipe=recipe)
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def rate_recipe(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    rating_value = request.data.get('rating')
    
    if not rating_value or not (1 <= int(rating_value) <= 5):
        return Response({'error': 'Rating must be between 1 and 5'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    rating, created = Rating.objects.update_or_create(
        user=request.user, 
        recipe=recipe,
        defaults={'rating': rating_value}
    )
    
    serializer = RatingSerializer(rating)
    return Response(serializer.data)
```

### Step 3: Interaction URLs
```python
# interactions/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('recipes/<int:recipe_id>/like/', views.toggle_like, name='toggle-like'),
    path('recipes/<int:recipe_id>/comment/', views.add_comment, name='add-comment'),
    path('recipes/<int:recipe_id>/comments/', views.get_comments, name='get-comments'),
    path('recipes/<int:recipe_id>/rate/', views.rate_recipe, name='rate-recipe'),
]
```

---

## 7. Frontend Setup (React)

### Step 1: Create React App
```bash
npx create-react-app frontend
cd frontend
npm install axios react-router-dom js-cookie react-hot-toast
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 3: Project Structure
```
frontend/src/
├── components/          # Reusable components
│   ├── common/         # Common UI components
│   ├── recipe/         # Recipe-specific components
│   └── auth/           # Authentication components
├── pages/              # Page components
├── services/           # API services
├── contexts/           # React contexts
├── utils/              # Utility functions
├── App.js
└── index.js
```

### Step 4: API Service Setup
```javascript
// src/services/api.js
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken
          });
          const newToken = response.data.access;
          Cookies.set('access_token', newToken);
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return api.request(error.config);
        } catch (refreshError) {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 8. API Integration

### Step 1: Authentication Context
```javascript
// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/profile/');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login/', { email, password });
      const { user, access, refresh } = response.data;
      
      Cookies.set('access_token', access);
      Cookies.set('refresh_token', refresh);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      const { user, access, refresh } = response.data;
      
      Cookies.set('access_token', access);
      Cookies.set('refresh_token', refresh);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Step 2: Recipe Service
```javascript
// src/services/recipeService.js
import api from './api';

export const recipeService = {
  // Get all recipes with filters
  getRecipes: async (params = {}) => {
    const response = await api.get('/recipes/', { params });
    return response.data;
  },

  // Get single recipe
  getRecipe: async (id) => {
    const response = await api.get(`/recipes/${id}/`);
    return response.data;
  },

  // Create new recipe
  createRecipe: async (recipeData) => {
    const formData = new FormData();
    Object.keys(recipeData).forEach(key => {
      if (recipeData[key] !== null && recipeData[key] !== undefined) {
        formData.append(key, recipeData[key]);
      }
    });
    
    const response = await api.post('/recipes/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Update recipe
  updateRecipe: async (id, recipeData) => {
    const formData = new FormData();
    Object.keys(recipeData).forEach(key => {
      if (recipeData[key] !== null && recipeData[key] !== undefined) {
        formData.append(key, recipeData[key]);
      }
    });
    
    const response = await api.patch(`/recipes/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete recipe
  deleteRecipe: async (id) => {
    await api.delete(`/recipes/${id}/`);
  },

  // Get user's recipes
  getMyRecipes: async () => {
    const response = await api.get('/recipes/my-recipes/');
    return response.data;
  },
};
```

### Step 3: Interaction Service
```javascript
// src/services/interactionService.js
import api from './api';

export const interactionService = {
  // Toggle like
  toggleLike: async (recipeId) => {
    const response = await api.post(`/interactions/recipes/${recipeId}/like/`);
    return response.data;
  },

  // Add comment
  addComment: async (recipeId, content) => {
    const response = await api.post(`/interactions/recipes/${recipeId}/comment/`, {
      content
    });
    return response.data;
  },

  // Get comments
  getComments: async (recipeId) => {
    const response = await api.get(`/interactions/recipes/${recipeId}/comments/`);
    return response.data;
  },

  // Rate recipe
  rateRecipe: async (recipeId, rating) => {
    const response = await api.post(`/interactions/recipes/${recipeId}/rate/`, {
      rating
    });
    return response.data;
  },
};
```

---

## 9. Media File Handling

### Step 1: Backend Media Configuration
```python
# tastestack/settings.py
import os

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
```

### Step 2: Image Upload Component
```javascript
// src/components/common/ImageUpload.js
import React, { useState } from 'react';

const ImageUpload = ({ onImageSelect, currentImage, label = "Upload Image" }) => {
  const [preview, setPreview] = useState(currentImage || null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Pass file to parent component
      onImageSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="flex items-center space-x-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
```

### Step 3: Recipe Form with Image Upload
```javascript
// src/components/recipe/RecipeForm.js
import React, { useState } from 'react';
import ImageUpload from '../common/ImageUpload';
import { recipeService } from '../../services/recipeService';
import toast from 'react-hot-toast';

const RecipeForm = ({ recipe = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: recipe?.title || '',
    description: recipe?.description || '',
    ingredients: recipe?.ingredients || '',
    instructions: recipe?.instructions || '',
    prep_time: recipe?.prep_time || '',
    cook_time: recipe?.cook_time || '',
    servings: recipe?.servings || '',
    difficulty: recipe?.difficulty || 'easy',
    cuisine: recipe?.cuisine || '',
    image: null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageSelect = (file) => {
    setFormData({
      ...formData,
      image: file,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (recipe) {
        result = await recipeService.updateRecipe(recipe.id, formData);
        toast.success('Recipe updated successfully!');
      } else {
        result = await recipeService.createRecipe(formData);
        toast.success('Recipe created successfully!');
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      toast.error('Failed to save recipe');
      console.error('Recipe save error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <ImageUpload
        onImageSelect={handleImageSelect}
        currentImage={recipe?.image}
        label="Recipe Image"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Prep Time (minutes)</label>
          <input
            type="number"
            name="prep_time"
            value={formData.prep_time}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cook Time (minutes)</label>
          <input
            type="number"
            name="cook_time"
            value={formData.cook_time}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Servings</label>
          <input
            type="number"
            name="servings"
            value={formData.servings}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cuisine</label>
          <input
            type="text"
            name="cuisine"
            value={formData.cuisine}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Ingredients</label>
        <textarea
          name="ingredients"
          value={formData.ingredients}
          onChange={handleChange}
          rows={5}
          required
          placeholder="List ingredients, one per line"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Instructions</label>
        <textarea
          name="instructions"
          value={formData.instructions}
          onChange={handleChange}
          rows={8}
          required
          placeholder="Step-by-step cooking instructions"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Saving...' : (recipe ? 'Update Recipe' : 'Create Recipe')}
      </button>
    </form>
  );
};

export default RecipeForm;
```

---

## 10. Docker Deployment

### Step 1: Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chmod +x docker-entrypoint.sh

EXPOSE 8000

CMD ["bash", "-c", "echo '🚀 Starting TasteStack Backend...' && echo '🗃️ Using SQLite database' && echo '📊 Running database migrations...' && python manage.py migrate && echo '🌟 Starting Django server...' && python manage.py runserver 0.0.0.0:8000"]
```

### Step 2: Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Step 3: Docker Compose Configuration
```yaml
# docker/docker-compose.sqlite.yml
services:
  backend:
    build: ../backend
    ports:
      - "8000:8000"
    environment:
      - DEBUG=True
      - USE_SQLITE=1
    volumes:
      - ../backend:/app
      - ../backend/media:/app/media

  frontend:
    build: ../frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:8000/api
      - REACT_APP_MEDIA_URL=http://localhost:8000
    volumes:
      - ../frontend:/app
      - /app/node_modules

volumes:
  media_volume:
```

### Step 4: Deployment Scripts
```batch
REM docker/run-sqlite.bat
@echo off
echo 🗃️ Starting TasteStack with SQLite...
echo ✅ Simple setup, no external database needed
echo.
cd /d "%~dp0"
docker-compose -f docker-compose.sqlite.yml up --build
```

---

## How to Add New Features

### Adding a New Model
1. **Create Model**: Define in `models.py`
2. **Create Migration**: `python manage.py makemigrations`
3. **Apply Migration**: `python manage.py migrate`
4. **Create Serializer**: Define API serialization
5. **Create Views**: Define API endpoints
6. **Add URLs**: Configure routing
7. **Frontend Service**: Create API calls
8. **Frontend Components**: Build UI

### Adding a New API Endpoint
1. **Define View Function/Class**
2. **Add URL Pattern**
3. **Test with Postman/curl**
4. **Create Frontend Service Function**
5. **Integrate in Components**

### Adding a New React Component
1. **Create Component File**
2. **Define Props Interface**
3. **Implement Component Logic**
4. **Add Styling (Tailwind)**
5. **Import and Use in Parent**

This tutorial provides a complete foundation for building full-stack applications with Django and React. Each section builds upon the previous one, giving you the knowledge to extend and modify the TasteStack platform.