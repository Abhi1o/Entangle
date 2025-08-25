import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated, isCreator } = useAuth();

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Meeting Auctions</h1>
          <p>Bid on exclusive time with industry experts and thought leaders</p>
          
          <div className="hero-actions">
            <Link to="/auctions" className="btn-primary">
              Browse Auctions
            </Link>
            {isAuthenticated && isCreator && (
              <Link to="/create" className="btn-secondary">
                Create Auction
              </Link>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="btn-secondary">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Create Auctions</h3>
            <p>Experts can auction their time and expertise to the highest bidder</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Place Bids</h3>
            <p>Bidders compete in real-time auctions with secure blockchain transactions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Meet & Connect</h3>
            <p>Winners get exclusive access to private meetings with the experts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
