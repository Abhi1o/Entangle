import React, { useState, useEffect } from 'react';
import { MeetingAuctionService } from '@/lib/contract';

export const useMeetingAuction = (network: 'FUJI' | 'AVALANCHE' = 'FUJI') => {
  const [service, setService] = useState<MeetingAuctionService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initService = async () => {
      try {
        const newService = new MeetingAuctionService(network);
        const initialized = await newService.initialize();
        setService(newService);
        setIsInitialized(initialized);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize contract service');
        setIsInitialized(false);
      }
    };

    initService();
  }, [network]);

  return { service, isInitialized, error };
};
