import { useState, useEffect } from 'react';

export function useHydrationSafe<T>(initialValue: T, clientValue: T): T {
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    setValue(clientValue);
  }, [clientValue]);

  return isHydrated ? value : initialValue;
}

export function useClientOnly<T>(initialValue: T, clientValue: T): T {
  const [value, setValue] = useState<T>(initialValue);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setValue(clientValue);
  }, [clientValue]);

  return isClient ? value : initialValue;
}

// Hook for safely using Date objects
export function useSafeDate(): Date | null {
  const [date, setDate] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setDate(new Date());
  }, []);

  return isClient ? date : null;
}

// Hook for safely using Math.random()
export function useSafeRandom(): number | null {
  const [randomValue, setRandomValue] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setRandomValue(Math.random());
  }, []);

  return isClient ? randomValue : null;
}

