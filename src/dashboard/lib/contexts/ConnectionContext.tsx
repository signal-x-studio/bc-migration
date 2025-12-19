'use client';

import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import type { WCCredentials, StoreInfo, ConnectionState, ConnectResponse } from '../types';
import { saveCredentials, loadCredentials, clearCredentials, getRememberMe, setRememberMe } from '../storage';

// ============================================
// State & Actions
// ============================================

type ConnectionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTED'; payload: { credentials: WCCredentials; storeInfo: StoreInfo } }
  | { type: 'DISCONNECT' }
  | { type: 'RESTORE_CREDENTIALS'; payload: WCCredentials };

const initialState: ConnectionState = {
  credentials: null,
  isConnected: false,
  storeInfo: null,
  isLoading: false,
  error: null,
};

function connectionReducer(state: ConnectionState, action: ConnectionAction): ConnectionState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_CONNECTED':
      return {
        ...state,
        credentials: action.payload.credentials,
        storeInfo: action.payload.storeInfo,
        isConnected: true,
        isLoading: false,
        error: null,
      };
    case 'DISCONNECT':
      return { ...initialState };
    case 'RESTORE_CREDENTIALS':
      return { ...state, credentials: action.payload };
    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

interface ConnectionContextValue extends ConnectionState {
  connect: (credentials: WCCredentials, remember?: boolean) => Promise<boolean>;
  disconnect: () => void;
  testConnection: (credentials: WCCredentials) => Promise<ConnectResponse>;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
}

const ConnectionContext = createContext<ConnectionContextValue | null>(null);

// ============================================
// Provider
// ============================================

interface ConnectionProviderProps {
  children: ReactNode;
}

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [state, dispatch] = useReducer(connectionReducer, initialState);

  // Restore credentials from localStorage on mount
  useEffect(() => {
    const savedCredentials = loadCredentials();
    if (savedCredentials && getRememberMe()) {
      dispatch({ type: 'RESTORE_CREDENTIALS', payload: savedCredentials });
      // Auto-reconnect with saved credentials
      reconnect(savedCredentials);
    }
  }, []);

  const reconnect = async (credentials: WCCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await testConnectionAPI(credentials);
      if (response.success && response.storeInfo) {
        dispatch({
          type: 'SET_CONNECTED',
          payload: { credentials, storeInfo: response.storeInfo },
        });
      } else {
        // Credentials invalid, clear them
        clearCredentials();
        dispatch({ type: 'DISCONNECT' });
      }
    } catch (error) {
      clearCredentials();
      dispatch({ type: 'DISCONNECT' });
    }
  };

  const testConnection = useCallback(async (credentials: WCCredentials): Promise<ConnectResponse> => {
    return testConnectionAPI(credentials);
  }, []);

  const connect = useCallback(async (credentials: WCCredentials, remember = true): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await testConnectionAPI(credentials);

      if (response.success && response.storeInfo) {
        dispatch({
          type: 'SET_CONNECTED',
          payload: { credentials, storeInfo: response.storeInfo },
        });

        if (remember) {
          saveCredentials(credentials);
          setRememberMe(true);
        }

        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Connection failed' });
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    clearCredentials();
    dispatch({ type: 'DISCONNECT' });
  }, []);

  const handleSetRememberMe = useCallback((remember: boolean) => {
    setRememberMe(remember);
    if (!remember && state.credentials) {
      clearCredentials();
    }
  }, [state.credentials]);

  const value: ConnectionContextValue = {
    ...state,
    connect,
    disconnect,
    testConnection,
    rememberMe: getRememberMe(),
    setRememberMe: handleSetRememberMe,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}

// ============================================
// API Helper
// ============================================

async function testConnectionAPI(credentials: WCCredentials): Promise<ConnectResponse> {
  const response = await fetch('/api/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Connection failed' }));
    return { success: false, error: error.error || 'Connection failed' };
  }

  return response.json();
}
