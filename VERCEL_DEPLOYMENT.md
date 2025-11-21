# Quick Vercel Deployment Guide

## 🚀 Deploy Frontend to Vercel (Step-by-Step)

### Prerequisites
- GitHub repository: https://github.com/adityabhardwajj/Ideaverse
- Vercel account (sign up at [vercel.com](https://vercel.com))

### Step 1: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import" next to your GitHub repository
3. Or click "Import Git Repository" and select `adityabhardwajj/Ideaverse`

### Step 2: Configure Project Settings

**Important Settings:**

- **Framework Preset**: Select `Vite`
- **Root Directory**: Click "Edit" and set to `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### Step 3: Environment Variables

Add these environment variables in Vercel dashboard:

**For Production (after backend is deployed):**
```
VITE_API_URL=https://your-backend-url.railway.app
```

**For Testing:**
```
VITE_API_URL=http://localhost:5000
```

**Note**: Replace `your-backend-url.railway.app` with your actual backend URL once deployed.

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Your app will be live at: `https://your-project-name.vercel.app`

---

## ⚠️ Important Notes

### Backend Must Be Deployed Separately

Your Express.js backend **cannot** run on Vercel because:
- Socket.io requires persistent WebSocket connections
- Vercel uses serverless functions (cold starts, no persistent connections)
- MySQL database connections need persistent server

### Recommended: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Set **Root Directory**: `backend`
4. Add MySQL database service
5. Configure environment variables
6. Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete backend deployment guide.

---

## 🔧 Vercel Configuration

The `vercel.json` file in the root directory configures:
- Build settings
- Security headers
- SPA routing (all routes → index.html)

---

## 🌐 Update Frontend After Backend Deployment

Once your backend is deployed:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `VITE_API_URL` to your backend URL
3. Redeploy (Vercel will auto-redeploy or click "Redeploy")

---

## ✅ Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed (Railway/Render/etc.)
- [ ] `VITE_API_URL` environment variable set in Vercel
- [ ] Backend CORS configured for Vercel URL
- [ ] Test authentication flow
- [ ] Test Socket.io chat (if working)

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure root directory is set to `frontend`
- Verify all dependencies are in `frontend/package.json`

### API Calls Fail (404/CORS)
- Verify `VITE_API_URL` is set correctly
- Check backend CORS settings include Vercel URL
- Ensure backend is running and accessible

### Socket.io Not Working
- Socket.io requires backend on Railway/Render (not Vercel serverless)
- Verify `VITE_API_URL` points to backend with Socket.io support

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Full Deployment Guide](./DEPLOYMENT.md)

