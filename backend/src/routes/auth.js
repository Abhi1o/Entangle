const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { getWeb3Service } = require('../services/Web3Service');

const router = express.Router();

// Para wallet Twitter authentication for auction creators
router.post('/para-twitter', async (req, res) => {
  try {
    const { paraAccessToken, twitterCode } = req.body;
    
    // Verify Para wallet token
    const paraResponse = await axios.get('https://api.getpara.com/v1/user', {
      headers: { Authorization: `Bearer ${paraAccessToken}` }
    });
    
    if (!paraResponse.data.success) {
      return res.status(401).json({ error: 'Invalid Para wallet token' });
    }
    
    // Exchange Twitter code for user info
    const twitterResponse = await axios.post('https://api.twitter.com/2/oauth2/token', {
      code: twitterCode,
      grant_type: 'authorization_code',
      client_id: process.env.TWITTER_CLIENT_ID,
      redirect_uri: process.env.TWITTER_REDIRECT_URI,
      code_verifier: req.body.codeVerifier
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`
      }
    });
    
    const twitterAccessToken = twitterResponse.data.access_token;
    
    // Get Twitter user info
    const twitterUserResponse = await axios.get('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${twitterAccessToken}` }
    });
    
    const twitterUser = twitterUserResponse.data.data;
    const paraUser = paraResponse.data.user;
    
    // Create or update user in database
    const userQuery = `
      INSERT INTO users (
        wallet_address, twitter_id, twitter_handle, para_wallet_id,
        email, profile_image
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (twitter_id) 
      DO UPDATE SET 
        wallet_address = EXCLUDED.wallet_address,
        para_wallet_id = EXCLUDED.para_wallet_id,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const userResult = await pool.query(userQuery, [
      paraUser.walletAddress,
      twitterUser.id,
      twitterUser.username,
      paraUser.id,
      paraUser.email || null,
      twitterUser.profile_image_url || null
    ]);
    
    const user = userResult.rows[0];
    
    // Generate JWT token
    const token = jwt.sign({
      userId: user.id,
      walletAddress: user.wallet_address,
      twitterId: user.twitter_id,
      twitterHandle: user.twitter_handle,
      role: 'creator'
    }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        twitterHandle: user.twitter_handle,
        profileImage: user.profile_image,
        role: 'creator'
      }
    });
    
  } catch (error) {
    console.error('Para Twitter auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Wallet authentication for bidders
router.post('/wallet', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;
    
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify wallet signature
    const web3Service = getWeb3Service();
    if (!web3Service) {
      return res.status(500).json({ error: 'Web3 service not available' });
    }
    
    const recoveredAddress = web3Service.web3.eth.accounts.recover(message, signature);
    
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Create or update user
    const userQuery = `
      INSERT INTO users (wallet_address)
      VALUES ($1)
      ON CONFLICT (wallet_address)
      DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const userResult = await pool.query(userQuery, [walletAddress.toLowerCase()]);
    const user = userResult.rows[0];
    
    // Generate JWT token
    const token = jwt.sign({
      userId: user.id,
      walletAddress: user.wallet_address,
      role: 'bidder'
    }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        role: 'bidder'
      }
    });
    
  } catch (error) {
    console.error('Wallet auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Verify token
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
