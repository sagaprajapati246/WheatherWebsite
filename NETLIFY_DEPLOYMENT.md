# 🚀 Netlify Deployment Guide

## تیزی سے Netlify پر Deploy کریں | Quick Netlify Setup

---

## **Step 1: Backend Deploy (Railway.app - Easiest)**

### 1A. Prepare Backend
```bash
cd backend
npm install
```

Make sure your `backend/package.json` has a `"start"` script (✅ it does!)

### 1B. Create MongoDB Atlas Database

1. Go to [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Click **"Sign Up"** (free tier available)
3. Create a free cluster
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/weather-dashboard`
5. Copy this connection string

### 1C. Update Backend Code for MongoDB Atlas

Replace the hardcoded MongoDB URL in `backend/app.js`:

**Find this line (around line 7):**
```javascript
mongoose.connect('mongodb://localhost:27017/weather-dashboard', {
```

**Replace with:**
```javascript
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-dashboard';
mongoose.connect(mongoURI, {
```

Also add this to handle PORT from environment:

**Find this line at the end of app.js:**
```javascript
const PORT = 5000;
app.listen(PORT, () => {
```

**Replace with:**
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
```

### 1D. Deploy to Railway.app

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"** → **"Deploy from GitHub"**
3. Authorize Railway with GitHub
4. Select your repository
5. Select the **`backend`** folder as the root directory
6. Go to **Variables** tab, add:
   - **Key:** `MONGODB_URI`
   - **Value:** `mongodb+srv://username:password@cluster.mongodb.net/weather-dashboard`
7. Click **"Deploy"**
8. Copy the URL from Railway (looks like: `https://weather-api-prod-up.railway.app`)

---

## **Step 2: Frontend Deploy to Netlify**

### 2A. Push to GitHub

```bash
# From project root directory
git init
git add .
git commit -m "Initial: Weather Dashboard"
git remote add origin https://github.com/YOUR_USERNAME/weather-dashboard.git
git branch -M main
git push -u origin main
```

### 2B. Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **"Sign up"** (use GitHub login for easier auth)
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose **GitHub** → Authorize
5. Select your **weather-dashboard** repository
6. **Build Settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
7. Click **"Deploy site"**

### 2C. Add Backend URL as Environment Variable

1. In Netlify dashboard, go to **Site settings** → **Environment variables** (or Build & Deploy → Environment)
2. Click **"Add a variable"**
3. Set:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://weather-api-prod-up.railway.app` (your Railway URL from Step 1D)
4. Trigger a new deploy: **Deploys** → **Trigger deploy** → **Deploy site**

---

## **Step 3: Update Backend API Port (Important!)**

In your `backend/app.js`, make sure the PORT listens to environment variable:

```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Railway will automatically assign a PORT - your backend must respect it!

---

## **Step 4: Test Your Deployment**

1. ✅ Visit your Netlify URL (you'll get something like `https://xxxxx.netlify.app`)
2. ✅ Search for a city
3. ✅ Check browser console (F12) for errors
4. ✅ Verify backend API responses

---

## **Troubleshooting**

### ❌ "Cannot reach API" or CORS errors
- Verify Railway backend URL in Netlify env vars
- Check MongoDB connection in Railway logs
- Add CORS headers in backend (already done ✅)

### ❌ Build fails on Netlify
- Make sure `frontend/package.json` has all dependencies
- Run locally: `npm install && npm run build`

### ❌ Railway deployment fails
- Check `backend/package.json` has `"start": "node app.js"`
- Verify MongoDB connection string is correct
- Check Railway logs for errors

---

## **Quick Checklist**

- [ ] MongoDB Atlas account created & connection string ready
- [ ] Backend code updated (PORT & MONGODB_URI from env)
- [ ] Code pushed to GitHub
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Netlify
- [ ] Environment variable `VITE_API_URL` set in Netlify
- [ ] Netlify deploy triggered after env var change
- [ ] Frontend loads without errors
- [ ] Search works & calls backend API

---

## **Environment Variables Summary**

### Netlify Frontend
```
VITE_API_URL = https://your-railway-url.app
```

### Railway Backend
```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/weather-dashboard
PORT = (auto-assigned by Railway)
NODE_ENV = production
```

---

**That's it! 🎉 Your app is live on Netlify!**
