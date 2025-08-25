const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { setupDatabase } = require('./config/database');
const { initializeWeb3Service } = require('./services/Web3Service');
const { initializeZoomService } = require('./services/ZoomService');
const { initializeAuctionMonitorService } = require('./services/AuctionMonitorService');
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const meetingRoutes = require('./routes/meetings');
const { authenticateSocket } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      database: process.env.DATABASE_URL ? 'configured' : 'demo mode',
      blockchain: process.env.ETH_WSS_ENDPOINT ? 'configured' : 'demo mode',
      zoom: process.env.ZOOM_API_KEY ? 'configured' : 'demo mode'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/meetings', meetingRoutes);

// Socket.IO for real-time updates
io.use(authenticateSocket);
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-auction', (auctionId) => {
    socket.join(`auction-${auctionId}`);
    console.log(`Socket ${socket.id} joined auction ${auctionId}`);
  });
  
  socket.on('leave-auction', (auctionId) => {
    socket.leave(`auction-${auctionId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

async function startServer() {
  try {
    // Initialize services
    await setupDatabase();
    await initializeWeb3Service(io);
    await initializeZoomService();
    await initializeAuctionMonitorService(io);
    
    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, io };
