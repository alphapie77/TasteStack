# 🔧 TasteStack Backend Guide

## 🏗️ Architecture Overview

TasteStack backend is built with Django REST Framework, providing a robust API for the recipe sharing platform.

### Technology Stack
- **Framework**: Django 5.2.1 + Django REST Framework 3.16.1
- **Authentication**: JWT tokens (SimpleJWT)
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Image Processing**: Pillow
- **CORS**: django-cors-headers

## 📊 Database Models

### User Management (accounts app)
```python
# Custom User Model
class User(AbstractUser):
    email = EmailField(unique=True)  # Login field
    username = CharField(flexible validation)
    bio = TextField(500 chars)
    location = CharField(200 chars)
    website = URLField
    profile_picture = ImageField
```

### Recipe System (recipes app)
```python
class Recipe(Model):
    title = CharField(200)
    description = TextField
    ingredients = JSONField  # Array format
    instructions = JSONField  # Array format
    prep_time = PositiveIntegerField  # Minutes
    cook_time = PositiveIntegerField  # Minutes
    servings = PositiveIntegerField
    difficulty = CharField  # Easy/Medium/Hard
    category = CharField  # 18 predefined categories
    image = ImageField
    author = ForeignKey(User)
```

### Social Features (interactions app)
```python
class Rating(Model):
    user = ForeignKey(User)
    recipe = ForeignKey(Recipe)
    rating = PositiveIntegerField  # 1-5 stars
    # unique_together: (user, recipe)

class Like(Model):
    user = ForeignKey(User)
    recipe = ForeignKey(Recipe)
    # unique_together: (user, recipe)

class Comment(Model):
    user = ForeignKey(User)
    recipe = ForeignKey(Recipe)
    content = TextField
    hidden = BooleanField  # Moderation

class Follow(Model):
    follower = ForeignKey(User)
    following = ForeignKey(User)
    # unique_together: (follower, following)
```

## 🔗 API Endpoints

### Authentication (`/api/auth/`)
```
POST /register/           - User registration
POST /login/              - Email-based login
GET  /user/               - Current user profile
PUT  /user/update/        - Update profile
GET  /dashboard-stats/    - User statistics
GET  /recent-activity/    - Recent activities
GET  /profile/<id>/       - Public profile
POST /follow/<id>/        - Follow/unfollow
POST /forgot-password/    - Password reset
POST /reset-password/     - Reset with token
```

### Recipes (`/api/recipes/`)
```
GET    /                  - List recipes (paginated)
POST   /                  - Create recipe
GET    /<id>/             - Recipe details
PUT    /<id>/             - Update recipe
DELETE /<id>/             - Delete recipe
POST   /<id>/rate/        - Rate recipe
GET    /search/           - Search recipes
GET    /my-recipes/       - User's recipes
GET    /statistics/       - Platform stats
```

### Interactions (`/api/interactions/`)
```
POST /recipes/<id>/like/              - Like recipe
POST /recipes/<id>/unlike/            - Unlike recipe
GET  /recipes/<id>/comments/          - Get comments
POST /recipes/<id>/comments/add/      - Add comment
PUT  /recipes/<id>/comments/<id>/edit/ - Edit comment
DELETE /recipes/<id>/comments/<id>/delete/ - Delete comment
POST /recipes/<id>/comments/<id>/hide/ - Hide comment
GET  /comments/my-recipes/            - Comments on user's recipes
```

## 🔐 Security Features

### Authentication
- JWT token-based authentication
- Access token: 60 minutes lifetime
- Refresh token: 7 days lifetime
- Email-based login (not username)

### Authorization
- Permission classes: IsAuthenticated, AllowAny
- Owner-only access for recipe CRUD
- Comment moderation by recipe owners

### Data Protection
- XSS prevention with HTML escaping
- Path traversal protection
- Strong password validation
- CORS configuration for frontend

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
# Dynamic database switching
def get_database_config(base_dir):
    db_engine = os.getenv('DATABASE_ENGINE', 'sqlite')
    database_url = os.getenv('DATABASE_URL')
    
    if database_url:
        return dj_database_url.parse(database_url)
    elif db_engine == 'postgresql':
        return get_postgresql_config()
    else:
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