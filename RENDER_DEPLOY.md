# 🚀 Deploy to Render

This guide shows you how to deploy your Stone Paper Scissors game to Render for free.

## Prerequisites

1. **GitHub Account**: Your code must be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)

## 📋 Deployment Steps

### 1. Push Code to GitHub

First, ensure your code is in a GitHub repository:

```bash
# If not already a git repository
git init
git add .
git commit -m "Initial commit - Stone Paper Scissors game"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 2. Deploy on Render

#### Option A: Using render.yaml (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file and configure everything

#### Option B: Manual Setup
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the following settings:

**Basic Settings:**
- **Name**: `stone-paper-scissors-game`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty (will build from root)

**Build & Deploy:**
- **Build Command**: 
  ```bash
  cd client && npm ci && npm run build && cd ../server && npm ci
  ```
- **Start Command**: 
  ```bash
  cd server && npm start
  ```

**Environment Variables:**
- `NODE_ENV` = `production`
- `PORT` = (auto-assigned by Render)
- `CLIENT_URL` = `https://YOUR_APP_NAME.onrender.com`

### 3. Configure Environment Variables

After deployment, you'll get a URL like `https://your-app-name.onrender.com`. Update your environment variables:

1. In Render Dashboard, go to your service
2. Click "Environment" tab
3. Add/update:
   - `CLIENT_URL` = `https://your-app-name.onrender.com`

### 4. Test Your Deployment

1. Visit your Render URL: `https://your-app-name.onrender.com`
2. Check the health endpoint: `https://your-app-name.onrender.com/api/health`
3. Try creating and joining a game to test Socket.IO

## 🔧 Configuration Files

### render.yaml
The included `render.yaml` automates the entire deployment:

```yaml
services:
  - type: web
    name: stone-paper-scissors-game
    env: node
    plan: free
    buildCommand: |
      cd client && npm ci && npm run build && 
      cd ../server && npm ci
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        fromService:
          type: web
          name: stone-paper-scissors-game
          property: port
      - key: CLIENT_URL
        fromService:
          type: web
          name: stone-paper-scissors-game
          property: host
```

## 🔄 Auto-Deploy Setup

To enable automatic deploys when you push to GitHub:

1. In your Render service dashboard
2. Go to "Settings" → "Build & Deploy"
3. Enable "Auto-Deploy" for your main branch
4. Every push to main will trigger a new deployment

## 📊 Monitoring & Logs

### View Logs
1. In Render Dashboard, go to your service
2. Click "Logs" tab to see real-time logs
3. Monitor for any startup errors or Socket.IO connections

### Health Monitoring
- Render automatically monitors your service
- Visit `/api/health` to check service status
- Monitor response times and uptime in the dashboard

## 🐛 Troubleshooting

### Build Failed
**Check build logs for:**
- Missing dependencies
- Node.js version compatibility
- Build command path issues

**Common fixes:**
```bash
# Ensure package.json exists in both client and server
# Check Node.js version compatibility
# Verify build commands are correct
```

### App Not Loading
**Check:**
- `dist/` folder was created during build
- Server is serving static files correctly
- Environment variables are set correctly

**Debug:**
```bash
# Check health endpoint
curl https://your-app-name.onrender.com/api/health

# Check if static files are served
curl https://your-app-name.onrender.com/
```

### Socket.IO Connection Issues
**Verify:**
- `CLIENT_URL` environment variable is correct
- CORS settings allow your domain
- Socket.IO client is connecting to the right URL

## 💰 Cost & Limits

**Free Plan Includes:**
- 750 hours/month (enough for basic usage)
- Automatic SSL certificate
- Custom domain support
- GitHub auto-deploy

**Limitations:**
- Service spins down after 15 minutes of inactivity
- First request after sleep may take 10-30 seconds
- 512MB RAM limit

**Upgrade to Paid Plan for:**
- Always-on service (no spinning down)
- More RAM and CPU
- Priority support
- Better performance

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` files to git
2. **CORS Configuration**: Only allow your actual domain in production
3. **Rate Limiting**: Consider adding rate limiting for Socket.IO connections
4. **HTTPS**: Render provides free SSL certificates
5. **Dependencies**: Keep packages updated for security patches

## 📈 Scaling Considerations

For higher traffic, consider:

1. **Horizontal Scaling**: Deploy multiple instances
2. **Database**: Add Redis for session storage and game state
3. **Load Balancing**: Use Render's built-in load balancing
4. **CDN**: Serve static assets via CDN for global performance
5. **Monitoring**: Add application performance monitoring (APM)

## 🎯 Next Steps

After successful deployment:

1. **Custom Domain**: Add your own domain in Render settings
2. **Monitoring**: Set up alerts for downtime or errors
3. **Analytics**: Add user analytics to track game usage
4. **Features**: Add user accounts, leaderboards, or tournaments
5. **Mobile**: Test on mobile devices and optimize responsive design

Your Stone Paper Scissors game is now live on Render! 🎉