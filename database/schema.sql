-- Users table
CREATE TABLE users (
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

-- Auctions table
CREATE TABLE auctions (
  id INTEGER PRIMARY KEY,
  contract_address VARCHAR(42) NOT NULL,
  host_address VARCHAR(42) NOT NULL,
  twitter_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata_ipfs VARCHAR(255),
  meeting_duration INTEGER DEFAULT 60,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_address) REFERENCES users(wallet_address)
);

-- Meetings table
CREATE TABLE meetings (
  id SERIAL PRIMARY KEY,
  auction_id INTEGER NOT NULL,
  zoom_meeting_id VARCHAR(255) NOT NULL,
  host_token TEXT NOT NULL,
  winner_token TEXT NOT NULL,
  actual_meeting_url TEXT NOT NULL,
  password VARCHAR(255) NOT NULL,
  scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auction_id) REFERENCES auctions(id)
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_address VARCHAR(42) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_twitter ON users(twitter_id);
CREATE INDEX idx_auctions_host ON auctions(host_address);
CREATE INDEX idx_notifications_user ON notifications(user_address);
CREATE INDEX idx_meetings_auction ON meetings(auction_id);
