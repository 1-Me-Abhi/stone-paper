# Stone Paper Scissors Game - Deployment Guide

A modern multiplayer Stone Paper Scissors game built with Svelte and Node.js/Socket.IO.

## 🚀 Quick Deployment

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

### 1. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

### 2. Build Production Client
```bash
cd client
npm run build
```
This creates an optimized `dist/` folder with the production client.

### 3. Configure Environment
```bash
# Copy example environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit server/.env for your deployment:
# PORT=3001
# NODE_ENV=production  
# CLIENT_URL=http://your-domain.com

# Edit client/.env for your deployment:
# VITE_SERVER_URL=http://your-domain.com
```

### 4. Start Production Server
```bash
cd server
npm run start
```

The server will:
- Serve the built client from `client/dist/` 
- Handle Socket.IO connections for multiplayer gameplay
- Run on the configured PORT (default: 3001)

## 🔧 Development Mode

### Start Development Servers
```bash
# Terminal 1: Start server in development mode
cd server
npm run dev

# Terminal 2: Start client development server
cd client  
npm run dev
```

Development URLs:
- Client: http://localhost:5173
- Server: http://localhost:3001
- API Health: http://localhost:3001/api/health

## 🌐 Production Deployment Options

### Option 1: Single Server (Recommended)
Deploy the server which serves both the API and the built client:

1. Build the client: `cd client && npm run build`
2. Deploy the server folder to your hosting provider
3. Set environment variables in production
4. Start with `npm run start`

### Option 2: Render (Free Hosting) 🔥
Deploy to Render for free with automatic builds:

1. **Quick Deploy**: See [RENDER_DEPLOY.md](RENDER_DEPLOY.md) for complete guide
2. **Push to GitHub**: Commit your code to a GitHub repository
3. **Connect Render**: Use the included `render.yaml` for automated setup
4. **Auto-Deploy**: Automatic deployments on every push to main

**Render Features:**
- ✅ Free plan available (750 hours/month)
- ✅ Automatic SSL certificates
- ✅ Auto-deploy from GitHub
- ✅ Built-in monitoring and logs
- ✅ Custom domain support

### Option 3: Separate Hosting  
Deploy client and server separately:

1. Deploy `client/dist/` to a static host (Netlify, Vercel, etc.)
2. Deploy `server/` to a Node.js host (Railway, Render, Heroku, etc.)
3. Update `VITE_SERVER_URL` in client environment to point to server
4. Update `CLIENT_URL` in server environment to allow CORS

## 📝 Environment Variables

### Server (.env)
```bash
PORT=3001                    # Server port
NODE_ENV=production          # Environment mode  
CLIENT_URL=http://localhost:3001  # Client URL for CORS
```

### Client (.env)
```bash
VITE_SERVER_URL=http://localhost:3001  # Server URL for Socket.IO
```

## 🏗️ Project Structure
```
stone-paper-scissors-game/
├── client/                  # Svelte frontend
│   ├── dist/               # Built production files (created by build)
│   ├── src/                # Source code
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/                # Server source code
│   └── package.json
└── README.md
```

## 🔍 Health Check
Once deployed, verify your deployment:
- Visit your domain to see the game interface
- Check `/api/health` endpoint for server status
- Try creating and joining a game to test Socket.IO

## 🛠️ Troubleshooting

### Common Issues:

**Client not loading:**
- Ensure `npm run build` was run in client/
- Check server logs for file serving errors
- Verify `dist/` folder exists in client/

**Socket connection failed:**
- Check `VITE_SERVER_URL` in client environment
- Verify server CORS configuration
- Ensure server is accessible from client domain

**CORS errors:**
- Update `CLIENT_URL` in server environment
- Check that both client and server URLs are correctly configured

### Production Logs:
```bash
cd server
npm run start 2>&1 | tee production.log
```

## 📦 Dependencies

### Server
- express: Web server framework
- socket.io: Real-time communication
- dotenv: Environment variable management

### Client  
- svelte: Frontend framework
- vite: Build tool and dev server
- socket.io-client: Socket.IO client library

## 🔐 Security Notes
- Set strong `NODE_ENV=production` in production
- Configure proper CORS origins
- Use HTTPS in production
- Consider rate limiting for Socket.IO connections

## 📊 Performance
- Client bundle size: ~77KB (gzipped: ~24KB)
- Server memory usage: ~50MB baseline
- Supports concurrent multiplayer games
- Real-time Socket.IO communication