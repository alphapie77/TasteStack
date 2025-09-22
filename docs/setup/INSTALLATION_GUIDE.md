# 🛠️ TasteStack Installation Guide

## 📋 Prerequisites

### Required Software
- **Python 3.9+** - [Download here](https://www.python.org/downloads/)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)

### Optional (Recommended)
- **Docker Desktop** - [Download here](https://docker.com/)
- **VS Code** - [Download here](https://code.visualstudio.com/)

## 🚀 Installation Methods

### Method 1: Docker (Recommended)

#### SQLite Setup (Simple)
```bash
git clone https://github.com/alphapie77/TasteStack.git
cd TasteStack
docker\run-sqlite.bat
```

#### PostgreSQL Setup (Production)
```bash
git clone https://github.com/alphapie77/TasteStack.git
cd TasteStack
docker\run-postgres.bat
```

### Method 2: Automated Setup
```bash
git clone https://github.com/alphapie77/TasteStack.git
cd TasteStack
scripts\setup.bat
scripts\start-dev.bat
```

### Method 3: Manual Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Optional
python manage.py runserver
```

#### Frontend Setup
```bash
cd app
npm install
# Create .env file:
echo REACT_APP_API_URL=http://localhost:8000/api > .env
echo REACT_APP_MEDIA_URL=http://localhost:8000 >> .env
npm start
```

## 🌐 Access URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## 🔧 Environment Configuration

### Backend (.env)
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_ENGINE=sqlite
CORS_ALLOW_ALL_ORIGINS=True
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_MEDIA_URL=http://localhost:8000
```

## 🧪 Verify Installation

### Test Backend
```bash
curl http://localhost:8000/api/recipes/
```

### Test Frontend
Open http://localhost:3000 in browser

## 🔧 Troubleshooting

### Common Issues

#### Python/pip not found
```bash
# Windows
py --version
py -m pip --version

# macOS/Linux
python3 --version
pip3 --version
```

#### Node.js/npm not found
```bash
node --version
npm --version
```

#### Port already in use
```bash
# Kill process on port 8000
netstat -ano | findstr :8000  # Windows
lsof -ti:8000 | xargs kill -9  # macOS/Linux

# Kill process on port 3000
netstat -ano | findstr :3000  # Windows
lsof -ti:3000 | xargs kill -9  # macOS/Linux
```

#### Virtual environment issues
```bash
# Remove and recreate
rm -rf venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

#### Database issues
```bash
# Reset database
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

## 📚 Next Steps

1. Read [User Manual](../user/USER_MANUAL.md)
2. Check [Development Workflow](../development/DEVELOPMENT_WORKFLOW.md)
3. Review [API Documentation](../api/API_REFERENCE.md)

## 🆘 Need Help?

- 🐛 **Issues**: [GitHub Issues](https://github.com/alphapie77/TasteStack/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/alphapie77/TasteStack/discussions)
- 📧 **Email**: support@tastestack.com