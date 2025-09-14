# 🍽️ TasteStack - Recipe Sharing Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-5.2.1-green.svg)](https://www.djangoproject.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Frontend Status](https://img.shields.io/badge/Frontend-Live-brightgreen.svg)](https://taste-stack.vercel.app/)
[![Backend Status](https://img.shields.io/badge/Backend-Live-brightgreen.svg)](https://shksabbir7.pythonanywhere.com/)
[![API Status](https://img.shields.io/badge/API-Working-success.svg)](https://shksabbir7.pythonanywhere.com/api/recipes/)

TasteStack is a modern recipe sharing platform that allows users to discover, share, and interact with recipes from around the world. Built with Django REST Framework backend and React frontend, it provides a seamless experience for food enthusiasts.

## 🌐 Live Demo

- **Frontend:** [https://taste-stack.vercel.app/](https://taste-stack.vercel.app/)
- **Backend API:** [https://shksabbir7.pythonanywhere.com/](https://shksabbir7.pythonanywhere.com/)
- **Admin Panel:** [https://shksabbir7.pythonanywhere.com/admin/](https://shksabbir7.pythonanywhere.com/admin/)
- **API Documentation:** [View API Endpoints](#-api-endpoints)

## 📸 Screenshots

### Homepage
![Homepage](screenshots/homepage.png)
*Modern landing page with featured recipes and statistics*

### Recipe Discovery
![Recipe Browse](screenshots/recipes.png)
*Browse and search through recipes with advanced filters*

### Recipe Details
<img src="screenshots/recipe-details.png" alt="Recipe Details" width="800">
*Detailed recipe view with ratings, comments, and ingredients*

### User Dashboard
![Dashboard](screenshots/dashboard.png)
*Personal dashboard with statistics and recipe management*

### Mobile Responsive
<img src="screenshots/mobile.gif" alt="Mobile View" width="400">
*Fully responsive design works perfectly on all devices*

## ✨ Features

- 🔍 **Recipe Discovery**: Browse and search through a vast collection of recipes
- 👨‍🍳 **Recipe Management**: Create, edit, and share your own recipes
- ⭐ **Rating System**: Rate recipes from 1-5 stars
- 💬 **Comments & Social**: Comment on recipes and interact with other users
- ❤️ **Favorites**: Like and save your favorite recipes
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🌙 **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing
- 🖼️ **Image Upload**: Add beautiful photos to your recipes
- 🔐 **User Authentication**: Secure registration, login, and password reset
- 👤 **User Profiles**: Personalized profiles with bio and profile pictures
- 🔄 **Follow System**: Follow other users and see their activities
- 📊 **Dashboard**: Personal dashboard with statistics and recent activity

## 🚀 Quick Start

### ⚡ Super Quick (Docker)
```bash
# Clone repository
git clone https://github.com/alphapie77/TasteStack.git
cd TasteStack

# Start with SQLite (simple)
docker\run-sqlite.bat

# OR start with PostgreSQL (production)
docker\run-postgres.bat
```

### 🛠️ Manual Setup

#### Prerequisites
- **Python 3.9+** - [Download here](https://www.python.org/downloads/)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Docker** (optional) - [Download here](https://docker.com/)

#### Clone Repository
```bash
git clone https://github.com/alphapie77/TasteStack.git
cd TasteStack
```

#### Automated Setup
```bash
# Run setup script (installs everything)
scripts\setup.bat

# Start development servers
scripts\start-dev.bat
```

#### Manual Backend Setup (Django)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # optional
python manage.py runserver
```

#### Manual Frontend Setup (React)
```bash
cd app
npm install
# Create .env file with:
# REACT_APP_API_URL=http://localhost:8000/api
# REACT_APP_MEDIA_URL=http://localhost:8000
npm start
```

## 🐳 Docker Options

### SQLite (Simple & Fast)
```bash
docker\run-sqlite.bat     # Start
docker\stop-sqlite.bat    # Stop
```

### PostgreSQL (Production Ready)
```bash
docker\run-postgres.bat   # Start
docker\stop-postgres.bat  # Stop
```

**Access URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## 🚀 Production Deployment

### Frontend (Vercel) ✅ LIVE
- **URL:** https://taste-stack.vercel.app/
- **Status:** Production Ready
- **Integration:** Connected to PythonAnywhere backend
- **Features:** Full recipe sharing platform with authentication

### Backend (PythonAnywhere) ✅ LIVE
- **URL:** https://shksabbir7.pythonanywhere.com/
- **Status:** Production Ready
- **Database:** SQLite (5 sample recipes loaded)
- **Authentication:** JWT tokens working
- **CORS:** Configured for frontend integration

## 🖥️ Usage

1. **Access the application:** Open your web browser and go to [https://taste-stack.vercel.app/](https://taste-stack.vercel.app/) or `http://localhost:3000` for local development
2. **Create an account:** Click "Register" to create a new user account
3. **Browse recipes:** Explore recipes on the home page
4. **Create recipes:** Click "Add Recipe" to share your own recipes
5. **Interact:** Rate, comment, and like recipes from other users

### User Registration & Authentication
1. Visit https://taste-stack.vercel.app/ (or http://localhost:3000 for local development)
2. Click "Get Started" or "Register"
3. Fill in registration form with required details
4. Login with your credentials
5. Access your personalized dashboard

### Core Features

#### Recipe Management
- **Create Recipe**: Click "Share Recipe" from dashboard
- **Edit Recipe**: Access via "My Recipes" in dashboard
- **Delete Recipe**: Use options menu in recipe details

#### Social Interactions
- **Rate Recipes**: Use star rating system on recipe pages
- **Comment**: Add comments on individual recipe pages
- **Like/Unlike**: Heart icon on recipe cards

#### Discovery
- **Browse Recipes**: Use "Explore Recipes" from homepage
- **Search**: Use search bar to find specific recipes
- **Filter**: Apply filters by cuisine, difficulty, time, etc.

### Sample User Credentials (for testing)
If you created a superuser during setup:
- **Username**: [your-superuser-username]
- **Password**: [your-superuser-password]

For regular testing, create a new account through the registration form.

## 🗂️ Project Structure

```
TasteStack/
├── 📁 backend/              # Django REST API
│   ├── accounts/           # User authentication & profiles
│   ├── recipes/            # Recipe management
│   ├── interactions/       # Social features (likes, comments)
│   ├── media/              # User uploaded files
│   └── requirements.txt    # Python dependencies
├── 📁 app/                  # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API communication
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   └── utils/          # Utility functions
│   └── package.json        # Node.js dependencies
├── 📁 docker/               # Docker configurations
│   ├── run-sqlite.bat      # Start with SQLite
│   ├── run-postgres.bat    # Start with PostgreSQL
│   └── DOCKER_GUIDE.md     # Docker usage guide
├── 📁 scripts/              # Automation scripts
│   ├── setup.bat           # Project setup
│   └── start-dev.bat       # Start dev servers
├── 📁 docs/                 # Documentation
├── 📁 tests/                # Test files
└── README.md               # This file
```

📚 **See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed structure**  
📋 **See [DEPLOYMENT_STATUS.md](docs/DEPLOYMENT_STATUS.md) for deployment information**

## 🔧 Development Commands

### Backend
```bash
# Run server
python manage.py runserver

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test
```

### Frontend
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject (not recommended)
npm run eject
```

## 📊 API Endpoints

**Base URL:** `https://shksabbir7.pythonanywhere.com`

### API Authentication Format
```json
// Registration
{
  "username": "your_username",
  "email": "your@email.com",
  "password": "your_password",
  "password_confirm": "your_password"
}

// Login (uses email, not username)
{
  "email": "your@email.com",
  "password": "your_password"
}
```

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/forgot-password/` - Request password reset
- `POST /api/auth/reset-password/` - Reset password with token
- `GET /api/auth/user/` - Get current user profile
- `PUT /api/auth/user/update/` - Update user profile

### Recipes
- `GET /api/recipes/` - List recipes with pagination
- `POST /api/recipes/` - Create new recipe
- `GET /api/recipes/{id}/` - Get recipe details
- `PUT/PATCH /api/recipes/{id}/` - Update recipe
- `DELETE /api/recipes/{id}/` - Delete recipe

### Social Features
- `POST /api/recipes/{id}/rate/` - Rate recipe (1-5 stars)
- `POST /api/recipes/{id}/comment/` - Add comment
- `GET /api/recipes/{id}/comments/` - Get recipe comments
- `POST /api/recipes/{id}/like/` - Like/unlike recipe

### User Management
- `GET /api/auth/profile/{id}/` - Get public user profile
- `POST /api/auth/follow/{id}/` - Follow/unfollow user
- `GET /api/auth/dashboard-stats/` - Get dashboard statistics
- `GET /api/auth/recent-activity/` - Get recent user activity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🧪 API Testing

Test the live API endpoints:

```bash
# Test API status
curl https://shksabbir7.pythonanywhere.com/

# Get recipes
curl https://shksabbir7.pythonanywhere.com/api/recipes/

# Register new user
curl -X POST https://shksabbir7.pythonanywhere.com/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123","password_confirm":"testpass123"}'

# Login
curl -X POST https://shksabbir7.pythonanywhere.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

## 🔥 Advanced Usage

### Development Dependencies

For enhanced development experience:

```bash
# Backend development tools
cd backend
pip install -r requirements-dev.txt

# This includes:
# - django-debug-toolbar (debugging)
# - pytest (testing)
# - black (code formatting)
# - flake8 (linting)
# - mypy (type checking)
```

### Production Deployment

For production deployment:

```bash
# Install production dependencies
pip install -r requirements-prod.txt

# This includes:
# - gunicorn (production server)
# - psycopg2 (PostgreSQL)
# - redis (caching)
# - sentry-sdk (error tracking)
```

### Available Scripts

#### Backend Scripts
```bash
# Code formatting and linting
black .
isort .
flake8

# Testing
pytest
python manage.py test

# Database management
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

#### Frontend Scripts
```bash
# Development
npm start                    # Start development server
npm run build               # Build for production
npm test                    # Run tests
npm run test:coverage       # Run tests with coverage

# Code quality
npm run lint                # Lint code
npm run lint:fix            # Fix linting issues
npm run format              # Format code with prettier
npm run type-check          # TypeScript type checking

# Analysis
npm run build:analyze       # Analyze bundle size
npm run deps:update         # Update dependencies
npm run deps:audit          # Security audit
```

## 🆘 Troubleshooting Guide

### Installation Issues

#### Python/pip Issues
```bash
# Python not found
# Solution: Ensure Python 3.9+ is installed and in PATH
python --version

# pip not found
# Solution: Reinstall Python with pip included
python -m ensurepip --upgrade

# Virtual environment issues
# Solution: Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

#### Node.js/npm Issues
```bash
# Node.js version too old
# Solution: Update to Node.js 18.0+
node --version

# npm permission errors (macOS/Linux)
sudo chown -R $(whoami) ~/.npm

# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Runtime Issues

#### Backend Issues
```bash
# Port 8000 already in use
# Solution: Kill process or use different port
lsof -ti:8000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8000   # Windows

# Database migration issues
python manage.py makemigrations --empty appname
python manage.py migrate --fake

# CORS errors
# Check CORS_ALLOWED_ORIGINS in settings.py
# Ensure frontend URL is included
```

#### Frontend Issues
```bash
# Port 3000 already in use
# Set custom port
PORT=3001 npm start

# Build failures
# Clear React cache
npm start -- --reset-cache

# Module resolution errors
rm -rf node_modules package-lock.json
npm install
```

### Common Error Messages

#### "ModuleNotFoundError: No module named 'X'"
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate
pip install -r requirements.txt
```

#### "CORS policy error"
```python
# In backend/settings.py, ensure:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

#### "Command not found: python"
```bash
# Try python3 instead
python3 --version

# Or create an alias
alias python=python3
```

### Performance Issues

#### Slow Database Queries
```python
# Enable Django Debug Toolbar
# Add to requirements-dev.txt: django-debug-toolbar

# In settings.py (development only):
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
```

#### Large Bundle Size
```bash
# Analyze bundle
npm run build:analyze

# Consider code splitting and lazy loading
# Use React.lazy() for components
```

### Environment-Specific Issues

#### Windows-Specific
```powershell
# PowerShell execution policy issues
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Python path issues
py -0p  # List Python installations
py -3.9 -m venv venv  # Use specific Python version
```

#### macOS-Specific
```bash
# Homebrew Python issues
brew install python@3.9
brew link python@3.9

# XCode command line tools
xcode-select --install
```

#### Linux-Specific
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.9 python3.9-venv python3-pip nodejs npm

# CentOS/RHEL
sudo yum install python39 python39-pip nodejs npm
```

### Getting Help

#### Debug Information to Include
When reporting issues, please include:

```bash
# System information
python --version
node --version
npm --version
echo $OS  # or echo %OS% on Windows

# Error logs
# Backend: Django server console output
# Frontend: Browser console (F12)

# Configuration
# Contents of .env files (without sensitive data)
# Package versions from requirements.txt and package.json
```

#### Support Channels
- 📧 Email: support@tastestack.com
- 🐛 Issues: [GitHub Issues](https://github.com/alphapie77/TasteStack-A-Recipe-Sharing-Platform/issues)
- 📚 Documentation: [Full Documentation](docs/README.md)
- 💬 Community: [Discussions](https://github.com/alphapie77/TasteStack-A-Recipe-Sharing-Platform/discussions)

## 🚀 Deployment

### Development Deployment
```bash
# Backend (Terminal 1)
cd backend
source venv/bin/activate
python manage.py runserver

# Frontend (Terminal 2)  
cd app
npm start
```

### Production Deployment

#### Using Docker (Recommended)
```bash
# SQLite (simple)
docker\run-sqlite.bat

# PostgreSQL (production)
docker\run-postgres.bat

# Or manually
docker-compose -f docker\docker-compose.postgres.yml up --build
```

#### Manual Production Setup
```bash
# Backend production server
cd backend
pip install gunicorn
gunicorn tastestack.wsgi:application --bind 0.0.0.0:8000

# Frontend production build
cd frontend
npm run build
npx serve -s build -l 3000
```

#### Environment Variables (Production)
```env
# backend/.env
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:pass@localhost/dbname
REDIS_URL=redis://localhost:6379
```

## 📊 Project Status

- ✅ User Authentication System (Registration, Login, Password Reset)
- ✅ Recipe CRUD Operations
- ✅ Rating & Comment System
- ✅ Responsive UI Design with Modern Gradients
- ✅ Advanced Search & Filter Functionality
- ✅ User Dashboard with Statistics
- ✅ Follow System & Social Features
- ✅ Profile Management with Image Upload
- ✅ Professional About Page
- ✅ Modern Logo and Navigation
- ✅ Dark/Light Mode Theme Toggle
- ✅ Docker Containerization (SQLite/PostgreSQL)
- ✅ Professional Project Structure
- ✅ Automated Setup Scripts

---

**TasteStack** - *Bringing food lovers together, one recipe at a time* 🍽️✨
