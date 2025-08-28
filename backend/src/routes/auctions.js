const express = require('express');
const router = express.Router();
const Web3Service = require('../services/Web3Service');

// Initialize Web3 service
const web3Service = new Web3Service('FUJI');

// Get all active auctions
router.get('/active', async (req, res) => {
  try {
    const activeAuctions = await web3Service.getActiveAuctions();
    
    // Get details for each auction
    const auctionsWithDetails = await Promise.all(
      activeAuctions.map(async (auctionId) => {
        try {
          return await web3Service.getAuction(auctionId);
        } catch (error) {
          console.error(`Failed to get details for auction ${auctionId}:`, error);
          return { id: auctionId, error: 'Failed to load details' };
        }
      })
    );
    
    res.json({
      success: true,
      data: auctionsWithDetails,
      count: activeAuctions.length
    });
    
  } catch (error) {
    console.error('Error fetching active auctions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active auctions'
    });
  }
});

// Get specific auction details
router.get('/:auctionId', async (req, res) => {
  try {
    const { auctionId } = req.params;
    const auction = await web3Service.getAuction(parseInt(auctionId));
    
    res.json({
      success: true,
      data: auction
    });
    
  } catch (error) {
    console.error(`Error fetching auction ${req.params.auctionId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch auction details'
    });
  }
});

// Create new auction (requires authentication)
router.post('/create', async (req, res) => {
  try {
    const {
      host,
      twitterId,
      duration,
      reservePrice,
      metadataIPFS,
      meetingDuration
    } = req.body;
    
    // Validate required fields
    if (!host || !twitterId || !duration || !reservePrice || !meetingDuration) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Create auction
    const result = await web3Service.createAuction(
      host,
      twitterId,
      parseInt(duration),
      parseFloat(reservePrice),
      metadataIPFS || `ipfs_${Date.now()}`,
      parseInt(meetingDuration)
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: 'Auction created successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create auction'
    });
  }
});

// Get contract statistics
router.get('/stats/contract', async (req, res) => {
  try {
    const stats = await web3Service.getContractStats();
    const balance = await web3Service.getBalance();
    
    res.json({
      success: true,
      data: {
        ...stats,
        walletBalance: balance,
        network: web3Service.getNetworkConfig()
      }
    });
    
  } catch (error) {
    console.error('Error fetching contract stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contract statistics'
    });
  }
});

// Schedule meeting for auction (requires authentication)
router.post('/:auctionId/schedule-meeting', async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { meetingAccessHash } = req.body;
    
    if (!meetingAccessHash) {
      return res.status(400).json({
        success: false,
        error: 'Meeting access hash is required'
      });
    }
    
    const result = await web3Service.scheduleMeeting(
      parseInt(auctionId),
      meetingAccessHash
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: 'Meeting scheduled successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error(`Error scheduling meeting for auction ${req.params.auctionId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule meeting'
    });
  }
});

// Get wallet balance
router.get('/wallet/balance', async (req, res) => {
  try {
    const balance = await web3Service.getBalance();
    
    res.json({
      success: true,
      data: {
        balance,
        currency: 'AVAX',
        network: web3Service.getNetworkConfig()
      }
    });
    
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet balance'
    });
  }
});

module.exports = router;
