const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const SocketHandler = require('./socket/socketHandler');

// Load environment variables
require('dotenv').config();

// Environment configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
const server = http.createServer(app);

// Configure CORS based on environment
const allowedOrigins = NODE_ENV === 'production' 
  ? [process.env.CLIENT_URL, `http://localhost:${PORT}`]
  : [CLIENT_URL, 'http://localhost:5173', 'http://localhost:3001'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(express.json());

// Serve static files from client build
app.use(express.static(path.join(__dirname, '../../client/dist')));

// CORS middleware for REST API
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Stone Paper Scissors Server is running',
    timestamp: new Date().toISOString()
  });
});

// Game routes
app.get('/api/games', (req, res) => {
  res.json({ message: 'Game API is working' });
});

// Favicon route to prevent 500 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Initialize socket handling
new SocketHandler(io);

// Serve the client app for any non-API routes (SPA fallback)
app.get('*', (req, res) => {
  // Skip favicon requests
  if (req.path === '/favicon.ico') {
    return res.status(204).end();
  }
  
  // Serve index.html for all other routes (SPA routing)
  const indexPath = path.join(__dirname, '../../client/dist/index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'Game client not found', 
      message: 'Please build the client first: cd client && npm run build' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🎮 Stone Paper Scissors Server running on port ${PORT}`);
  console.log(`📦 Environment: ${NODE_ENV}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🔗 Socket.IO server ready for connections`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, server, io };