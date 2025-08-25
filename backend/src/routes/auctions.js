const express = require('express');
const { pool } = require('../config/database');
const { getWeb3Service } = require('../services/Web3Service');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create auction (creators only)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { title, description, duration, reservePrice, meetingDuration } = req.body;
    const { walletAddress, twitterId, role } = req.user;
    
    if (role !== 'creator') {
      return res.status(403).json({ error: 'Only creators can create auctions' });
    }
    
    if (!title || !duration || !reservePrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const web3Service = getWeb3Service();
    if (!web3Service) {
      return res.status(500).json({ error: 'Web3 service not available' });
    }
    
    // Create auction on blockchain
    const result = await web3Service.createAuction(
      walletAddress,
      twitterId,
      title,
      description || '',
      parseInt(duration) * 60, // Convert minutes to seconds
      parseFloat(reservePrice),
      parseInt(meetingDuration) || 60
    );
    
    res.json({
      success: true,
      auctionId: result.auctionId,
      transactionHash: result.transactionHash,
      blockNumber: result.blockNumber
    });
    
  } catch (error) {
    console.error('Create auction error:', error);
    res.status(500).json({ error: 'Failed to create auction' });
  }
});

// Get active auctions
router.get('/active', async (req, res) => {
  try {
    const web3Service = getWeb3Service();
    const activeAuctionIds = await web3Service.contract.methods.getActiveAuctions().call();
    
    const auctions = [];
    for (const auctionId of activeAuctionIds) {
      const contractAuction = await web3Service.contract.methods.getAuction(auctionId).call();
      const dbQuery = 'SELECT title, description FROM auctions WHERE id = $1';
      const dbResult = await pool.query(dbQuery, [auctionId]);
      
      auctions.push({
        id: auctionId,
        host: contractAuction.host,
        twitterId: contractAuction.hostTwitterId,
        title: dbResult.rows[0]?.title || 'Untitled Auction',
        description: dbResult.rows[0]?.description || '',
        reservePrice: web3Service.web3.utils.fromWei(contractAuction.reservePrice, 'ether'),
        highestBid: web3Service.web3.utils.fromWei(contractAuction.highestBid, 'ether'),
        highestBidder: contractAuction.highestBidder,
        endBlock: contractAuction.endBlock,
        ended: contractAuction.ended
      });
    }
    
    res.json({ success: true, auctions });
    
  } catch (error) {
    console.error('Get active auctions error:', error);
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

// Get auction details
router.get('/:auctionId', async (req, res) => {
  try {
    const { auctionId } = req.params;
    const web3Service = getWeb3Service();
    
    const contractAuction = await web3Service.contract.methods.getAuction(auctionId).call();
    const dbQuery = 'SELECT * FROM auctions WHERE id = $1';
    const dbResult = await pool.query(dbQuery, [auctionId]);
    
    if (dbResult.rows.length === 0) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    const auction = {
      ...dbResult.rows[0],
      reservePrice: web3Service.web3.utils.fromWei(contractAuction.reservePrice, 'ether'),
      highestBid: web3Service.web3.utils.fromWei(contractAuction.highestBid, 'ether'),
      highestBidder: contractAuction.highestBidder,
      startBlock: contractAuction.startBlock,
      endBlock: contractAuction.endBlock,
      ended: contractAuction.ended,
      meetingScheduled: contractAuction.meetingScheduled
    };
    
    res.json({ success: true, auction });
    
  } catch (error) {
    console.error('Get auction error:', error);
    res.status(500).json({ error: 'Failed to fetch auction' });
  }
});

// Get user's auctions (created by them)
router.get('/user/created', authenticateToken, async (req, res) => {
  try {
    const { walletAddress } = req.user;
    
    const query = `
      SELECT a.*, 
        CASE WHEN a.id IN (
          SELECT auction_id FROM meetings WHERE expires_at > NOW()
        ) THEN true ELSE false END as has_meeting
      FROM auctions a 
      WHERE a.host_address = $1 
      ORDER BY a.created_at DESC
    `;
    
    const result = await pool.query(query, [walletAddress]);
    res.json({ success: true, auctions: result.rows });
    
  } catch (error) {
    console.error('Get user auctions error:', error);
    res.status(500).json({ error: 'Failed to fetch user auctions' });
  }
});

module.exports = router;
