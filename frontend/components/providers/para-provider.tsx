'use client';

import React from 'react';
import { ParaProvider } from '@getpara/react-sdk';
import { Environment } from '@getpara/core-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthStateProvider } from '../../hooks/use-auth-state';

interface ParaProviderWrapperProps {
  children: React.ReactNode;
}

export function ParaProviderWrapper({ children }: ParaProviderWrapperProps) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          env: Environment.PROD,
          apiKey: process.env.NEXT_PUBLIC_PARA_APP_ID || 'your-para-app-id',
        }}
        config={{
          appName: 'Meeting Auction Platform',
        }}
      >
        <AuthStateProvider>
          {children}
        </AuthStateProvider>
      </ParaProvider>
    </QueryClientProvider>
  );
}
