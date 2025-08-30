import { useMemo, useEffect, useState } from 'react';
import { useAccount } from '@getpara/react-sdk';

export const useAuth = () => {
  const account = useAccount();
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Prevent hydration mismatch by only rendering after client-side hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  const isLoggedIn = useMemo(() => {
    if (!isHydrated) return false; // Return false during SSR
    return account.isConnected && account.embedded.wallets?.length && account.embedded.wallets.length > 0;
  }, [account.isConnected, account.embedded.wallets, isHydrated]);

  const walletAddress = useMemo(() => {
    if (!isHydrated) return null; // Return null during SSR
    return account.embedded.wallets?.[0]?.address;
  }, [account.embedded.wallets, isHydrated]);

  const userInfo = useMemo(() => {
    if (!isHydrated) return null; // Return null during SSR
    return account.embedded.userId;
  }, [account.embedded.userId, isHydrated]);

  const walletType = useMemo(() => {
    if (!isHydrated) return null; // Return null during SSR
    return account.embedded.wallets?.[0]?.type;
  }, [account.embedded.wallets, isHydrated]);

  return {
    isLoggedIn,
    walletAddress,
    userInfo,
    walletType,
    account,
    isHydrated
  };
};
