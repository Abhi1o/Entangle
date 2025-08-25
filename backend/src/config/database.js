const { Pool } = require('pg');
const redis = require('redis');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/meeting_auction',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

let redisClient = null;

// Only create Redis client if URL is properly configured
if (process.env.REDIS_URL && !process.env.REDIS_URL.includes('demo_mode') && !process.env.REDIS_URL.includes('YOUR_')) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL
  });
}

async function setupDatabase() {
  try {
    // Check if database URL is configured
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('demo_mode') || process.env.DATABASE_URL.includes('YOUR_')) {
      console.log('⚠️  Database not configured, running in demo mode');
      return;
    }
    
    await pool.connect();
    console.log('PostgreSQL connected');
    
    if (!redisClient) {
      console.log('⚠️  Redis not configured, running in demo mode');
      return;
    }
    
    await redisClient.connect();
    console.log('Redis connected');
    
    // Create tables
    await createTables();
  } catch (error) {
    console.error('Database setup failed:', error);
    console.log('⚠️  Running in demo mode without database');
  }
}

async function createTables() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      wallet_address VARCHAR(42) UNIQUE,
      twitter_id VARCHAR(255) UNIQUE,
      twitter_handle VARCHAR(255),
      para_wallet_id VARCHAR(255),
      email VARCHAR(255),
      profile_image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  const createAuctionsTable = `
    CREATE TABLE IF NOT EXISTS auctions (
      id INTEGER PRIMARY KEY,
      contract_address VARCHAR(42) NOT NULL,
      host_address VARCHAR(42) NOT NULL,
      twitter_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      metadata_ipfs VARCHAR(255),
      meeting_duration INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (host_address) REFERENCES users(wallet_address)
    );
  `;
  
  const createMeetingsTable = `
    CREATE TABLE IF NOT EXISTS meetings (
      id SERIAL PRIMARY KEY,
      auction_id INTEGER NOT NULL,
      zoom_meeting_id VARCHAR(255) NOT NULL,
      host_token TEXT NOT NULL,
      winner_token TEXT NOT NULL,
      actual_meeting_url TEXT NOT NULL,
      password VARCHAR(255) NOT NULL,
      scheduled_at TIMESTAMP,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (auction_id) REFERENCES auctions(id)
    );
  `;
  
  const createNotificationsTable = `
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_address VARCHAR(42) NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      data JSONB,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  const createFailedMeetingAttemptsTable = `
    CREATE TABLE IF NOT EXISTS failed_meeting_attempts (
      id SERIAL PRIMARY KEY,
      auction_id INTEGER NOT NULL,
      error_message TEXT NOT NULL,
      attempt_count INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(auction_id)
    );
  `;
  
  await pool.query(createUsersTable);
  await pool.query(createAuctionsTable);
  await pool.query(createMeetingsTable);
  await pool.query(createNotificationsTable);
  await pool.query(createFailedMeetingAttemptsTable);
  
  console.log('Database tables created/verified');
}

module.exports = { pool, redisClient, setupDatabase };
