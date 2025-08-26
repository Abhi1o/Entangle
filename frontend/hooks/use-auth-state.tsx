'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthState } from '@getpara/react-sdk';

interface AuthStateContextType {
  authState: AuthState | undefined;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState | undefined>>;
}

const AuthStateContext = createContext<AuthStateContextType>({
  authState: undefined,
  setAuthState: () => {},
});

interface AuthStateProviderProps {
  children: ReactNode;
}

export function AuthStateProvider({ children }: AuthStateProviderProps) {
  const [authState, setAuthState] = useState<AuthState | undefined>();

  return (
    <AuthStateContext.Provider value={{ authState, setAuthState }}>
      {children}
    </AuthStateContext.Provider>
  );
}

export const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used within an AuthStateProvider');
  }
  return context;
};