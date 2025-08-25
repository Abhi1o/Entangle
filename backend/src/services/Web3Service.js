const { Web3 } = require('web3');
const { pool } = require('../config/database');
const AuctionABI = require('../contracts/MeetingAuction.json');
const { createSecureMeeting } = require('./ZoomService');
const jwt = require('jsonwebtoken');

class Web3Service {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.io = null;
  }
  
  async initialize(socketIO) {
    this.io = socketIO;
    
    // Check if blockchain is configured
    if (!process.env.ETH_WSS_ENDPOINT || process.env.ETH_WSS_ENDPOINT.includes('YOUR_')) {
      console.log('⚠️  Blockchain not configured, running in demo mode');
      return;
    }
    
    try {
      // Initialize Web3 with WebSocket
      this.web3 = new Web3(
        new Web3.providers.WebsocketProvider(
          process.env.ETH_WSS_ENDPOINT,
          {
            clientConfig: {
              keepalive: true,
              keepaliveInterval: 60000,
            },
            reconnect: {
              auto: true,
              delay: 5000,
              maxAttempts: 10,
              onTimeout: false
            }
          }
        )
      );
      
      // Initialize contract
      this.contract = new this.web3.eth.Contract(
        AuctionABI.abi,
        process.env.AUCTION_CONTRACT_ADDRESS
      );
      
      // Start event listeners
      this.setupEventListeners();
      
      console.log('Web3Service initialized');
    } catch (error) {
      console.error('Web3Service initialization failed:', error);
      console.log('⚠️  Running in demo mode without blockchain');
    }
  }
  
  setupEventListeners() {
    // Listen for new auctions
    this.contract.events.AuctionCreated({})
    .on('data', (event) => this.handleAuctionCreated(event))
    .on('error', console.error);
    
    // Listen for new bids
    this.contract.events.BidPlaced({})
    .on('data', (event) => this.handleBidPlaced(event))
    .on('error', console.error);
    
    // Listen for auction endings
    this.contract.events.AuctionEnded({})
    .on('data', (event) => this.handleAuctionEnded(event))
    .on('error', console.error);
  }
  
  async handleAuctionCreated(event) {
    const { auctionId, host, twitterId, reservePrice, endBlock, metadataIPFS } = event.returnValues;
    
    console.log(`New auction created: ${auctionId}`);
    
    // Broadcast to all connected clients
    this.io.emit('auction-created', {
      auctionId,
      host,
      twitterId,
      reservePrice,
      endBlock,
      metadataIPFS,
      blockNumber: event.blockNumber
    });
  }
  
  async handleBidPlaced(event) {
    const { auctionId, bidder, amount, newEndBlock } = event.returnValues;
    
    console.log(`New bid on auction ${auctionId}: ${amount} ETH by ${bidder}`);
    
    // Broadcast to auction room
    this.io.to(`auction-${auctionId}`).emit('bid-placed', {
      auctionId,
      bidder,
      amount,
      newEndBlock,
      blockNumber: event.blockNumber,
      timestamp: Date.now()
    });
  }
  
  async handleAuctionEnded(event) {
    const { auctionId, winner, host, winningBid } = event.returnValues;
    
    console.log(`Auction ${auctionId} ended. Winner: ${winner}, Amount: ${winningBid}`);
    
    try {
      // Create meeting for winner and host
      await this.createMeetingForAuction(auctionId, winner, host);
      
      // Broadcast auction end
      this.io.emit('auction-ended', {
        auctionId,
        winner,
        host,
        winningBid,
        blockNumber: event.blockNumber
      });
      
    } catch (error) {
      console.error(`Failed to create meeting for auction ${auctionId}:`, error);
    }
  }
  
  async createMeetingForAuction(auctionId, winnerAddress, hostAddress) {
    try {
      // Get auction details from database
      const auctionQuery = 'SELECT * FROM auctions WHERE id = $1';
      const auctionResult = await pool.query(auctionQuery, [auctionId]);
      
      if (auctionResult.rows.length === 0) {
        throw new Error(`Auction ${auctionId} not found in database`);
      }
      
      const auction = auctionResult.rows[0];
      
      // Create Zoom meeting
      const meeting = await createSecureMeeting({
        topic: `Auction ${auctionId} Meeting`,
        duration: auction.meeting_duration || 60,
        auctionId
      });
      
      // Generate access tokens
      const hostToken = jwt.sign({
        auctionId,
        userId: hostAddress,
        role: 'host',
        meetingId: meeting.id,
        type: 'meeting_access'
      }, process.env.JWT_SECRET, { expiresIn: '24h' });
      
      const winnerToken = jwt.sign({
        auctionId,
        userId: winnerAddress,
        role: 'participant',
        meetingId: meeting.id,
        type: 'meeting_access'
      }, process.env.JWT_SECRET, { expiresIn: '24h' });
      
      // Store meeting data
      const insertMeetingQuery = `
        INSERT INTO meetings (
          auction_id, zoom_meeting_id, host_token, winner_token,
          actual_meeting_url, password, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      
      await pool.query(insertMeetingQuery, [
        auctionId,
        meeting.id,
        hostToken,
        winnerToken,
        meeting.join_url,
        meeting.password,
        new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      ]);
      
      // Send notifications to users
      await this.sendMeetingNotifications(auctionId, hostAddress, winnerAddress, hostToken, winnerToken);
      
      // Update smart contract
      const accounts = await this.web3.eth.getAccounts();
      await this.contract.methods
        .scheduleMeeting(auctionId, `meeting_${meeting.id}`)
        .send({ from: accounts[0] });
      
      console.log(`Meeting created for auction ${auctionId}`);
      
    } catch (error) {
      console.error('Failed to create meeting:', error);
      throw error;
    }
  }
  
  async sendMeetingNotifications(auctionId, hostAddress, winnerAddress, hostToken, winnerToken) {
    const notifications = [
      {
        user_address: winnerAddress,
        type: 'auction_won',
        title: 'Congratulations! You won the auction',
        message: 'Access your exclusive meeting using the secure link',
        data: {
          auctionId,
          accessUrl: `${process.env.FRONTEND_URL}/meeting-access/${winnerToken}`
        }
      },
      {
        user_address: hostAddress,
        type: 'auction_completed',
        title: 'Your auction has ended successfully',
        message: 'Access your meeting to connect with the winner',
        data: {
          auctionId,
          winnerAddress,
          accessUrl: `${process.env.FRONTEND_URL}/meeting-access/${hostToken}`
        }
      }
    ];
    
    const insertQuery = `
      INSERT INTO notifications (user_address, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    for (const notification of notifications) {
      try {
        await pool.query(insertQuery, [
          notification.user_address,
          notification.type,
          notification.title,
          notification.message,
          JSON.stringify(notification.data)
        ]);
        
        console.log(`📢 Notification sent to ${notification.user_address} for ${notification.type}`);
      } catch (error) {
        console.error(`Failed to send notification to ${notification.user_address}:`, error);
      }
    }
  }
  
  async createAuction(hostAddress, twitterId, title, description, duration, reservePrice, meetingDuration) {
    try {
      // Get owner account (platform account)
      const accounts = await this.web3.eth.getAccounts();
      const ownerAccount = accounts[0];
      
      // Convert duration to blocks (assuming 12 second block time)
      const durationInBlocks = Math.floor(duration / 12);
      const reservePriceWei = this.web3.utils.toWei(reservePrice.toString(), 'ether');
      
      // Create IPFS metadata (simplified - in production use actual IPFS)
      const metadata = {
        title,
        description,
        meetingDuration,
        createdAt: Date.now()
      };
      const metadataIPFS = `ipfs_${Date.now()}`; // Placeholder
      
      // Call smart contract
      const tx = await this.contract.methods
        .createAuction(
          hostAddress,
          twitterId,
          durationInBlocks,
          reservePriceWei,
          metadataIPFS,
          meetingDuration
        )
        .send({ from: ownerAccount });
      
      // Get auction ID from transaction receipt
      const auctionId = tx.events.AuctionCreated.returnValues.auctionId;
      
      // Store in database
      const insertQuery = `
        INSERT INTO auctions (
          id, contract_address, host_address, twitter_id,
          title, description, metadata_ipfs, meeting_duration
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      
      await pool.query(insertQuery, [
        auctionId,
        process.env.AUCTION_CONTRACT_ADDRESS,
        hostAddress,
        twitterId,
        title,
        description,
        metadataIPFS,
        meetingDuration
      ]);
      
      return {
        auctionId,
        transactionHash: tx.transactionHash,
        blockNumber: tx.blockNumber
      };
      
    } catch (error) {
      console.error('Failed to create auction:', error);
      throw error;
    }
  }
}

let web3Service;

async function initializeWeb3Service(socketIO) {
  web3Service = new Web3Service();
  await web3Service.initialize(socketIO);
  return web3Service;
}

function getWeb3Service() {
  return web3Service;
}

module.exports = { initializeWeb3Service, getWeb3Service };
