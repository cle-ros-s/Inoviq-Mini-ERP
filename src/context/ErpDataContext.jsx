import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getSocket, subscribeToErpUpdates } from '../services/socket.js';

const ErpDataContext = createContext(null);

/**
 * ErpDataProvider provides a reactive real-time "refresh trigger" pattern.
 * Components (like role Dashboards) subscribe to this counter to re-fetch from PostgreSQL.
 */
export function ErpDataProvider({ children }) {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(Date.now());
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(5); // default 5s
  const [secondsUntilNextRefresh, setSecondsUntilNextRefresh] = useState(5);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const triggerRefresh = useCallback(() => {
    setRefreshCounter(c => c + 1);
    setLastRefreshedAt(Date.now());
    setSecondsUntilNextRefresh(autoRefreshInterval);
  }, [autoRefreshInterval]);

  // Socket.IO Subscription
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      console.log('⚡ Socket.IO connected for real-time dashboard updates');
      setIsSocketConnected(true);
    };

    const handleDisconnect = () => {
      console.log('⚡ Socket.IO disconnected');
      setIsSocketConnected(false);
    };

    const handleUpdate = (payload) => {
      console.log('⚡ Real-time Socket.IO update received:', payload);
      triggerRefresh();
    };

    if (socket.connected) {
      setIsSocketConnected(true);
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('data_updated', handleUpdate);
    socket.on('erp:update', handleUpdate);
    socket.on('dashboard:refresh', handleUpdate);

    const unsubscribe = subscribeToErpUpdates(handleUpdate);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('data_updated', handleUpdate);
      socket.off('erp:update', handleUpdate);
      socket.off('dashboard:refresh', handleUpdate);
      unsubscribe();
    };
  }, [triggerRefresh]);

  // Auto-polling Countdown Timer
  useEffect(() => {
    if (!isAutoRefreshEnabled || autoRefreshInterval <= 0) return;

    setSecondsUntilNextRefresh(autoRefreshInterval);

    const timer = setInterval(() => {
      setSecondsUntilNextRefresh(prev => {
        if (prev <= 1) {
          triggerRefresh();
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoRefreshEnabled, autoRefreshInterval, triggerRefresh]);

  return (
    <ErpDataContext.Provider value={{
      refreshCounter,
      lastRefreshedAt,
      triggerRefresh,
      isAutoRefreshEnabled,
      setIsAutoRefreshEnabled,
      autoRefreshInterval,
      setAutoRefreshInterval,
      secondsUntilNextRefresh,
      isSocketConnected
    }}>
      {children}
    </ErpDataContext.Provider>
  );
}

export function useErpData() {
  const ctx = useContext(ErpDataContext);
  if (!ctx) throw new Error('useErpData must be used within ErpDataProvider');
  return ctx;
}
