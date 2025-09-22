# 🎨 Frontend Deployment Guide

## 🌐 Live Deployment Status

### Current Production Setup
- **Frontend URL**: [https://taste-stack.vercel.app/](https://taste-stack.vercel.app/)
- **Backend API**: [https://shksabbir7.pythonanywhere.com/](https://shksabbir7.pythonanywhere.com/)
- **Status**: ✅ **LIVE AND WORKING**
- **Last Updated**: December 2024

## 🚀 Vercel Deployment (Current)

### Step 1: Prepare Frontend
```bash
cd app
npm install
npm run build  # Test build locally
```

### Step 2: Environment Variables
Create `.env.production`:
```env
REACT_APP_API_URL=https://shksabbir7.pythonanywhere.com/api
REACT_APP_MEDIA_URL=https://shksabbir7.pythonanywhere.com
GENERATE_SOURCEMAP=false
```

### Step 3: Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Step 4: Configure Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add production environment variables
5. Redeploy if needed

## 🔧 Alternative Deployment Options

### Netlify Deployment
```bash
# Build the project
npm run build

# Deploy to Netlify
# Option 1: Drag and drop build folder to netlify.com
# Option 2: Connect GitHub repository
```

**Netlify Configuration:**
- Build command: `npm run build`
- Publish directory: `build`
- Node version: `18.x`

### GitHub Pages Deployment
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

# Deploy
npm run deploy
```

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy
```

## 🔗 Backend Integration

### CORS Configuration
Ensure backend allows your frontend domain:
```python
# In backend settings.py
CORS_ALLOWED_ORIGINS = [
    'https://taste-stack.vercel.app',
    'https://your-custom-domain.com',
    'http://localhost:3000',  # Keep for development
]
```

### API Endpoints
Frontend connects to these backend endpoints:
```
Authentication: /api/auth/
Recipes: /api/recipes/
Interactions: /api/interactions/
Media Files: /media/
```

## 📱 Progressive Web App (PWA)

### Current PWA Features
- ✅ Responsive design
- ✅ Manifest file configured
- ✅ Service worker ready
- ✅ Offline-first approach
- ✅ Install prompts

### Enable PWA Features
1. Update `public/manifest.json`
2. Configure service worker in `src/index.js`
3. Add install button component
4. Test offline functionality

## 🔒 Production Optimizations

### Performance
```json
// package.json build optimizations
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "build:analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js"
  }
}
```

### Security Headers
```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 🧪 Testing Deployment

### Pre-deployment Checklist
- [ ] Build completes without errors
- [ ] All environment variables set
- [ ] API endpoints accessible
- [ ] Images and media loading
- [ ] Authentication working
- [ ] Mobile responsiveness
- [ ] PWA features functional

### Post-deployment Testing
```bash
# Test API connectivity
curl https://your-frontend-url.com/api/recipes/

# Test authentication
# Register new user through frontend
# Login and create recipe
# Verify all features work
```

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### API Connection Issues
- Verify `REACT_APP_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is accessible

#### Environment Variables Not Loading
- Restart development server
- Check variable names start with `REACT_APP_`
- Verify variables are set in deployment platform

#### Static Files Not Loading
- Check build output in `build/` folder
- Verify deployment platform serves static files
- Check for path issues in production

## 📊 Monitoring & Analytics

### Performance Monitoring
```javascript
// Add to src/index.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Error Tracking
```javascript
// Add error boundary and logging
window.addEventListener('error', (event) => {
  console.error('Frontend Error:', event.error);
});
```

## 🚀 Continuous Deployment

### GitHub Actions (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🎉 Success!

Your TasteStack frontend is now deployed and accessible to users worldwide!

**Live URLs:**
- **Production**: https://taste-stack.vercel.app/
- **API**: https://shksabbir7.pythonanywhere.com/api/
- **Status**: Fully functional recipe sharing platform