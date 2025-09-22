# 🚀 TasteStack Deployment Guide

## 📋 Prerequisites

- Backend hosting service (Vercel, Railway, Render, Heroku)
- Frontend hosting service (Vercel, Netlify, Surge)
- Domain names (optional)

## 🔧 Backend Deployment

### Environment Variables Required:
```
DEBUG=False
SECRET_KEY=your-secure-secret-key
ALLOWED_HOSTS=your-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-url.com
DATABASE_ENGINE=sqlite
PRODUCTION=True
```

### Vercel Deployment:
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to backend folder: `cd backend`
3. Deploy: `vercel --prod`
4. Set environment variables in Vercel dashboard

### Railway Deployment:
1. Connect GitHub repository
2. Set root directory to `backend`
3. Add environment variables
4. Deploy automatically

### Render Deployment:
1. Connect GitHub repository
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `python manage.py runserver 0.0.0.0:$PORT`
4. Add environment variables

## 🎨 Frontend Deployment

### Environment Variables Required:
```
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_MEDIA_URL=https://your-backend-url.com
GENERATE_SOURCEMAP=false
```

### Vercel Deployment:
1. Navigate to frontend folder: `cd frontend`
2. Deploy: `vercel --prod`
3. Set environment variables in Vercel dashboard

### Netlify Deployment:
1. Connect GitHub repository
2. Set build directory to `frontend`
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Add environment variables

## 🔗 Connecting Frontend to Backend

1. Deploy backend first and get the URL
2. Update frontend environment variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   REACT_APP_MEDIA_URL=https://your-backend-url.com
   ```
3. Update backend CORS settings:
   ```
   CORS_ALLOWED_ORIGINS=https://your-frontend-url.com
   ```
4. Redeploy both services

## 📊 Database Options

### SQLite (Simple):
- Set `DATABASE_ENGINE=sqlite`
- Data stored in container (temporary)
- Good for demos and testing

### PostgreSQL (Production):
- Use managed database service
- Set `DATABASE_URL` environment variable
- Persistent data storage

## 🔒 Security Checklist

- [ ] Set strong `SECRET_KEY`
- [ ] Set `DEBUG=False`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Set specific `CORS_ALLOWED_ORIGINS`
- [ ] Use HTTPS in production
- [ ] Set up proper database backups

## 🚀 Quick Deploy Commands

### Backend (Vercel):
```bash
cd backend
vercel --prod
```

### Frontend (Vercel):
```bash
cd frontend
vercel --prod
```

### Backend (Railway):
```bash
# Connect via GitHub, no commands needed
```

### Frontend (Netlify):
```bash
# Connect via GitHub, no commands needed
```

## 🔧 Troubleshooting

### CORS Issues:
- Check `CORS_ALLOWED_ORIGINS` matches frontend URL
- Ensure both HTTP and HTTPS are configured

### Database Issues:
- Verify `DATABASE_URL` or database settings
- Check database service is running

### Static Files Issues:
- Ensure `STATIC_ROOT` is configured
- Run `python manage.py collectstatic` if needed

### Environment Variables:
- Double-check all required variables are set
- Restart services after changing variables

## 📱 Mobile & PWA

The frontend is responsive and works on mobile devices. To make it a PWA:

1. Enable service worker in `public/manifest.json`
2. Configure offline caching
3. Add install prompts

Your TasteStack application is now ready for production deployment! 🎉