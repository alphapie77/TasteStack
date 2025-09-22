# 📡 TasteStack API Reference

**Base URL**: `https://shksabbir7.pythonanywhere.com` (Production)  
**Local URL**: `http://localhost:8000` (Development)

## 🔐 Authentication

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Token Format
```json
{
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## 👤 Authentication Endpoints

### Register User
```http
POST /api/auth/register/
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "",
    "last_name": "",
    "bio": "",
    "profile_picture": null,
    "date_joined": "2024-01-01T00:00:00Z"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Login User
```http
POST /api/auth/login/
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "user": {...},
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Get Current User
```http
GET /api/auth/user/
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Food enthusiast",
  "profile_picture": "https://example.com/media/profile_pictures/user.jpg",
  "location": "New York",
  "website": "https://johndoe.com",
  "date_joined": "2024-01-01T00:00:00Z"
}
```

### Update Profile
```http
PUT /api/auth/user/update/
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
first_name: John
last_name: Doe
bio: Updated bio
location: San Francisco
website: https://newsite.com
profile_picture: <file>
```

### Dashboard Statistics
```http
GET /api/auth/dashboard-stats/
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "total_recipes": 15,
  "total_likes": 42,
  "total_comments": 28,
  "followers_count": 8,
  "following_count": 12
}
```

### Recent Activity
```http
GET /api/auth/recent-activity/
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "activities": [
    {
      "type": "recipe_created",
      "message": "You created a new recipe: \"Chocolate Cake\"",
      "timestamp": "2024-01-01T12:00:00Z",
      "recipe_id": 5
    },
    {
      "type": "recipe_liked",
      "message": "Your recipe \"Pasta\" was liked by alice",
      "timestamp": "2024-01-01T11:30:00Z",
      "recipe_id": 3
    }
  ]
}
```

### Public Profile
```http
GET /api/auth/profile/{user_id}/
```

**Response (200):**
```json
{
  "user": {
    "id": 2,
    "username": "alice",
    "first_name": "Alice",
    "last_name": "Smith",
    "bio": "Chef and food blogger",
    "profile_picture": "https://example.com/media/profile_pictures/alice.jpg",
    "location": "Paris",
    "website": "https://alicecooks.com",
    "date_joined": "2024-01-01T00:00:00Z"
  },
  "stats": {
    "total_recipes": 25,
    "total_likes": 150,
    "average_rating": 4.2,
    "followers_count": 45,
    "following_count": 30
  },
  "recent_recipes": [...],
  "is_following": false
}
```

### Follow/Unfollow User
```http
POST /api/auth/follow/{user_id}/
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "following": true,
  "message": "Followed successfully"
}
```

## 🍽️ Recipe Endpoints

### List Recipes
```http
GET /api/recipes/
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `q`: Search query
- `category`: Filter by category
- `difficulty`: Filter by difficulty (Easy/Medium/Hard)
- `max_time`: Maximum cooking time in minutes
- `author`: Filter by author name
- `min_rating`: Minimum average rating

**Example:**
```http
GET /api/recipes/?q=pasta&category=italian&difficulty=Easy&page=2
```

**Response (200):**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Spaghetti Carbonara",
      "description": "Classic Italian pasta dish",
      "ingredients": ["pasta", "eggs", "bacon", "cheese"],
      "instructions": ["Boil pasta", "Cook bacon", "Mix with eggs"],
      "prep_time": 15,
      "cook_time": 20,
      "servings": 4,
      "difficulty": "Easy",
      "category": "italian,dinner",
      "image": "https://example.com/media/recipe_images/carbonara.jpg",
      "author": {
        "id": 1,
        "username": "john_doe",
        "profile_picture": "https://example.com/media/profile_pictures/john.jpg"
      },
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z",
      "average_rating": 4.5,
      "likes_count": 12,
      "is_liked": false,
      "user_rating": null
    }
  ],
  "count": 25,
  "total_pages": 3,
  "next": "http://localhost:8000/api/recipes/?page=3",
  "previous": "http://localhost:8000/api/recipes/?page=1"
}
```

### Create Recipe
```http
POST /api/recipes/
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
title: Chocolate Cake
description: Delicious chocolate cake recipe
ingredients: ["flour", "sugar", "cocoa", "eggs"]
instructions: ["Mix dry ingredients", "Add wet ingredients", "Bake"]
prep_time: 30
cook_time: 45
servings: 8
difficulty: Medium
category: dessert,baking
image: <file>
```

**Response (201):**
```json
{
  "id": 15,
  "title": "Chocolate Cake",
  "description": "Delicious chocolate cake recipe",
  "ingredients": ["flour", "sugar", "cocoa", "eggs"],
  "instructions": ["Mix dry ingredients", "Add wet ingredients", "Bake"],
  "prep_time": 30,
  "cook_time": 45,
  "servings": 8,
  "difficulty": "Medium",
  "category": "dessert,baking",
  "image": "https://example.com/media/recipe_images/cake.jpg",
  "author": {...},
  "created_at": "2024-01-01T15:00:00Z",
  "updated_at": "2024-01-01T15:00:00Z",
  "average_rating": 0,
  "likes_count": 0,
  "is_liked": false,
  "user_rating": null
}
```

### Get Recipe Details
```http
GET /api/recipes/{id}/
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Spaghetti Carbonara",
  "description": "Classic Italian pasta dish with eggs, bacon, and cheese",
  "ingredients": ["400g spaghetti", "4 eggs", "200g bacon", "100g parmesan"],
  "instructions": [
    "Boil pasta in salted water",
    "Cook bacon until crispy",
    "Beat eggs with cheese",
    "Mix hot pasta with egg mixture",
    "Add bacon and serve"
  ],
  "prep_time": 15,
  "cook_time": 20,
  "servings": 4,
  "difficulty": "Easy",
  "category": "italian,dinner",
  "image": "https://example.com/media/recipe_images/carbonara.jpg",
  "author": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "profile_picture": "https://example.com/media/profile_pictures/john.jpg"
  },
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z",
  "average_rating": 4.5,
  "likes_count": 12,
  "is_liked": true,
  "user_rating": 5
}
```

### Update Recipe
```http
PUT /api/recipes/{id}/
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Note**: Only recipe author can update

### Delete Recipe
```http
DELETE /api/recipes/{id}/
Authorization: Bearer <token>
```

**Note**: Only recipe author can delete

**Response (204):** No content

### Rate Recipe
```http
POST /api/recipes/{id}/rate/
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rating": 5
}
```

**Response (201):**
```json
{
  "id": 1,
  "title": "Spaghetti Carbonara",
  "average_rating": 4.6,
  "user_rating": 5,
  ...
}
```

### Search Recipes
```http
GET /api/recipes/search/?q=pasta
```

### My Recipes
```http
GET /api/recipes/my-recipes/
Authorization: Bearer <token>
```

## 💬 Interaction Endpoints

### Like Recipe
```http
POST /api/interactions/recipes/{id}/like/
Authorization: Bearer <token>
```

**Response (201):**
```json
{
  "message": "Recipe liked successfully"
}
```

### Unlike Recipe
```http
POST /api/interactions/recipes/{id}/unlike/
Authorization: Bearer <token>
```

**Response (204):** No content

### Get Recipe Comments
```http
GET /api/interactions/recipes/{id}/comments/
```

**Response (200):**
```json
[
  {
    "id": 1,
    "user": {
      "id": 2,
      "username": "alice",
      "profile_picture": "https://example.com/media/profile_pictures/alice.jpg"
    },
    "content": "Great recipe! Loved it.",
    "created_at": "2024-01-01T14:00:00Z",
    "updated_at": "2024-01-01T14:00:00Z",
    "hidden": false
  }
]
```

### Add Comment
```http
POST /api/interactions/recipes/{id}/comments/add/
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "This recipe is amazing!"
}
```

**Response (201):**
```json
{
  "id": 5,
  "user": {
    "id": 1,
    "username": "john_doe",
    "profile_picture": "https://example.com/media/profile_pictures/john.jpg"
  },
  "content": "This recipe is amazing!",
  "created_at": "2024-01-01T16:00:00Z",
  "updated_at": "2024-01-01T16:00:00Z",
  "hidden": false
}
```

### Edit Comment
```http
PUT /api/interactions/recipes/{recipe_id}/comments/{comment_id}/edit/
Authorization: Bearer <token>
```

**Note**: Only comment author can edit

### Delete Comment
```http
DELETE /api/interactions/recipes/{recipe_id}/comments/{comment_id}/delete/
Authorization: Bearer <token>
```

**Note**: Comment author or recipe author can delete

### Hide Comment
```http
POST /api/interactions/recipes/{recipe_id}/comments/{comment_id}/hide/
Authorization: Bearer <token>
```

**Note**: Comment author or recipe author can hide

## 📊 Statistics

### Platform Statistics
```http
GET /api/recipes/statistics/
```

**Response (200):**
```json
{
  "total_recipes": 150,
  "total_users": 45,
  "total_likes": 320,
  "total_comments": 180,
  "average_rating": 4.2
}
```

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input data",
  "details": {
    "email": ["This field is required."],
    "password": ["Password too short."]
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "error": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "error": "Recipe not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- File uploads use multipart/form-data
- JSON arrays for ingredients and instructions
- Categories are comma-separated strings
- Ratings are integers from 1-5
- Pagination uses page numbers starting from 1
- Search is case-insensitive across title, description, and ingredients