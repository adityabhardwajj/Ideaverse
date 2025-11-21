# IdeaVerse Deployment Guide

This guide covers deploying IdeaVerse to Vercel and other platforms.

## 📋 Overview

IdeaVerse consists of:
- **Frontend**: React + Vite application
- **Backend**: Express.js API with Socket.io (requires persistent connections)

## 🚀 Deployment Strategy

### Recommended: Separate Frontend & Backend

Since Socket.io requires persistent connections, it's best to:
- **Frontend**: Deploy to Vercel (optimized for React/Vite)
- **Backend**: Deploy to Railway, Render, or similar platform

---

## Frontend Deployment on Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect your GitHub repository:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository: `adityabhardwajj/Ideaverse`

2. **Configure Project Settings:**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables:**
   Add these in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   VITE_SOCKET_URL=https://your-backend-url.railway.app
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# For production deployment
vercel --prod
```

---

## Backend Deployment

The backend requires a platform that supports:
- Persistent connections (for Socket.io)
- MySQL database connections
- Environment variables

### Option 1: Railway (Recommended)

1. **Sign up**: Go to [railway.app](https://railway.app)

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add MySQL Service:**
   - Click "+ New"
   - Select "Database" → "MySQL"
   - Railway will provide connection string

4. **Deploy Backend:**
   - Click "+ New" → "GitHub Repo"
   - Select your repository
   - Set **Root Directory**: `backend`
   - Set **Start Command**: `npm start`

5. **Environment Variables:**
   Add in Railway dashboard:
   ```
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=your_production_secret
   DB_NAME=railway
   DB_USER=root
   DB_PASSWORD=from_railway_mysql_service
   DB_HOST=from_railway_mysql_service
   DB_PORT=3306
   DB_DIALECT=mysql
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

6. **Get Backend URL:**
   - Railway will provide a URL like: `https://your-app.railway.app`
   - Copy this URL

### Option 2: Render

1. **Sign up**: Go to [render.com](https://render.com)

2. **Create Web Service:**
   - Click "New" → "Web Service"
   - Connect GitHub repository

3. **Configure:**
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

4. **Add PostgreSQL Database:**
   - Click "New" → "PostgreSQL"
   - Update backend to use PostgreSQL OR use external MySQL service

5. **Environment Variables:**
   Add in Render dashboard (same as Railway)

### Option 3: Fly.io

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Create app:**
   ```bash
   cd backend
   fly launch
   ```

4. **Add MySQL:**
   ```bash
   fly postgres create
   ```

---

## Environment Variables Setup

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-app.railway.app` |
| `VITE_SOCKET_URL` | Socket.io server URL | `https://your-app.railway.app` |

### Backend (Railway/Render/etc.)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (usually auto-set by platform) |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Strong random secret |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_HOST` | Database host |
| `DB_PORT` | Database port (usually 3306) |
| `DB_DIALECT` | `mysql` |
| `FRONTEND_URL` | Your Vercel frontend URL |
| `CORS_ORIGINS` | Your Vercel URL (comma-separated) |

---

## Update Frontend for Production

Update `frontend/src/api/axiosClient.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// ... rest of config
```

Update Socket.io connection in chat components:

```javascript
const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
  // ... config
});
```

---

## Database Setup

1. **Create database** on your platform (Railway/Render provides this)

2. **Run migrations** (if using Sequelize migrations):
   ```bash
   cd backend
   npx sequelize-cli db:migrate
   ```

3. **Seed initial data** (optional):
   ```bash
   npm run seed
   ```

---

## Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render
- [ ] Environment variables configured
- [ ] Database created and connected
- [ ] Frontend API URL points to backend
- [ ] CORS configured for frontend URL
- [ ] Test authentication flow
- [ ] Test Socket.io chat (if working)
- [ ] Set up custom domain (optional)

---

## Troubleshooting

### CORS Errors

Ensure `FRONTEND_URL` and `CORS_ORIGINS` in backend include your Vercel URL.

### Socket.io Not Working

Socket.io requires persistent connections. If using Vercel serverless functions, it won't work. Deploy backend to Railway/Render for full functionality.

### Database Connection Errors

- Check database credentials in environment variables
- Ensure database is accessible from backend host
- Verify firewall rules allow connections

### Build Errors

- Check Node.js version matches (usually 18.x or 20.x)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

---

## Alternative: Full Stack on Vercel (Limited)

If you want to deploy everything on Vercel:

1. **Convert Express routes to Vercel serverless functions:**
   - Move routes to `api/` directory
   - Convert to serverless function format
   - **Note**: Socket.io won't work with serverless functions

2. **Use external database:**
   - PlanetScale (MySQL)
   - Neon (PostgreSQL)
   - Supabase (PostgreSQL)

3. **Limitations:**
   - No Socket.io real-time features
   - Cold starts may affect performance
   - More complex setup

---

## Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## Need Help?

Check the main [README.md](./README.md) or [SETUP.md](./SETUP.md) for local development setup.

