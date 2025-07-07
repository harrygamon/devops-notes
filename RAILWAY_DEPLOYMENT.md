# Railway Deployment Guide

This guide will help you deploy your DevOps Notes application to Railway.

## 🚀 Quick Start

### Prerequisites
- [Railway account](https://railway.app/) (free tier available)
- GitHub repository with your code
- Docker knowledge (basic)

## 📋 Step-by-Step Deployment

### 1. Create Railway Account
1. Go to [railway.app](https://railway.app/)
2. Sign up with GitHub (recommended)
3. Verify your email

### 2. Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `electron-devops-notes` repository
4. Click "Deploy Now"

### 3. Configure Environment Variables
In your Railway project dashboard:

1. Go to your project
2. Click on the service (should be named after your repo)
3. Go to "Variables" tab
4. Add these environment variables:

```bash
# Basic Auth (required)
BASIC_AUTH_USERNAME=your_username
BASIC_AUTH_PASSWORD=your_secure_password

# Optional: News API (if you want news features)
NEWS_API_KEY=your_news_api_key

# Optional: Snyk token (for security scanning)
SNYK_TOKEN=your_snyk_token
```

### 4. Configure Domain (Optional)
1. Go to "Settings" tab
2. Click "Generate Domain" or add custom domain
3. Your app will be available at the provided URL

### 5. Set Up GitHub Actions (Optional)
For automatic deployments:

1. Get your Railway token:
   - Go to Railway dashboard
   - Click your profile → "Account Settings"
   - Go to "Tokens" tab
   - Create new token

2. Get your Project ID:
   - In your Railway project
   - Go to "Settings" tab
   - Copy the Project ID

3. Add GitHub Secrets:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `RAILWAY_TOKEN`: Your Railway token
     - `RAILWAY_PROJECT_ID`: Your project ID

## 🔧 Configuration Files

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "target": "web",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### railway.toml
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
target = "web"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[deploy.healthcheck]
path = "/health"
interval = "30s"
timeout = "10s"
retries = 3
startPeriod = "40s"

[[services]]
name = "devops-notes-web"
```

## 🌐 Access Your App

Once deployed, your app will be available at:
- **Railway URL**: `https://your-project-name.railway.app`
- **Custom Domain**: If you configured one

### Basic Authentication
Your app is protected with Basic Auth:
- Username: Set in `BASIC_AUTH_USERNAME`
- Password: Set in `BASIC_AUTH_PASSWORD`

## 🔄 Automatic Deployments

With GitHub Actions configured, your app will automatically deploy when you:
- Push to `main` branch
- Create a new release
- Manually trigger the workflow

## 📊 Monitoring

Railway provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, network usage
- **Health Checks**: Automatic health monitoring
- **Rollbacks**: Easy rollback to previous deployments

## 🛠️ Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Dockerfile syntax
   - Verify all dependencies are in package.json
   - Check Railway logs for specific errors

2. **App Not Starting**
   - Verify environment variables are set
   - Check if port 80 is exposed in Dockerfile
   - Review application logs

3. **Basic Auth Not Working**
   - Ensure `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` are set
   - Check nginx configuration
   - Verify .htpasswd file is properly mounted

### Useful Commands

```bash
# View logs
railway logs

# Check status
railway status

# Redeploy
railway up

# Open in browser
railway open
```

## 💰 Pricing

Railway offers:
- **Free Tier**: $5 credit monthly
- **Pro Plan**: Pay-as-you-use
- **Team Plan**: For collaboration

Your DevOps Notes app should fit comfortably in the free tier.

## 🔒 Security Features

Your deployed app includes:
- ✅ Basic Authentication
- ✅ HTTPS encryption
- ✅ Security headers
- ✅ Rate limiting
- ✅ Input validation

## 📱 Features Available

Once deployed, you'll have access to:
- ✅ DevOps Notes management
- ✅ AI Assistant (if Ollama is configured)
- ✅ News integration (if API key is set)
- ✅ Responsive design
- ✅ Offline capability

## 🎉 Next Steps

After successful deployment:
1. Test all features
2. Set up monitoring alerts
3. Configure custom domain (optional)
4. Set up backup strategy
5. Monitor usage and costs

## 📞 Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app/)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **GitHub Issues**: For app-specific issues

---

**Happy Deploying! 🚀** 