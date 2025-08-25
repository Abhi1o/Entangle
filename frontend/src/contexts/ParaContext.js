import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ParaProvider, 
  useSignUpOrLogIn, 
  useVerifyNewAccount, 
  useWaitForLogin, 
  useWaitForWalletCreation,
  useVerifyOAuth,
  useLogout,
  useAccount,
  useWallet
} from '@getpara/react-sdk';

const ParaContext = createContext();

export const usePara = () => {
  const context = useContext(ParaContext);
  if (!context) {
    throw new Error('usePara must be used within a ParaProvider');
  }
  return context;
};

export const ParaProvider = ({ children }) => {
  const [authState, setAuthState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: account } = useAccount();
  const { data: wallet } = useWallet();

  useEffect(() => {
    if (account && wallet) {
      setIsAuthenticated(true);
      setUser({
        id: account.userId,
        walletAddress: wallet.address,
        walletType: wallet.type,
        email: account.auth?.email || null,
        twitterHandle: account.auth?.twitterUsername || null
      });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [account, wallet]);

  const value = {
    authState,
    setAuthState,
    isAuthenticated,
    user,
    loading,
    setLoading
  };

  return (
    <ParaContext.Provider value={value}>
      {children}
    </ParaContext.Provider>
  );
};

// Wrapper component to provide Para SDK
export const ParaSDKProvider = ({ children }) => {
  return (
    <ParaProvider
      partnerId={process.env.REACT_APP_PARA_PARTNER_ID || 'demo'}
      theme={{
        primaryColor: '#6366f1',
        backgroundColor: '#ffffff',
        textColor: '#1f2937'
      }}
    >
      <ParaProvider>
        {children}
      </ParaProvider>
    </ParaProvider>
  );
};
