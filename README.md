# Meeting Auction Platform

A decentralized platform for auctioning exclusive meeting time with industry experts and thought leaders using blockchain technology.

## 🚀 Features

- **Smart Contract Auctions**: Gas-optimized auction contracts with anti-sniping protection
- **Dual Authentication**: Para Wallet + Twitter for creators, direct wallet connection for bidders
- **Real-time Bidding**: WebSocket-powered live updates with blockchain synchronization
- **Secure Meeting Distribution**: Multi-layer JWT token system with blockchain verification
- **Zoom Integration**: Automated meeting creation with secure access controls
- **Responsive UI**: Modern, mobile-friendly interface

## 📁 Project Structure

```
meeting-auction-platform/
├── contracts/                 # Smart contracts
│   ├── MeetingAuction.sol    # Main auction contract
│   ├── hardhat.config.js     # Hardhat configuration
│   ├── scripts/deploy.js     # Deployment script
│   └── package.json          # Contract dependencies
├── backend/                   # Node.js backend
│   ├── src/
│   │   ├── server.js         # Main server file
│   │   ├── config/           # Database and configuration
│   │   ├── services/         # Web3 and Zoom services
│   │   ├── routes/           # API routes
│   │   └── middleware/       # Authentication middleware
│   ├── tests/                # Backend tests
│   └── package.json          # Backend dependencies
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── contexts/         # React contexts
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   └── contracts/        # Contract ABIs
│   └── package.json          # Frontend dependencies
├── database/                  # Database schema
│   └── schema.sql            # PostgreSQL schema
├── scripts/                   # Deployment scripts
│   └── deploy.sh             # Main deployment script
├── docker-compose.yml        # Docker configuration
└── ecosystem.config.js       # PM2 configuration
```

## 🛠️ Installation

### Prerequisites

- Node.js 16+ and npm
- PostgreSQL 15+
- Redis 7+
- Docker and Docker Compose (optional)

### 1. Clone and Setup

```bash
git clone <repository>
cd meeting-auction-platform

# Create environment files
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
```

### 2. Install Dependencies

```bash
# Install contract dependencies
cd contracts && npm install

# Install backend dependencies  
cd ../backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Environment Configuration

#### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://localhost:5432/meeting_auction
REDIS_URL=redis://localhost:6379

# Blockchain
ETH_WSS_ENDPOINT=wss://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
AUCTION_CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Para Wallet
PARA_API_KEY=your-para-api-key

# Twitter OAuth
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
TWITTER_REDIRECT_URI=http://localhost:3000/auth/twitter/callback

# Zoom
ZOOM_API_KEY=your-zoom-api-key
ZOOM_API_SECRET=your-zoom-api-secret
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AUCTION_CONTRACT_ADDRESS=0x...
REACT_APP_PARA_WALLET_API_KEY=your-para-api-key
REACT_APP_TWITTER_CLIENT_ID=your-twitter-client-id
REACT_APP_ENVIRONMENT=development
```

### 4. Database Setup

```bash
# Start PostgreSQL and Redis
docker-compose up postgres redis -d

# Or manually:
# - Install PostgreSQL and create database 'meeting_auction'
# - Install Redis and start the service
# - Run database/schema.sql to create tables
```

### 5. Smart Contract Deployment

```bash
cd contracts

# Compile contracts
npx hardhat compile

# Deploy to local network
npx hardhat run scripts/deploy.js --network hardhat

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia

# Update contract address in environment files
```

## 🚀 Running the Application

### Development Mode

```bash
# Start backend (in one terminal)
cd backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm start
```

### Production Mode

```bash
# Using Docker Compose
docker-compose up

# Or using PM2
cd backend
npm run build
pm2 start ecosystem.config.js --env production

cd frontend
npm run build
# Deploy to your web server
```

## 🧪 Testing

```bash
# Test smart contracts
cd contracts
npm test

# Test backend
cd backend
npm test

# Test frontend
cd frontend
npm test
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/para-twitter` - Para Wallet + Twitter authentication
- `POST /api/auth/wallet` - Wallet-based authentication
- `GET /api/auth/verify` - Verify JWT token

### Auction Endpoints

- `POST /api/auctions/create` - Create new auction (creators only)
- `GET /api/auctions/active` - Get active auctions
- `GET /api/auctions/:id` - Get auction details
- `GET /api/auctions/user/created` - Get user's created auctions

### Meeting Endpoints

- `GET /api/meetings/access/:token` - Verify meeting access
- `GET /api/meetings/join/:token` - Join meeting
- `GET /api/meetings/notifications` - Get user notifications
- `PUT /api/meetings/notifications/:id/read` - Mark notification as read

## 🔧 Smart Contract Features

- **Anti-sniping Protection**: Automatic time extensions for late bids
- **Gas Optimization**: Variable packing reduces gas costs by ~70%
- **Pull-over-Push**: Secure refund patterns for outbid users
- **Emergency Controls**: Pause/unpause functionality
- **Platform Fees**: Configurable fee structure

## 🔐 Security Features

- **Multi-layer Authentication**: JWT tokens with blockchain verification
- **Secure Meeting Access**: Single-use, time-limited access tokens
- **Reverse Proxy**: Never expose actual Zoom links to users
- **Signature Verification**: Wallet-based authentication
- **Rate Limiting**: Built-in protection against abuse

## 🌐 Real-time Features

- **Live Bidding**: WebSocket-powered real-time updates
- **Optimistic UI**: Instant feedback with blockchain confirmation
- **Live Countdown**: Real-time auction timers with extensions
- **Notifications**: Push notifications for auction events

## 📱 Frontend Features

- **Responsive Design**: Mobile-first approach
- **Web3 Integration**: MetaMask and WalletConnect support
- **Real-time Updates**: Socket.IO integration
- **Modern UI**: Clean, intuitive interface

## 🚀 Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Manual Deployment

```bash
# Run the deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔮 Roadmap

- [ ] Para Wallet integration
- [ ] IPFS metadata storage
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Multi-chain support
- [ ] Advanced auction types
- [ ] Social features
- [ ] API rate limiting
- [ ] Advanced security features


//COmmands:

