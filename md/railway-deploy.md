# 🚀 Railway Deployment - Step by Step

## 🎯 Quick Start (5 Minutes)

### 1. Prepare Your Code
```bash
# Run pre-deployment setup
npx ts-node scripts/deploy-setup.ts

# Build your project
npm run build

# Test locally
npm start
```

### 2. Create GitHub Repository
```bash
# Initialize git
git init
git add .
git commit -m "Ready for deployment with sharding"

# Create repo on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/url-shortener.git
git push -u origin main
```

### 3. Deploy on Railway
1. **Sign Up**: Go to [railway.app](https://railway.app) → Sign up with GitHub
2. **New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Select Repo**: Choose your URL shortener repository
4. **Auto-Deploy**: Railway will automatically detect Node.js and deploy

### 4. Create Databases
In Railway dashboard:
1. Click "New" → "Database" → "PostgreSQL"
2. Create 4 databases:
   - `main-db`
   - `shard-0` 
   - `shard-1`
   - `shard-2`

### 5. Set Environment Variables
In Railway → Variables tab:

```bash
# Database URLs (Railway provides these)
DATABASE_URL="postgresql://postgres:password@host:port/main-db"
DATABASE_URL_SHARD_0="postgresql://postgres:password@host:port/shard-0"
DATABASE_URL_SHARD_1="postgresql://postgres:password@host:port/shard-1"
DATABASE_URL_SHARD_2="postgresql://postgres:password@host:port/shard-2"

# App Configuration
BASE_URL="https://your-app-name.railway.app"
NODE_ENV="production"
PORT=3000

# Sharding
SHARDING_STRATEGY="hash"
TOTAL_SHARDS=3
```

### 6. Run Migrations
In Railway terminal or locally:
```bash
npx prisma migrate deploy
```

## 🎉 You're Live!

Your sharded URL shortener is now deployed at:
`https://your-app-name.railway.app`

## 🧪 Test Your Deployment

```bash
# Create URL
curl -X POST https://your-app-name.railway.app/api/url/create \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.google.com"}'

# Redirect
curl "https://your-app-name.railway.app/api/url/redirect?shortUrl=https://your-app-name.railway.app/SHORT_CODE"
```

## 🆓 Free Tier Benefits

- **500 hours/month** (enough for development)
- **1GB storage** per database
- **100GB bandwidth** per month
- **Custom domains** support
- **No credit card** required

## 🚨 Troubleshooting

### Build Fails?
- Check package.json scripts
- Ensure all dependencies are listed

### Database Issues?
- Verify environment variables
- Check database URLs

### Migration Errors?
- Run migrations manually
- Check Prisma schema

## 🎯 What You'll Learn

- Production deployment
- Environment management
- Database hosting
- CI/CD pipelines
- Production monitoring
- Scaling strategies

---

**Ready to go live? Let's deploy! 🚀**
