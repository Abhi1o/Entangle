import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { usePara } from '../contexts/ParaContext';
import ParaLogin from '../components/ParaLogin';

const Login = () => {
  const [activeTab, setActiveTab] = useState('creator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { loginWithWallet } = useAuth();
  const { connect, account, signMessage } = useWeb3();
  const { user: paraUser, isAuthenticated: paraAuthenticated } = usePara();
  const navigate = useNavigate();

  const handleWalletLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Connect wallet first
      const connectResult = await connect();
      if (!connectResult.success) {
        setError(connectResult.error);
        return;
      }

      // Create sign message
      const message = `Sign this message to login to Meeting Auction Platform.\n\nTimestamp: ${Date.now()}`;
      
      // Sign message
      const signature = await signMessage(message);
      
      // Login with backend
      const loginResult = await loginWithWallet(account, signature, message);
      
      if (loginResult.success) {
        navigate('/auctions');
      } else {
        setError(loginResult.error);
      }
      
    } catch (error) {
      setError(error.message || 'Failed to login with wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleParaSuccess = async () => {
    if (paraUser && paraAuthenticated) {
      try {
        // Login with backend using Para wallet
        const loginResult = await loginWithWallet(
          paraUser.walletAddress, 
          'para_signature', // Para handles signature internally
          'Para wallet authentication'
        );
        
        if (loginResult.success) {
          navigate('/auctions');
        } else {
          setError(loginResult.error);
        }
      } catch (error) {
        setError(error.message || 'Failed to login with Para wallet');
      }
    }
  };

  const handleParaError = (error) => {
    setError(error);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Login to Meeting Auctions</h1>
        <p>Choose your login method below</p>

        <div className="login-tabs">
          <button 
            className={`tab ${activeTab === 'creator' ? 'active' : ''}`}
            onClick={() => setActiveTab('creator')}
          >
            I'm a Creator
          </button>
          <button 
            className={`tab ${activeTab === 'bidder' ? 'active' : ''}`}
            onClick={() => setActiveTab('bidder')}
          >
            I'm a Bidder
          </button>
        </div>

        <div className="login-content">
          {activeTab === 'creator' ? (
            <div className="creator-login">
              <h3>Login with Para Wallet + Twitter</h3>
              <p>Create auctions for your time using social authentication</p>
              <div className="para-wallet-login">
                <ParaLogin 
                  onSuccess={handleParaSuccess}
                  onError={handleParaError}
                />
              </div>
            </div>
          ) : (
            <div className="bidder-login">
              <h3>Login with Wallet</h3>
              <p>Connect your wallet to bid on auctions and participate</p>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <button 
                onClick={handleWalletLogin}
                disabled={loading}
                className="wallet-login-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Connecting...
                  </>
                ) : (
                  <>
                    <span className="wallet-icon">👛</span>
                    Connect Wallet
                  </>
                )}
              </button>
              
              <div className="wallet-info">
                <p>Supports MetaMask, WalletConnect, and other Web3 wallets</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
