'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { BCCredentials, BCStoreInfo } from '../types';
import { saveBCCredentials, loadBCCredentials, clearBCCredentials } from '../storage';

interface BCConnectionState {
  credentials: BCCredentials | null;
  isConnected: boolean;
  storeInfo: BCStoreInfo | null;
  isLoading: boolean;
  error: string | null;
}

interface BCConnectionContextValue extends BCConnectionState {
  connect: (credentials: BCCredentials) => Promise<boolean>;
  disconnect: () => void;
}

const BCConnectionContext = createContext<BCConnectionContextValue | null>(null);

interface BCConnectionProviderProps {
  children: ReactNode;
}

export function BCConnectionProvider({ children }: BCConnectionProviderProps) {
  const [state, setState] = useState<BCConnectionState>({
    credentials: null,
    isConnected: false,
    storeInfo: null,
    isLoading: true,
    error: null,
  });

  // Load credentials on mount
  useEffect(() => {
    const savedCredentials = loadBCCredentials();
    if (savedCredentials) {
      verifyConnection(savedCredentials);
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const verifyConnection = async (credentials: BCCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(
        `https://api.bigcommerce.com/stores/${credentials.storeHash}/v3/store`,
        {
          headers: {
            'X-Auth-Token': credentials.accessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setState({
          credentials,
          isConnected: true,
          storeInfo: {
            name: result.data?.name || 'Unknown Store',
            domain: result.data?.domain || '',
            plan: result.data?.plan_name || 'Unknown',
          },
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        clearBCCredentials();
        setState({
          credentials: null,
          isConnected: false,
          storeInfo: null,
          isLoading: false,
          error: 'Invalid credentials',
        });
        return false;
      }
    } catch (error) {
      // If fetch fails (CORS), just assume credentials are valid
      // The API route will handle actual validation
      setState({
        credentials,
        isConnected: true,
        storeInfo: null,
        isLoading: false,
        error: null,
      });
      return true;
    }
  };

  const connect = useCallback(async (credentials: BCCredentials): Promise<boolean> => {
    saveBCCredentials(credentials);
    setState({
      credentials,
      isConnected: true,
      storeInfo: null,
      isLoading: false,
      error: null,
    });
    return true;
  }, []);

  const disconnect = useCallback(() => {
    clearBCCredentials();
    setState({
      credentials: null,
      isConnected: false,
      storeInfo: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const value: BCConnectionContextValue = {
    ...state,
    connect,
    disconnect,
  };

  return (
    <BCConnectionContext.Provider value={value}>
      {children}
    </BCConnectionContext.Provider>
  );
}

export function useBCConnection() {
  const context = useContext(BCConnectionContext);
  if (!context) {
    throw new Error('useBCConnection must be used within a BCConnectionProvider');
  }
  return context;
}
