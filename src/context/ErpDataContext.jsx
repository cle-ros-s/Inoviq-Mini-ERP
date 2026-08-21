import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';

const ErpDataContext = createContext(null);

// Initialize Socket.io connection (update URL when your backend is ready)
const socket = io('http://localhost:3000', {
  autoConnect: true,
  reconnection: true
});

/**
 * ErpDataContext provides a reactive "refresh trigger" pattern.
 * Components (like Dashboard graphs) subscribe to this counter to know when to re-fetch from services.
 */
export function ErpDataProvider({ children }) {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(Date.now());

  const triggerRefresh = useCallback(() => {
    setRefreshCounter(c => c + 1);
    setLastRefreshedAt(Date.now());
  }, []);

  // 1. Socket.io Real-Time Updates Listener
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket.io connected for real-time dashboard updates');
    });

    // When backend emits that data was entered, trigger a global graph refresh
    socket.on('data_updated', () => {
      console.log('Socket.io received data_updated event, refreshing graphs!');
      triggerRefresh();
    });

    return () => {
      socket.off('connect');
      socket.off('data_updated');
    };
  }, [triggerRefresh]);

  // 2. Cross-Tab LocalStorage Real-Time Updates (Fallback/Local mode)
  // This simulates the socket real-time experience locally across browser tabs right now!
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('sfw:')) {
        triggerRefresh();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [triggerRefresh]);

  return (
    <ErpDataContext.Provider value={{ refreshCounter, lastRefreshedAt, triggerRefresh, socket }}>
      {children}
    </ErpDataContext.Provider>
  );
}

export function useErpData() {
  const ctx = useContext(ErpDataContext);
  if (!ctx) throw new Error('useErpData must be used within ErpDataProvider');
  return ctx;
}
