# 🏗️ TasteStack Project Structure

```
TasteStack/
├── 📁 backend/                    # Django REST API
│   ├── 📁 accounts/               # User authentication & profiles
│   │   ├── 📁 management/         # Custom Django commands
│   │   ├── 📁 migrations/         # Database migrations
│   │   ├── admin.py               # Admin interface config
│   │   ├── models.py              # User & Profile models
│   │   ├── serializers.py         # API serializers
│   │   ├── urls.py                # URL routing
│   │   └── views.py               # API endpoints
│   ├── 📁 recipes/                # Recipe management
│   │   ├── 📁 migrations/         # Database migrations
│   │   ├── 📁 views/              # Organized view files
│   │   ├── models.py              # Recipe models
│   │   ├── serializers.py         # Recipe serializers
│   │   ├── urls.py                # Recipe URLs
│   │   └── views.py               # Recipe endpoints
│   ├── 📁 interactions/           # Social features
│   │   ├── 📁 migrations/         # Database migrations
│   │   ├── models.py              # Like, Comment, Follow models
│   │   ├── serializers.py         # Social serializers
│   │   ├── urls.py                # Social URLs
│   │   └── views.py               # Social endpoints
│   ├── 📁 tastestack/             # Main Django project
│   │   ├── settings.py            # Django configuration
│   │   ├── urls.py                # Main URL routing
│   │   ├── wsgi.py                # WSGI config
│   │   └── asgi.py                # ASGI config
│   ├── 📁 media/                  # User uploaded files
│   │   ├── 📁 profile_pictures/   # User avatars
│   │   └── 📁 recipe_images/      # Recipe photos
│   ├── 📁 static/                 # Static files (CSS, JS, images)
│   ├── requirements.txt           # Python dependencies
│   ├── requirements-dev.txt       # Development dependencies
│   ├── requirements-prod.txt      # Production dependencies
│   ├── Dockerfile                 # Docker configuration
│   ├── .dockerignore             # Docker ignore rules
│   ├── docker-entrypoint.sh      # Docker startup script
│   └── manage.py                  # Django management
│
├── 📁 app/                        # React application
│   ├── 📁 public/                 # Static assets
│   │   ├── index.html             # Main HTML template
│   │   ├── favicon.ico            # Site icon
│   │   └── manifest.json          # PWA manifest
│   ├── 📁 src/                    # Source code
│   │   ├── 📁 components/         # Reusable UI components
│   │   │   ├── 📁 common/         # Shared components
│   │   │   ├── 📁 forms/          # Form components
│   │   │   ├── 📁 layout/         # Layout components
│   │   │   └── 📁 ui/             # UI elements
│   │   ├── 📁 pages/              # Page components
│   │   │   ├── HomePage.js        # Landing page
│   │   │   ├── LoginPage.js       # Authentication
│   │   │   ├── RegisterPage.js    # User registration
│   │   │   ├── DashboardPage.js   # User dashboard
│   │   │   ├── ProfilePage.js     # User profile
│   │   │   ├── RecipeListPage.js  # Recipe browsing
│   │   │   ├── RecipeDetailPage.js # Recipe details
│   │   │   ├── RecipeSearchPage.js # Recipe search
│   │   │   └── AboutPage.js       # About page
│   │   ├── 📁 services/           # API communication
│   │   │   ├── api.js             # Base API client
│   │   │   ├── authService.js     # Authentication API
│   │   │   ├── recipeService.js   # Recipe API
│   │   │   ├── dashboardService.js # Dashboard API
│   │   │   └── statisticsService.js # Stats API
│   │   ├── 📁 contexts/           # React contexts
│   │   │   ├── AuthContext.js     # Authentication state
│   │   │   └── ThemeContext.js    # Theme management
│   │   ├── 📁 utils/              # Utility functions
│   │   │   ├── validation.js      # Form validation
│   │   │   ├── helpers.js         # Helper functions
│   │   │   └── i18n.js           # Internationalization
│   │   ├── 📁 hooks/              # Custom React hooks
│   │   ├── 📁 assets/             # Images, fonts, etc.
│   │   ├── App.js                 # Main App component
│   │   ├── index.js               # React entry point
│   │   └── index.css              # Global styles
│   ├── package.json               # Node.js dependencies
│   ├── package-lock.json          # Dependency lock file
│   ├── tailwind.config.js         # Tailwind CSS config
│   ├── postcss.config.js          # PostCSS config
│   ├── Dockerfile                 # Docker configuration
│   ├── .dockerignore             # Docker ignore rules
│   └── .env                       # Environment variables
│
├── 📁 docs/                       # Documentation
│   ├── README.md                  # Documentation overview
│   ├── INSTALLATION_GUIDE.md     # Setup instructions
│   ├── USER_MANUAL.md            # User guide
│   └── PROJECT_REPORT.md         # Technical report
│
├── 📁 docker/                     # Docker configurations
│   ├── docker-compose.yml        # Default (SQLite)
│   ├── docker-compose.sqlite.yml # SQLite setup
│   ├── docker-compose.postgres.yml # PostgreSQL setup
│   ├── run-sqlite.bat            # SQLite launcher
│   ├── run-postgres.bat          # PostgreSQL launcher
│   ├── stop-sqlite.bat           # SQLite stopper
│   ├── stop-postgres.bat         # PostgreSQL stopper
│   └── DOCKER_GUIDE.md           # Docker usage guide
│
├── 📁 scripts/                    # Utility scripts
│   ├── setup.bat                 # Project setup
│   ├── test.bat                  # Run tests
│   └── deploy.bat                # Deployment script
│
├── 📁 tests/                      # Test files
│   ├── 📁 backend/               # Backend tests
│   └── 📁 frontend/              # Frontend tests
│
├── .gitignore                     # Git ignore rules
├── README.md                      # Project overview
├── LICENSE                        # MIT License
└── CHANGELOG.md                   # Version history
```

## 📋 Key Directories Explained

### 🔧 **Backend Structure**
- **accounts/**: User management, authentication, profiles
- **recipes/**: Recipe CRUD operations, categories
- **interactions/**: Social features (likes, comments, follows)
- **media/**: User-uploaded files (images)
- **static/**: CSS, JS, images served by Django

### ⚛️ **App Structure**
- **components/**: Reusable UI components
- **pages/**: Full page components
- **services/**: API communication layer
- **contexts/**: Global state management
- **utils/**: Helper functions and utilities

### 🐳 **Docker Structure**
- **docker/**: All Docker-related files
- **scripts/**: Automation scripts
- **docs/**: Comprehensive documentation

### 🧪 **Testing Structure**
- **tests/**: Organized test files
- Separate backend and app test directories

## 🎯 **Benefits of This Structure**

✅ **Organized**: Clear separation of concerns
✅ **Scalable**: Easy to add new features
✅ **Maintainable**: Logical file organization
✅ **Professional**: Industry-standard structure
✅ **Docker-ready**: Containerized deployment
✅ **Well-documented**: Comprehensive guides