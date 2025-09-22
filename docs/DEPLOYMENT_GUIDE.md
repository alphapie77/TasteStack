# 🚀 TasteStack Deployment Guide
## Backend: PythonAnywhere | Frontend: Vercel

## 📋 Backend Deployment (PythonAnywhere)

### Step 1: Create PythonAnywhere Account
1. Go to [pythonanywhere.com](https://www.pythonanywhere.com)
2. Sign up for a free account
3. Go to your dashboard

### Step 2: Upload Code
1. Open a **Bash console** in PythonAnywhere
2. Clone your repository:
```bash
git clone https://github.com/alphapie77/TasteStack-A-Recipe-Sharing-Platform.git
cd TasteStack-A-Recipe-Sharing-Platform/backend
```

### Step 3: Install Dependencies
```bash
pip3.10 install --user -r requirements.txt
```

### Step 4: Configure Web App
1. Go to **Web** tab in PythonAnywhere dashboard
2. Click **Add a new web app**
3. Choose **Manual configuration**
4. Select **Python 3.10**
5. Set these configurations:

**Source code:** `/home/yourusername/TasteStack-A-Recipe-Sharing-Platform/backend`

**WSGI configuration file:** Edit and replace content with:
```python
import os
import sys

# Add your project directory to the sys.path
path = '/home/yourusername/TasteStack-A-Recipe-Sharing-Platform/backend'
if path not in sys.path:
    sys.path.insert(0, path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'tastestack.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

### Step 5: Static Files
1. In **Web** tab, set **Static files**:
   - URL: `/static/`
   - Directory: `/home/yourusername/TasteStack-A-Recipe-Sharing-Platform/backend/staticfiles/`

2. In **Bash console**, collect static files:
```bash
cd /home/yourusername/TasteStack-A-Recipe-Sharing-Platform/backend
python manage.py collectstatic --noinput
```

### Step 6: Database Setup
```bash
python manage.py migrate
python manage.py createsuperuser  # Optional
```

### Step 7: Reload Web App
1. Go to **Web** tab
2. Click **Reload** button
3. Your backend will be available at: `https://yourusername.pythonanywhere.com`

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Prepare Frontend
1. Navigate to frontend directory:
```bash
cd frontend
```

2. Update environment variables in `.env.production`:
```
REACT_APP_API_URL=https://yourusername.pythonanywhere.com/api
REACT_APP_MEDIA_URL=https://yourusername.pythonanywhere.com
GENERATE_SOURCEMAP=false
```

### Step 3: Deploy to Vercel
```bash
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → tastestack-frontend
- **Directory?** → ./
- **Override settings?** → No

### Step 4: Set Environment Variables
1. Go to [vercel.com](https://vercel.com) dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `REACT_APP_API_URL` = `https://yourusername.pythonanywhere.com/api`
   - `REACT_APP_MEDIA_URL` = `https://yourusername.pythonanywhere.com`
   - `GENERATE_SOURCEMAP` = `false`

### Step 5: Redeploy
```bash
vercel --prod
```

Your frontend will be available at: `https://your-project.vercel.app`

---

## 🔗 Connect Frontend to Backend

### Update Backend CORS Settings
1. In PythonAnywhere **Bash console**:
```bash
cd /home/yourusername/TasteStack-A-Recipe-Sharing-Platform/backend
nano tastestack/settings.py
```

2. The settings should automatically detect PythonAnywhere and allow all origins, but you can also manually set:
```python
CORS_ALLOWED_ORIGINS = [
    'https://your-project.vercel.app',
    'http://localhost:3000',  # Keep for local development
]
```

3. Reload your web app in PythonAnywhere

---

## 🧪 Testing Your Deployment

### Test Backend:
- Visit: `https://yourusername.pythonanywhere.com/api/recipes/`
- Should return JSON response

### Test Frontend:
- Visit: `https://your-project.vercel.app`
- Should load the TasteStack application
- Try registering a new user
- Try creating a recipe

---

## 🔧 Troubleshooting

### Backend Issues:
1. **500 Error**: Check error logs in PythonAnywhere **Error log**
2. **Static files not loading**: Run `python manage.py collectstatic`
3. **Database issues**: Run `python manage.py migrate`

### Frontend Issues:
1. **API not connecting**: Check environment variables in Vercel
2. **CORS errors**: Verify backend CORS settings
3. **Build failures**: Check build logs in Vercel dashboard

### Common Fixes:
```bash
# Backend (PythonAnywhere console)
cd /home/yourusername/TasteStack-A-Recipe-Sharing-Platform/backend
python manage.py migrate
python manage.py collectstatic --noinput

# Frontend (Local)
cd frontend
vercel --prod
```

---

## 🎉 Success!

Your TasteStack application is now live:
- **Backend**: `https://yourusername.pythonanywhere.com`
- **Frontend**: `https://your-project.vercel.app`

Both services are connected and ready for users! 🚀