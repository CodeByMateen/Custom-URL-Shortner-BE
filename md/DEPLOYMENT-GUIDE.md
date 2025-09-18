# 🚀 FREE Deployment Guide - Sharded URL Shortener

## 🌟 Platform: Railway (Recommended)

### Why Railway?
- ✅ FREE PostgreSQL databases (perfect for sharding!)
- ✅ Easy deployment from GitHub
- ✅ Environment variables management
- ✅ Custom domains support
- ✅ No credit card required

## 📋 Pre-Deployment Checklist

### 1. Prepare Your Code
- [ ] All sharding code is working locally
- [ ] Environment variables are documented
- [ ] Package.json has proper scripts
- [ ] No local file dependencies

### 2. Create GitHub Repository
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit with sharding implementation"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/url-shortener.git
git push -u origin main
```

## 🚀 Railway Deployment Steps

### Step 1: Sign Up
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your GitHub account

### Step 2: Create Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your URL shortener repository
4. Railway will auto-detect Node.js

### Step 3: Create Databases
1. In Railway dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Create 4 databases:
   - `main-db` (original database)
   - `shard-0` (shard 0)
   - `shard-1` (shard 1) 
   - `shard-2` (shard 2)

### Step 4: Configure Environment Variables
In Railway dashboard → Variables tab:

```bash
# Database URLs (Railway will provide these)
DATABASE_URL="postgresql://postgres:password@host:port/main-db"
DATABASE_URL_SHARD_0="postgresql://postgres:password@host:port/shard-0"
DATABASE_URL_SHARD_1="postgresql://postgres:password@host:port/shard-1"
DATABASE_URL_SHARD_2="postgresql://postgres:password@host:port/shard-2"

# App Configuration
BASE_URL="https://your-app-name.railway.app"
NODE_ENV="production"
PORT=3000

# Redis (optional - Railway provides Redis too)
REDIS_URL="redis://default:password@host:port"

# Sharding Configuration
SHARDING_STRATEGY="hash"
TOTAL_SHARDS=3
```

### Step 5: Update Package.json Scripts
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "dev": "nodemon src/server.ts",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate deploy",
    "postinstall": "prisma generate && prisma migrate deploy"
  }
}
```

### Step 6: Deploy
1. Railway will automatically deploy when you push to GitHub
2. Check deployment logs for any errors
3. Your app will be available at `https://your-app-name.railway.app`

## 🔧 Post-Deployment Steps

### 1. Run Migrations
```bash
# Railway provides a web terminal or you can run locally with Railway DB URLs
npx prisma migrate deploy
```

### 2. Test Your Deployment
```bash
# Test creating URL
curl -X POST https://your-app-name.railway.app/api/url/create \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.google.com"}'

# Test redirect
curl "https://your-app-name.railway.app/api/url/redirect?shortUrl=https://your-app-name.railway.app/SHORT_CODE"
```

## 🌐 Custom Domain (Optional)

1. In Railway dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update BASE_URL environment variable

## 📊 Monitoring

Railway provides:
- ✅ Real-time logs
- ✅ Database monitoring
- ✅ Performance metrics
- ✅ Error tracking

## 🆓 Free Tier Limits

- **App**: 500 hours/month (enough for development)
- **Database**: 1GB storage per database
- **Bandwidth**: 100GB/month
- **Custom domains**: Unlimited

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check package.json scripts
   - Ensure all dependencies are in package.json

2. **Database Connection Issues**
   - Verify environment variables
   - Check database URLs are correct

3. **Migration Errors**
   - Run migrations manually in Railway terminal
   - Check Prisma schema compatibility

## 🎯 Alternative Platforms

### Option 2: Render
- Similar to Railway
- Good for Node.js apps
- Free tier available

### Option 3: Vercel
- Best for frontend + API
- Serverless functions
- Excellent performance

### Option 4: Heroku
- Classic platform
- Limited free tier
- Requires credit card for some features

## 🎉 Success!

Once deployed, you'll have:
- ✅ Production-ready sharded URL shortener
- ✅ Multiple PostgreSQL databases
- ✅ Automatic scaling
- ✅ Professional deployment
- ✅ Real-world experience

## 📚 Learning Outcomes

After deployment, you'll understand:
- Production deployment process
- Environment variable management
- Database hosting
- CI/CD pipelines
- Production monitoring
- Scaling considerations

---

**Ready to deploy? Let's make your URL shortener live! 🚀**
