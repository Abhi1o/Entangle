# Vercel Deployment Guide

## 🚀 **Pre-Deployment Checklist**

### ✅ **1. Environment Variables Setup**

Before deploying, you need to set up these environment variables in your Vercel project:

#### **Required Environment Variables:**
```bash
# Para Configuration (Required)
NEXT_PUBLIC_PARA_APP_ID=your-para-app-id
NEXT_PUBLIC_PARA_API_KEY=your-para-api-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### **Optional Environment Variables:**
```bash
# Twitter OAuth (if using Twitter login)
NEXT_PUBLIC_TWITTER_CLIENT_ID=your-twitter-client-id

# Etherscan API (for wallet data)
NEXT_PUBLIC_ETHERSCAN_API_KEY=your-etherscan-api-key
```

### ✅ **2. Para Wallet Setup**

1. **Get Para App ID:**
   - Visit [Para Dashboard](https://app.para.xyz)
   - Create a new app or use existing one
   - Copy your App ID

2. **Configure Para API Key:**
   - In your Para dashboard, generate an API key
   - Add it to Vercel environment variables

### ✅ **3. Local Testing**

Before deploying, test locally:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Test build
npm run build

# Test production
npm start
```

## 🚀 **Deployment Steps**

### **Step 1: Prepare Your Repository**

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Ensure these files are committed:**
   - ✅ `package.json`
   - ✅ `next.config.mjs`
   - ✅ `vercel.json`
   - ✅ `.gitignore`
   - ✅ All source code files

### **Step 2: Deploy to Vercel**

#### **Option A: Vercel Dashboard (Recommended)**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend` (if your frontend is in a subdirectory)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

#### **Option B: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Follow the prompts
```

### **Step 3: Configure Environment Variables**

1. In your Vercel project dashboard
2. Go to "Settings" → "Environment Variables"
3. Add each environment variable:
   ```
   Name: NEXT_PUBLIC_PARA_APP_ID
   Value: your-para-app-id
   Environment: Production, Preview, Development
   ```

4. Repeat for all required environment variables

### **Step 4: Deploy**

1. **Trigger a new deployment:**
   - Push to main branch, or
   - Click "Redeploy" in Vercel dashboard

2. **Monitor the build:**
   - Check build logs for any errors
   - Ensure all environment variables are loaded

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Build Failures**
```bash
# Error: Cannot find module
# Solution: Ensure all dependencies are in package.json
npm install --save missing-package
```

#### **2. Environment Variables Not Loading**
- Check variable names start with `NEXT_PUBLIC_`
- Ensure variables are set for all environments
- Redeploy after adding variables

#### **3. Para SDK Issues**
- Verify `NEXT_PUBLIC_PARA_APP_ID` is correct
- Check Para dashboard for API key validity
- Ensure Para app is configured for your domain

#### **4. Hydration Errors**
- The app includes hydration fixes (see `HYDRATION_FIX.md`)
- If issues persist, check browser console for specific errors

### **Performance Optimizations**

The app includes several optimizations:
- ✅ **Code Splitting:** Automatic with Next.js
- ✅ **Image Optimization:** Configured in `next.config.mjs`
- ✅ **Caching:** Headers configured for better performance
- ✅ **Bundle Optimization:** Webpack optimizations applied

## 📱 **Post-Deployment**

### **1. Test Your App**
- ✅ Test Para wallet login
- ✅ Test all major features
- ✅ Check mobile responsiveness
- ✅ Verify environment variables work

### **2. Configure Custom Domain (Optional)**
1. In Vercel dashboard → "Settings" → "Domains"
2. Add your custom domain
3. Update DNS records as instructed

### **3. Set Up Monitoring**
- Enable Vercel Analytics
- Set up error monitoring
- Configure performance monitoring

## 🔒 **Security Considerations**

### **Environment Variables**
- ✅ Never commit `.env` files
- ✅ Use `NEXT_PUBLIC_` prefix for client-side variables
- ✅ Keep API keys secure

### **CORS Configuration**
- Para SDK handles CORS automatically
- No additional configuration needed

## 📞 **Support**

If you encounter issues:

1. **Check Vercel Build Logs:** Detailed error information
2. **Para Documentation:** [docs.para.xyz](https://docs.para.xyz)
3. **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)

## 🎉 **Success!**

Once deployed successfully:
- Your app will be available at `https://your-app.vercel.app`
- Para wallet integration will work
- All features should function properly

---

**Note:** This deployment guide assumes you're deploying the `frontend` directory. If your structure is different, adjust the paths accordingly.
