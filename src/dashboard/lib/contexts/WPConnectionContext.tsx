'use client';

import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { saveWPSiteUrl, loadWPSiteUrl, clearWPSiteUrl, getWPRememberMe, setWPRememberMe } from '../storage';

// ============================================
// Types
// ============================================

export interface WPSiteInfo {
  name: string;
  description: string;
  url: string;
  home: string;
  gmt_offset: number;
  timezone_string: string;
}

interface WPConnectionState {
  siteUrl: string | null;
  isConnected: boolean;
  siteInfo: WPSiteInfo | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// State & Actions
// ============================================

type WPConnectionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTED'; payload: { siteUrl: string; siteInfo: WPSiteInfo } }
  | { type: 'DISCONNECT' }
  | { type: 'RESTORE_URL'; payload: string };

const initialState: WPConnectionState = {
  siteUrl: null,
  isConnected: false,
  siteInfo: null,
  isLoading: false,
  error: null,
};

function wpConnectionReducer(state: WPConnectionState, action: WPConnectionAction): WPConnectionState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_CONNECTED':
      return {
        ...state,
        siteUrl: action.payload.siteUrl,
        siteInfo: action.payload.siteInfo,
        isConnected: true,
        isLoading: false,
        error: null,
      };
    case 'DISCONNECT':
      return { ...initialState };
    case 'RESTORE_URL':
      return { ...state, siteUrl: action.payload };
    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

interface WPConnectionContextValue extends WPConnectionState {
  connect: (url: string, remember?: boolean) => Promise<boolean>;
  disconnect: () => void;
  testConnection: (url: string) => Promise<{ success: boolean; siteInfo?: WPSiteInfo; error?: string }>;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
}

const WPConnectionContext = createContext<WPConnectionContextValue | null>(null);

// ============================================
// Provider
// ============================================

interface WPConnectionProviderProps {
  children: ReactNode;
}

export function WPConnectionProvider({ children }: WPConnectionProviderProps) {
  const [state, dispatch] = useReducer(wpConnectionReducer, initialState);

  // Restore saved URL on mount
  useEffect(() => {
    const savedUrl = loadWPSiteUrl();
    if (savedUrl && getWPRememberMe()) {
      dispatch({ type: 'RESTORE_URL', payload: savedUrl });
      // Auto-reconnect with saved URL
      reconnect(savedUrl);
    }
  }, []);

  const reconnect = async (url: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await testConnectionAPI(url);
      if (response.success && response.siteInfo) {
        dispatch({
          type: 'SET_CONNECTED',
          payload: { siteUrl: url, siteInfo: response.siteInfo },
        });
      } else {
        // URL invalid, clear it
        clearWPSiteUrl();
        dispatch({ type: 'DISCONNECT' });
      }
    } catch {
      clearWPSiteUrl();
      dispatch({ type: 'DISCONNECT' });
    }
  };

  const testConnection = useCallback(async (url: string) => {
    return testConnectionAPI(url);
  }, []);

  const connect = useCallback(async (url: string, remember = true): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await testConnectionAPI(url);

      if (response.success && response.siteInfo) {
        dispatch({
          type: 'SET_CONNECTED',
          payload: { siteUrl: url, siteInfo: response.siteInfo },
        });

        if (remember) {
          saveWPSiteUrl(url);
          setWPRememberMe(true);
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
    clearWPSiteUrl();
    dispatch({ type: 'DISCONNECT' });
  }, []);

  const handleSetRememberMe = useCallback((remember: boolean) => {
    setWPRememberMe(remember);
    if (!remember && state.siteUrl) {
      clearWPSiteUrl();
    }
  }, [state.siteUrl]);

  const value: WPConnectionContextValue = {
    ...state,
    connect,
    disconnect,
    testConnection,
    rememberMe: getWPRememberMe(),
    setRememberMe: handleSetRememberMe,
  };

  return (
    <WPConnectionContext.Provider value={value}>
      {children}
    </WPConnectionContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useWPConnection() {
  const context = useContext(WPConnectionContext);
  if (!context) {
    throw new Error('useWPConnection must be used within a WPConnectionProvider');
  }
  return context;
}

// ============================================
// API Helper
// ============================================

async function testConnectionAPI(url: string): Promise<{ success: boolean; siteInfo?: WPSiteInfo; error?: string }> {
  const response = await fetch('/api/wp/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Connection failed' }));
    return { success: false, error: error.error || 'Connection failed' };
  }

  return response.json();
}
