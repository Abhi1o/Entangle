"use client";

import { useEffect, useState } from 'react';

interface HydrationSafeProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  ssr?: boolean; // Whether to render during SSR
}

export function HydrationSafe({ 
  children, 
  fallback = null, 
  ssr = false 
}: HydrationSafeProps) {
  const [isHydrated, setIsHydrated] = useState(ssr);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Specialized component for client-only content
export function ClientOnly({ children, fallback = null }: HydrationSafeProps) {
  return <HydrationSafe ssr={false} fallback={fallback}>{children}</HydrationSafe>;
}

// Component for content that should render during SSR but may have client-side differences
export function SSRCompatible({ children, fallback = null }: HydrationSafeProps) {
  return <HydrationSafe ssr={true} fallback={fallback}>{children}</HydrationSafe>;
}
