# Weather Dashboard - Deployment Guide

## 🎯 Option 1: Local Development (Currently Running)

Your dashboard is **already accessible** at:
```
http://localhost:5173
```

### Requirements:
- Node.js installed
- MongoDB running locally
- Both backend and frontend servers running

### Start Local Servers:
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Access at: `http://localhost:5173`

---

## 🚀 Option 2: Deploy to Netlify (Frontend Only)

### Prerequisites:
1. **GitHub Account** - To push your code
2. **Netlify Account** - To deploy (free at netlify.com)
3. **Hosted Backend** - For the API (see Option 3 below)

### Step 1: Push to GitHub

```bash
# In your project root directory
git init
git add .
git commit -m "Initial commit: Weather Dashboard"
git remote add origin https://github.com/YOUR_USERNAME/weather-dashboard.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Frontend to Netlify

1. Go to **netlify.com** → Click **"Sign up"** or **"Log in"**
2. Click **"New site from Git"**
3. Choose **GitHub** → Authorize Netlify
4. Select your **weather-dashboard** repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click **"Deploy site"**

### Step 3: Set Environment Variable in Netlify

1. In Netlify dashboard, go to **Site settings** → **Environment**
2. Click **"Edit variables"**
3. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-api-url.com` (your hosted backend)
4. Trigger a new deploy

Your frontend will now be live at a Netlify URL! 🎉

---

## 🌐 Option 3: Deploy Backend (Required for Netlify Frontend)

Netlify only hosts static sites. For your backend, use:

### Option A: Railway.app (Recommended - Easy)

1. Go to **railway.app**
2. Click **"Start a New Project"**
3. Connect your GitHub repository
4. Add **MongoDB** plugin
5. Deploy the backend folder
6. Get the API URL from Railway
7. Use that URL as `VITE_API_URL` in Netlify

### Option B: Render.com

1. Go to **render.com**
2. Create new **Web Service**
3. Connect GitHub repository
4. Set start command: `npm start`
5. Add MongoDB connection string as environment variable
6. Deploy

### Option C: Vercel

1. Go to **vercel.com**
2. Import GitHub project
3. Deploy the backend
4. Get the API URL

---

## 🛠️ Complete Production Deployment Steps

### Step 1: Prepare Backend for Cloud
Update your `backend/app.js` to support environment variables:

```javascript
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-dashboard';

mongoose.connect(MONGODB_URI, { /* ... */ });
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
```

### Step 2: Deploy Backend
- Push to GitHub (if not already)
- Deploy to Railway/Render/Vercel
- Get the live API URL (e.g., `https://weather-api.railway.app`)

### Step 3: Deploy Frontend
- Create `.env.production` in frontend folder:
```
VITE_API_URL=https://weather-api.railway.app
```
- Connect to Netlify (or Vercel)
- Set environment variable in dashboard
- Deploy

### Step 4: Test
1. Visit your Netlify URL
2. Search for a city
3. Verify data loads and saves to MongoDB

---

## 🔒 Production Checklist

- [ ] Backend deployed on Railway/Render/Vercel
- [ ] MongoDB Atlas cloud database configured
- [ ] Backend CORS allows frontend domain
- [ ] Frontend environment variable set to production API URL
- [ ] Frontend deployed to Netlify
- [ ] Test search functionality end-to-end
- [ ] Check browser console for errors
- [ ] Verify MongoDB saves search history

---

## 📝 Environment Variables

### Frontend (.env or Netlify Settings)
```
VITE_API_URL=https://your-backend-url.com
```

### Backend (Railway/Render/Vercel Settings)
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/weather-dashboard
PORT=5000
NODE_ENV=production
```

---

## 🎨 Your Dashboard URLs After Deployment

- **Frontend (Netlify)**: `https://your-site.netlify.app`
- **Backend (Railway)**: `https://your-api.railway.app`
- **MongoDB**: Cloud hosted on MongoDB Atlas

---

## 💡 Quick Summary

| Option | Frontend | Backend | Database | Cost |
|--------|----------|---------|----------|------|
| **Local** | Vite Dev Server | Node.js Local | Local MongoDB | Free |
| **Netlify** | Netlify | Railway/Render | MongoDB Atlas | Free |
| **Enterprise** | Vercel | Vercel | MongoDB Atlas | Paid |

---

## 🆘 Troubleshooting

**Q: "Failed to fetch weather data" error?**
- A: Check if backend API URL is correct
- Verify backend is running and accessible
- Check CORS settings in backend

**Q: Styling looks weird in production?**
- A: Clear browser cache
- Rebuild: `npm run build`
- Redeploy

**Q: Search history not saving?**
- A: Verify MongoDB connection string
- Check backend is connected to MongoDB
- Look at backend console for errors

---

Good luck! 🚀
