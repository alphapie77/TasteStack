# 🚀 TasteStack Quick Start

## ⚡ 1-Minute Setup

### Option 1: Docker (Recommended)
```bash
# SQLite (Simple)
docker\run-sqlite.bat

# PostgreSQL (Production)
docker\run-postgres.bat
```

### Option 2: Manual Setup
```bash
# Run setup script
scripts\setup.bat

# Start development servers
scripts\start-dev.bat
```

## 🌐 Access URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000

## 🎯 First Steps
1. **Register** a new account
2. **Create** your first recipe
3. **Browse** other recipes
4. **Rate & Comment** on recipes

## 📁 Project Structure
```
TasteStack/
├── backend/     # Django API
├── app/         # React App
├── docker/      # Docker configs
├── scripts/     # Automation
├── docs/        # Documentation
└── tests/       # Test files
```

## 🛠️ Development Commands
```bash
# Setup project
scripts\setup.bat

# Start dev servers
scripts\start-dev.bat

# Docker with SQLite
docker\run-sqlite.bat

# Docker with PostgreSQL
docker\run-postgres.bat
```

## 📚 More Info
- [Full README](../../README.md)
- [Docker Guide](../../docker/DOCKER_GUIDE.md)
- [Project Structure](../architecture/PROJECT_STRUCTURE.md)