import { useMemo } from 'react';
import { useAccount } from '@getpara/react-sdk';

export const useAuth = () => {
  const account = useAccount();
  
  const isLoggedIn = useMemo(() => 
    account.isConnected && account.embedded.wallets?.length && account.embedded.wallets.length > 0,
    [account.isConnected, account.embedded.wallets]
  );

  const walletAddress = useMemo(() => 
    account.embedded.wallets?.[0]?.address,
    [account.embedded.wallets]
  );

  const userInfo = useMemo(() => 
    account.embedded.userId,
    [account.embedded.userId]
  );

  const walletType = useMemo(() => 
    account.embedded.wallets?.[0]?.type,
    [account.embedded.wallets]
  );

  return {
    isLoggedIn,
    walletAddress,
    userInfo,
    walletType,
    account
  };
};
