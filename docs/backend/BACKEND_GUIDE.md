# 🔧 TasteStack Backend Guide

## 🏗️ Architecture Overview

# TasteStack backend follows the Model-View-Controller (MVC) pattern:
# - Models: Define database structure and business logic
# - Views: Handle HTTP requests and responses (API endpoints)
# - Serializers: Convert between JSON and Python objects
# - URLs: Route requests to appropriate views

TasteStack backend is built with Django REST Framework, providing a robust API for the recipe sharing platform.

### Technology Stack
- **Framework**: Django 5.2.1 + Django REST Framework 3.16.1  # Web framework + API toolkit
- **Authentication**: JWT tokens (SimpleJWT)  # Stateless token-based auth
- **Database**: SQLite (dev) / PostgreSQL (prod)  # File-based vs server database
- **Image Processing**: Pillow  # Python imaging library for uploads
- **CORS**: django-cors-headers  # Cross-origin requests from frontend

## 📊 Database Models

### User Management (accounts app)
```python
# Custom User Model - extends Django's built-in user
class User(AbstractUser):
    email = EmailField(unique=True)  # Primary login field instead of username
    username = CharField(flexible validation)  # Display name, not for login
    bio = TextField(500 chars)  # User description
    location = CharField(200 chars)  # User location
    website = URLField  # Personal website link
    profile_picture = ImageField  # Avatar upload
```

### Recipe System (recipes app)
```python
# Main Recipe model - represents a cooking recipe
class Recipe(Model):  # Inherits from Django's Model class
    # Basic recipe information
    title = CharField(200)  # VARCHAR(200) in database, recipe name
    description = TextField  # TEXT field, unlimited length recipe overview
    
    # JSON fields store complex data as JSON in database
    # Example: ["2 cups flour", "1 tsp salt", "3 eggs"]
    ingredients = JSONField  # Array of ingredient strings with quantities
    
    # Example: ["Mix dry ingredients", "Add eggs", "Bake 30 minutes"]
    instructions = JSONField  # Array of step-by-step cooking instructions
    
    # Time fields - PositiveIntegerField only allows positive numbers
    prep_time = PositiveIntegerField  # Preparation time in minutes (INTEGER >= 0)
    cook_time = PositiveIntegerField  # Cooking time in minutes (INTEGER >= 0)
    servings = PositiveIntegerField  # Number of servings (INTEGER >= 0)
    
    # Choice fields with predefined options
    difficulty = CharField  # Easy/Medium/Hard skill level (VARCHAR with choices)
    category = CharField  # Food category from 18 predefined options
    
    # File upload field
    image = ImageField  # Stores recipe photo in media/recipe_images/
    
    # Foreign Key relationship - links to User model
    # Creates 'author_id' column in database with foreign key constraint
    # on_delete=CASCADE means: if user is deleted, delete their recipes too
    author = ForeignKey(User, on_delete=CASCADE)  # Recipe creator
    
    # Automatic timestamp fields (commonly added)
    created_at = DateTimeField(auto_now_add=True)  # Set once when created
    updated_at = DateTimeField(auto_now=True)  # Updated every time saved
```

### Social Features (interactions app)
```python
class Rating(Model):
    user = ForeignKey(User)  # Who rated
    recipe = ForeignKey(Recipe)  # What was rated
    rating = PositiveIntegerField  # 1-5 star rating
    # unique_together: prevents duplicate ratings

class Like(Model):
    user = ForeignKey(User)  # Who liked
    recipe = ForeignKey(Recipe)  # What was liked
    # unique_together: prevents duplicate likes

class Comment(Model):
    user = ForeignKey(User)  # Comment author
    recipe = ForeignKey(Recipe)  # Recipe being commented on
    content = TextField  # Comment text
    hidden = BooleanField  # For content moderation

class Follow(Model):
    follower = ForeignKey(User)  # User doing the following
    following = ForeignKey(User)  # User being followed
    # unique_together: prevents duplicate follows
```

## 🔗 API Endpoints

# RESTful API design principles:
# - GET: Retrieve data (safe, no side effects)
# - POST: Create new resources
# - PUT: Update existing resources (full update)
# - PATCH: Partial update
# - DELETE: Remove resources

### Authentication (`/api/auth/`)
```
# User account management endpoints
POST /register/           - Create new user account (returns JWT token)
POST /login/              - Authenticate with email/password (returns JWT token)
GET  /user/               - Get current authenticated user's profile
PUT  /user/update/        - Update current user's profile information

# Dashboard and social features
GET  /dashboard-stats/    - Get user's recipe count, followers, etc.
GET  /recent-activity/    - Get recent likes, comments on user's recipes
GET  /profile/<id>/       - Get public profile of any user (by user ID)
POST /follow/<id>/        - Follow or unfollow a user (toggle)

# Password reset flow
POST /forgot-password/    - Send password reset email (requires email)
POST /reset-password/     - Reset password using token from email
```

### Recipes (`/api/recipes/`)
```
# CRUD operations for recipes
GET    /                  - List all recipes (paginated, 12 per page)
POST   /                  - Create new recipe (requires authentication)
GET    /<id>/             - Get single recipe details (includes ratings, likes)
PUT    /<id>/             - Update entire recipe (owner only)
DELETE /<id>/             - Delete recipe (owner only)

# Recipe interactions
POST   /<id>/rate/        - Rate recipe 1-5 stars (authenticated users)

# Search and filtering
GET    /search/           - Search recipes by title, ingredients, category
                          # Query params: ?q=search_term&category=dessert&difficulty=easy

# User-specific endpoints
GET    /my-recipes/       - Get current user's recipes only
GET    /statistics/       - Platform-wide stats (total recipes, users, etc.)
```

### Interactions (`/api/interactions/`)
```
# Like system (toggle-based)
POST /recipes/<id>/like/              - Like a recipe (creates Like object)
POST /recipes/<id>/unlike/            - Unlike a recipe (deletes Like object)

# Comment system (full CRUD)
GET  /recipes/<id>/comments/          - Get all comments for a recipe
POST /recipes/<id>/comments/add/      - Add new comment to recipe
PUT  /recipes/<id>/comments/<id>/edit/ - Edit own comment (author only)
DELETE /recipes/<id>/comments/<id>/delete/ - Delete own comment (author only)

# Comment moderation (recipe owners can hide comments)
POST /recipes/<id>/comments/<id>/hide/ - Hide/unhide comment (recipe owner only)

# User dashboard for managing interactions
GET  /comments/my-recipes/            - Get all comments on current user's recipes
```

## 🔐 Security Features

### Authentication (Who are you?)
# JWT (JSON Web Tokens) - stateless authentication
- JWT token-based authentication  # No server-side sessions needed
- Access token: 60 minutes lifetime  # Short-lived for security
- Refresh token: 7 days lifetime  # Longer-lived for convenience
- Email-based login (not username)  # More secure, harder to guess

# How JWT works:
# 1. User logs in with email/password
# 2. Server validates credentials
# 3. Server creates JWT token containing user ID
# 4. Client stores token and sends in Authorization header
# 5. Server validates token on each request

### Authorization (What can you do?)
# Django REST Framework permission classes
- Permission classes: IsAuthenticated, AllowAny  # Control access to endpoints
- Owner-only access for recipe CRUD  # Users can only edit their own recipes
- Comment moderation by recipe owners  # Recipe authors can hide comments

# Permission levels:
# - AllowAny: Public access (recipe list, recipe details)
# - IsAuthenticated: Logged-in users only (create recipe, comment)
# - IsOwner: Resource owner only (edit/delete own recipes)

### Data Protection
- XSS prevention with HTML escaping  # Prevents malicious script injection
- Path traversal protection  # Prevents access to system files
- Strong password validation  # Enforces password complexity
- CORS configuration for frontend  # Controls which domains can access API

## 🔧 Configuration

### Environment Variables
```env
# Core Settings
DEBUG=True/False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=comma-separated

# Database
DATABASE_ENGINE=sqlite/postgresql
DATABASE_URL=full-database-url
POSTGRES_DB=database-name
POSTGRES_USER=username
POSTGRES_PASSWORD=password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=comma-separated-urls
CORS_ALLOW_ALL_ORIGINS=True/False

# Media
MEDIA_URL=/media/
```

### Database Configuration
```python
# Dynamic database switching based on environment
def get_database_config(base_dir):
    db_engine = os.getenv('DATABASE_ENGINE', 'sqlite')  # Default to SQLite
    database_url = os.getenv('DATABASE_URL')  # Full database URL if provided
    
    if database_url:  # Use full URL if available (production)
        return dj_database_url.parse(database_url)
    elif db_engine == 'postgresql':  # Use PostgreSQL config
        return get_postgresql_config()
    else:  # Fall back to SQLite (development)
        return get_sqlite_config(base_dir)
```

## 📁 File Structure
```
backend/
├── accounts/           # User management
│   ├── models.py      # User model
│   ├── views.py       # Auth endpoints
│   ├── serializers.py # Data serialization
│   └── urls.py        # URL routing
├── recipes/           # Recipe management
│   ├── models.py      # Recipe models
│   ├── views/         # Organized views
│   ├── serializers.py # Recipe serialization
│   └── urls.py        # Recipe URLs
├── interactions/      # Social features
│   ├── models.py      # Social models
│   ├── views.py       # Social endpoints
│   └── serializers.py # Social serialization
├── tastestack/        # Main project
│   ├── settings.py    # Configuration
│   ├── urls.py        # Main routing
│   └── wsgi.py        # WSGI config
├── media/             # User uploads
├── requirements.txt   # Dependencies
└── manage.py          # Django management
```

## 🚀 Development Commands

### Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Database
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### Development
```bash
python manage.py runserver
python manage.py shell
python manage.py test
```

### Production
```bash
pip install -r requirements-prod.txt
python manage.py collectstatic
gunicorn tastestack.wsgi:application
```

## 🔍 Advanced Features

### Search & Filtering
- Full-text search across multiple fields
- Category filtering (18 categories)
- Difficulty level filtering
- Time-based filtering
- Rating-based filtering
- Pagination with configurable page size

### Performance Optimizations
- `select_related()` for foreign keys
- Efficient queryset filtering
- JSON fields for flexible data
- Database connection pooling

### File Upload System
- Profile pictures: `media/profile_pictures/`
- Recipe images: `media/recipe_images/`
- Image validation with Pillow
- Absolute URL generation

## 🧪 Testing

### Run Tests
```bash
python manage.py test
python manage.py test accounts
python manage.py test recipes
python manage.py test interactions
```

### Test Coverage
```bash
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

## 📚 API Documentation

### Authentication Flow
1. User registers → JWT tokens issued
2. Login with email/password → New tokens
3. Include token in Authorization header
4. Token validates → User object available

### Response Formats
```json
// Recipe List
{
  "results": [...],
  "count": 25,
  "total_pages": 3,
  "next": "url",
  "previous": "url"
}

// Recipe Detail
{
  "id": 1,
  "title": "Recipe Title",
  "author": {...},
  "average_rating": 4.5,
  "likes_count": 12,
  "is_liked": true,
  "user_rating": 5
}
```

## 🔧 Troubleshooting

### Common Issues
- **CORS errors**: Check CORS_ALLOWED_ORIGINS
- **Database errors**: Verify DATABASE_URL
- **Media files**: Check MEDIA_ROOT and MEDIA_URL
- **Authentication**: Verify JWT token format

### Debug Mode
```python
# Enable debug toolbar
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
```

This backend provides a robust, scalable foundation for the TasteStack recipe sharing platform.