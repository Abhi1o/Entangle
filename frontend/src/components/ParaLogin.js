import React, { useState, useRef } from 'react';
import { 
  useSignUpOrLogIn, 
  useVerifyNewAccount, 
  useWaitForLogin, 
  useWaitForWalletCreation,
  useVerifyOAuth 
} from '@getpara/react-sdk';

const ParaLogin = ({ onSuccess, onError }) => {
  const [authType, setAuthType] = useState('email'); // 'email' or 'twitter'
  const [identifier, setIdentifier] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [popupWindow, setPopupWindow] = useState(null);
  
  const { signUpOrLogIn, isLoading: signUpLoading } = useSignUpOrLogIn();
  const { verifyNewAccount, isLoading: verifyLoading } = useVerifyNewAccount();
  const { waitForLogin, isLoading: loginLoading } = useWaitForLogin();
  const { waitForWalletCreation, isLoading: walletLoading } = useWaitForWalletCreation();
  const { verifyOAuth, isLoading: oauthLoading } = useVerifyOAuth();

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    
    try {
      const result = await signUpOrLogIn({
        auth: { email: identifier }
      });
      
      if (result.stage === 'verify') {
        setShowVerification(true);
      } else if (result.stage === 'login') {
        // User exists, need to login
        handleLogin(result);
      }
    } catch (error) {
      onError(error.message || 'Failed to sign up');
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    
    try {
      const result = await verifyNewAccount({
        verificationCode
      });
      
      if (result.stage === 'signup') {
        setShowSignup(true);
        // Handle signup flow
        handleSignup(result);
      }
    } catch (error) {
      onError(error.message || 'Invalid verification code');
    }
  };

  const handleLogin = async (authState) => {
    const { passkeyUrl, passwordUrl } = authState;
    
    // Open login URL in popup
    const loginUrl = passkeyUrl || passwordUrl;
    const popup = window.open(loginUrl, 'ParaLogin', 'width=500,height=600');
    setPopupWindow(popup);
    
    try {
      const result = await waitForLogin({
        isCanceled: () => popup?.closed || false
      });
      
      if (result.needsWallet) {
        // Create wallet for user
        await handleWalletCreation();
      } else {
        onSuccess();
      }
    } catch (error) {
      onError(error.message || 'Login failed');
    }
  };

  const handleSignup = async (authState) => {
    const { passkeyUrl, passwordUrl } = authState;
    
    // Open signup URL in popup
    const signupUrl = passkeyUrl || passwordUrl;
    const popup = window.open(signupUrl, 'ParaSignup', 'width=500,height=600');
    setPopupWindow(popup);
    
    try {
      const result = await waitForWalletCreation({
        isCanceled: () => popup?.closed || false
      });
      
      onSuccess();
    } catch (error) {
      onError(error.message || 'Signup failed');
    }
  };

  const handleWalletCreation = async () => {
    try {
      await waitForWalletCreation({
        isCanceled: () => popupWindow?.closed || false
      });
      
      onSuccess();
    } catch (error) {
      onError(error.message || 'Wallet creation failed');
    }
  };

  const handleTwitterLogin = async () => {
    try {
      const result = await verifyOAuth({
        method: 'x', // Twitter/X
        onOAuthPopup: (popup) => {
          setPopupWindow(popup);
        },
        isCanceled: () => popupWindow?.closed || false
      });
      
      if (result.stage === 'signup') {
        setShowSignup(true);
        handleSignup(result);
      } else if (result.stage === 'login') {
        handleLogin(result);
      }
    } catch (error) {
      onError(error.message || 'Twitter login failed');
    }
  };

  const isLoading = signUpLoading || verifyLoading || loginLoading || walletLoading || oauthLoading;

  return (
    <div className="para-login">
      <div className="auth-tabs">
        <button 
          className={`tab ${authType === 'email' ? 'active' : ''}`}
          onClick={() => setAuthType('email')}
        >
          Email
        </button>
        <button 
          className={`tab ${authType === 'twitter' ? 'active' : ''}`}
          onClick={() => setAuthType('twitter')}
        >
          Twitter
        </button>
      </div>

      {authType === 'email' && !showVerification && !showSignup && (
        <form onSubmit={handleEmailSignUp} className="email-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Processing...' : 'Continue with Email'}
          </button>
        </form>
      )}

      {authType === 'email' && showVerification && (
        <form onSubmit={handleVerification} className="verification-form">
          <div className="form-group">
            <label htmlFor="code">Verification Code</label>
            <input
              type="text"
              id="code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
            />
            <p className="help-text">
              We've sent a verification code to {identifier}
            </p>
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      )}

      {authType === 'twitter' && (
        <div className="twitter-login">
          <button 
            onClick={handleTwitterLogin} 
            disabled={isLoading}
            className="btn-twitter"
          >
            {isLoading ? 'Connecting...' : 'Continue with Twitter'}
          </button>
        </div>
      )}

      {showSignup && (
        <div className="signup-info">
          <p>Please complete the signup process in the popup window.</p>
          <p>If the popup didn't open, please check your browser's popup blocker.</p>
        </div>
      )}
    </div>
  );
};

export default ParaLogin;
