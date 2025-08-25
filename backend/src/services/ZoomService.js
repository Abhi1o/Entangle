const axios = require('axios');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class ZoomService {
  constructor() {
    this.apiKey = process.env.ZOOM_API_KEY;
    this.apiSecret = process.env.ZOOM_API_SECRET;
    this.baseURL = 'https://api.zoom.us/v2';
    this.accessToken = null;
    this.tokenExpiry = null;
  }
  
  async initialize() {
    // Check if Zoom is configured
    if (!this.apiKey || this.apiKey.includes('your-') || this.apiKey.includes('demo-')) {
      console.log('⚠️  Zoom not configured, running in demo mode');
      return;
    }
    
    try {
      await this.generateAccessToken();
      console.log('ZoomService initialized');
    } catch (error) {
      console.error('ZoomService initialization failed:', error);
      console.log('⚠️  Running in demo mode without Zoom');
    }
  }
  
  async generateAccessToken() {
    try {
      const payload = {
        iss: this.apiKey,
        exp: Date.now() + 60 * 60 * 1000 // 1 hour
      };
      
      const token = jwt.sign(payload, this.apiSecret, { algorithm: 'HS256' });
      this.accessToken = token;
      this.tokenExpiry = Date.now() + 50 * 60 * 1000; // 50 minutes (buffer)
      
    } catch (error) {
      console.error('Failed to generate Zoom access token:', error);
      throw error;
    }
  }
  
  async ensureValidToken() {
    if (!this.accessToken || Date.now() > this.tokenExpiry) {
      await this.generateAccessToken();
    }
  }
  
  async createSecureMeeting(params) {
    await this.ensureValidToken();
    
    const meetingData = {
      topic: params.topic,
      type: 2, // Scheduled meeting
      duration: params.duration || 60,
      start_time: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      settings: {
        waiting_room: true,
        join_before_host: false,
        approval_type: 2, // Manual approval required
        registration_type: 1, // Attendees register once
        password: this.generateSecurePassword(),
        mute_upon_entry: true,
        auto_recording: 'none',
        allow_multiple_devices: false,
        participant_video: false,
        host_video: true
      }
    };
    
    try {
      const response = await axios.post(
        `${this.baseURL}/users/me/meetings`,
        meetingData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const meeting = response.data;
      
      return {
        id: meeting.id,
        join_url: meeting.join_url,
        password: meeting.password,
        start_url: meeting.start_url,
        auctionId: params.auctionId
      };
      
    } catch (error) {
      console.error('Failed to create Zoom meeting:', error);
      throw error;
    }
  }
  
  generateSecurePassword(length = 12) {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
  
  async deleteMeeting(meetingId) {
    try {
      await this.ensureValidToken();
      
      await axios.delete(
        `${this.baseURL}/meetings/${meetingId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Failed to delete Zoom meeting:', error);
      return false;
    }
  }
}

let zoomService;

async function initializeZoomService() {
  zoomService = new ZoomService();
  await zoomService.initialize();
  return zoomService;
}

async function createSecureMeeting(params) {
  if (!zoomService) {
    throw new Error('ZoomService not initialized');
  }
  return await zoomService.createSecureMeeting(params);
}

module.exports = { initializeZoomService, createSecureMeeting };
