import React, { createContext, useContext, useState, useCallback } from 'react';

const ErpDataContext = createContext(null);

/**
 * ErpDataContext provides a reactive "refresh trigger" pattern.
 * Any service mutation calls triggerRefresh() which increments a counter.
 * Components subscribe to this counter to know when to re-fetch from services.
 */
export function ErpDataProvider({ children }) {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(Date.now());

  const triggerRefresh = useCallback(() => {
    setRefreshCounter(c => c + 1);
    setLastRefreshedAt(Date.now());
  }, []);

  return (
    <ErpDataContext.Provider value={{ refreshCounter, lastRefreshedAt, triggerRefresh }}>
      {children}
    </ErpDataContext.Provider>
  );
}

export function useErpData() {
  const ctx = useContext(ErpDataContext);
  if (!ctx) throw new Error('useErpData must be used within ErpDataProvider');
  return ctx;
}
