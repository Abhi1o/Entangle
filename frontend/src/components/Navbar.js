import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected, account, disconnect } = useWeb3();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    disconnect();
    navigate('/');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">⏰</span>
          Meeting Auctions
        </Link>

        <div className="nav-links">
          <Link to="/auctions" className="nav-link">
            Browse Auctions
          </Link>
          
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              
              {user?.role === 'creator' && (
                <Link to="/create" className="nav-link">
                  Create Auction
                </Link>
              )}
            </>
          )}
        </div>

        <div className="nav-auth">
          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-info">
                {user.twitterHandle && (
                  <span className="twitter-handle">@{user.twitterHandle}</span>
                )}
                {user.walletAddress && (
                  <span className="wallet-address">
                    {formatAddress(user.walletAddress)}
                  </span>
                )}
                <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                  {isConnected ? '🟢' : '🔴'}
                </span>
              </div>
              
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
