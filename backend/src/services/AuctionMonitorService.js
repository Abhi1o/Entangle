const cron = require('node-cron');
const { pool } = require('../config/database');
const { getWeb3Service } = require('./Web3Service');
const { createSecureMeeting } = require('./ZoomService');
const jwt = require('jsonwebtoken');

class AuctionMonitorService {
  constructor() {
    this.web3Service = null;
    this.io = null;
    this.isRunning = false;
  }

  async initialize(socketIO) {
    this.io = socketIO;
    this.web3Service = getWeb3Service();
    
    if (!this.web3Service) {
      console.log('⚠️  Web3Service not available, auction monitoring disabled');
      return;
    }

    // Start monitoring every 2 minutes
    this.startMonitoring();
    console.log('AuctionMonitorService initialized');
  }

  startMonitoring() {
    if (this.isRunning) {
      console.log('Auction monitoring already running');
      return;
    }

    // Run every 2 minutes
    cron.schedule('*/2 * * * *', async () => {
      await this.checkEndedAuctions();
    });

    // Also run every 30 seconds for critical auctions (last 10 minutes)
    cron.schedule('*/30 * * * * *', async () => {
      await this.checkCriticalAuctions();
    });

    this.isRunning = true;
    console.log('Auction monitoring started');
  }

  async checkEndedAuctions() {
    try {
      console.log('🔍 Checking for ended auctions...');
      
      // Get all active auctions from database
      const query = `
        SELECT a.*, 
               CASE WHEN m.id IS NOT NULL THEN true ELSE false END as meeting_created
        FROM auctions a 
        LEFT JOIN meetings m ON a.id = m.auction_id
        WHERE a.id NOT IN (
          SELECT DISTINCT auction_id FROM meetings WHERE auction_id IS NOT NULL
        )
      `;
      
      const result = await pool.query(query);
      const auctions = result.rows;
      
      for (const auction of auctions) {
        await this.checkAuctionStatus(auction);
      }
      
    } catch (error) {
      console.error('Error checking ended auctions:', error);
    }
  }

  async checkCriticalAuctions() {
    try {
      // Check auctions that should end in the next 10 minutes
      const currentBlock = await this.web3Service.web3.eth.getBlockNumber();
      const criticalBlock = currentBlock + 50; // ~10 minutes (50 blocks)
      
      const query = `
        SELECT a.* 
        FROM auctions a 
        WHERE a.id NOT IN (
          SELECT DISTINCT auction_id FROM meetings WHERE auction_id IS NOT NULL
        )
      `;
      
      const result = await pool.query(query);
      const auctions = result.rows;
      
      for (const auction of auctions) {
        try {
          const contractAuction = await this.web3Service.contract.methods.getAuction(auction.id).call();
          
          // If auction is ending soon, check more frequently
          if (parseInt(contractAuction.endBlock) <= criticalBlock && !contractAuction.ended) {
            console.log(`⚠️  Critical auction ${auction.id} ending soon at block ${contractAuction.endBlock}`);
            await this.checkAuctionStatus(auction);
          }
        } catch (error) {
          console.error(`Error checking critical auction ${auction.id}:`, error);
        }
      }
      
    } catch (error) {
      console.error('Error checking critical auctions:', error);
    }
  }

  async checkAuctionStatus(auction) {
    try {
      const contractAuction = await this.web3Service.contract.methods.getAuction(auction.id).call();
      
      // Check if auction has ended
      if (contractAuction.ended && contractAuction.highestBidder !== '0x0000000000000000000000000000000000000000') {
        console.log(`🎯 Auction ${auction.id} has ended, creating meeting...`);
        
        // Check if meeting already exists
        const meetingQuery = 'SELECT id FROM meetings WHERE auction_id = $1';
        const meetingResult = await pool.query(meetingQuery, [auction.id]);
        
        if (meetingResult.rows.length === 0) {
          await this.createMeetingForAuction(
            auction.id,
            contractAuction.highestBidder,
            contractAuction.host,
            contractAuction.highestBid
          );
        }
      }
      
    } catch (error) {
      console.error(`Error checking auction ${auction.id}:`, error);
    }
  }

  async createMeetingForAuction(auctionId, winnerAddress, hostAddress, winningBid) {
    try {
      console.log(`📅 Creating meeting for auction ${auctionId}`);
      
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
      
      // Update smart contract if possible
      try {
        const accounts = await this.web3Service.web3.eth.getAccounts();
        await this.web3Service.contract.methods
          .scheduleMeeting(auctionId, `meeting_${meeting.id}`)
          .send({ from: accounts[0] });
      } catch (error) {
        console.warn(`Could not update smart contract for auction ${auctionId}:`, error.message);
      }
      
      // Broadcast to connected clients
      if (this.io) {
        this.io.emit('meeting-created', {
          auctionId,
          winner: winnerAddress,
          host: hostAddress,
          winningBid: this.web3Service.web3.utils.fromWei(winningBid, 'ether'),
          meetingId: meeting.id
        });
      }
      
      console.log(`✅ Meeting created for auction ${auctionId}`);
      
    } catch (error) {
      console.error(`❌ Failed to create meeting for auction ${auctionId}:`, error);
      
      // Store failed attempt for retry
      await this.storeFailedMeetingAttempt(auctionId, error.message);
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

  async storeFailedMeetingAttempt(auctionId, errorMessage) {
    try {
      const insertQuery = `
        INSERT INTO failed_meeting_attempts (auction_id, error_message, attempt_count, created_at)
        VALUES ($1, $2, 1, NOW())
        ON CONFLICT (auction_id) 
        DO UPDATE SET 
          error_message = EXCLUDED.error_message,
          attempt_count = failed_meeting_attempts.attempt_count + 1,
          updated_at = NOW()
      `;
      
      await pool.query(insertQuery, [auctionId, errorMessage]);
    } catch (error) {
      console.error('Failed to store failed meeting attempt:', error);
    }
  }

  async retryFailedMeetings() {
    try {
      const query = `
        SELECT * FROM failed_meeting_attempts 
        WHERE attempt_count < 5 
        AND updated_at < NOW() - INTERVAL '5 minutes'
        ORDER BY updated_at ASC
      `;
      
      const result = await pool.query(query);
      const failedAttempts = result.rows;
      
      for (const attempt of failedAttempts) {
        console.log(`🔄 Retrying meeting creation for auction ${attempt.auction_id}`);
        await this.checkAuctionStatus({ id: attempt.auction_id });
      }
      
    } catch (error) {
      console.error('Error retrying failed meetings:', error);
    }
  }
}

let auctionMonitorService;

async function initializeAuctionMonitorService(socketIO) {
  auctionMonitorService = new AuctionMonitorService();
  await auctionMonitorService.initialize(socketIO);
  return auctionMonitorService;
}

function getAuctionMonitorService() {
  return auctionMonitorService;
}

module.exports = { initializeAuctionMonitorService, getAuctionMonitorService };
