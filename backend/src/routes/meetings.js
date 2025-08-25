const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { getWeb3Service } = require('../services/Web3Service');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Meeting access endpoint
router.get('/access/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { auctionId, userId, role, meetingId } = decoded;
    
    // Verify blockchain state
    const web3Service = getWeb3Service();
    const contractAuction = await web3Service.contract.methods.getAuction(auctionId).call();
    
    // Check authorization
    const isAuthorized = (
      (role === 'host' && userId.toLowerCase() === contractAuction.host.toLowerCase()) ||
      (role === 'participant' && userId.toLowerCase() === contractAuction.highestBidder.toLowerCase())
    );
    
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    if (!contractAuction.ended) {
      return res.status(400).json({ error: 'Auction not yet ended' });
    }
    
    // Get meeting details
    const meetingQuery = 'SELECT * FROM meetings WHERE auction_id = $1';
    const meetingResult = await pool.query(meetingQuery, [auctionId]);
    
    if (meetingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    const meeting = meetingResult.rows[0];
    
    // Generate single-use redirect token
    const redirectToken = jwt.sign({
      meetingUrl: meeting.actual_meeting_url,
      password: meeting.password,
      userId,
      role,
      auctionId,
      timestamp: Date.now()
    }, process.env.JWT_SECRET, { expiresIn: '5m' });
    
    // Create redirect URL
    const redirectUrl = `${process.env.FRONTEND_URL}/join-meeting/${redirectToken}`;
    
    res.json({
      success: true,
      redirectUrl,
      role,
      auctionId,
      expiresIn: '5 minutes'
    });
    
  } catch (error) {
    console.error('Meeting access error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid or expired access token' });
    }
    res.status(500).json({ error: 'Failed to access meeting' });
  }
});

// Final meeting join endpoint
router.get('/join/:redirectToken', async (req, res) => {
  try {
    const { redirectToken } = req.params;
    
    // Verify single-use token
    const decoded = jwt.verify(redirectToken, process.env.JWT_SECRET);
    const { meetingUrl, password, userId, role, auctionId } = decoded;
    
    // Mark token as used (store in Redis with short expiry)
    const { redisClient } = require('../config/database');
    const tokenKey = `used_token:${redirectToken}`;
    
    // Check if already used
    const alreadyUsed = await redisClient.get(tokenKey);
    if (alreadyUsed) {
      return res.status(401).json({ error: 'Meeting access already used' });
    }
    
    // Mark as used
    await redisClient.setEx(tokenKey, 300, 'used'); // 5 minutes expiry
    
    // Return meeting information
    res.json({
      success: true,
      meeting: {
        url: meetingUrl,
        password,
        role,
        auctionId,
        instructions: role === 'host' ? 
          'You are the meeting host. The auction winner is waiting to join.' :
          'You won this auction! The host will approve your entry from the waiting room.'
      }
    });
    
  } catch (error) {
    console.error('Join meeting error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Meeting access expired or invalid' });
    }
    res.status(500).json({ error: 'Failed to join meeting' });
  }
});

// Get user notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const { walletAddress } = req.user;
    
    const query = `
      SELECT * FROM notifications 
      WHERE user_address = $1 
      ORDER BY created_at DESC 
      LIMIT 20
    `;
    
    const result = await pool.query(query, [walletAddress]);
    res.json({ success: true, notifications: result.rows });
    
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { walletAddress } = req.user;
    
    const query = `
      UPDATE notifications 
      SET read = true 
      WHERE id = $1 AND user_address = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, walletAddress]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ success: true, notification: result.rows[0] });
    
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

module.exports = router;
