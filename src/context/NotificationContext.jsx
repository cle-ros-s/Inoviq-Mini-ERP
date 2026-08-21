import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { getNotifications, markRead, markAllRead, fetchSystemAttentionAlerts } from '../services/notificationService.js';
import { useErpData } from './ErpDataContext.jsx';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const { refreshCounter } = useErpData();
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [isOpen, setIsOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    try {
      const localNotifs = getNotifications(currentUser.userId);
      const systemAlerts = await fetchSystemAttentionAlerts(currentUser.role);
      
      const combined = [...systemAlerts, ...localNotifs];
      setNotifications(combined);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  }, [currentUser]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshCounter]);

  const handleMarkRead = useCallback((id) => {
    setReadIds(prev => new Set(prev).add(id));
    markRead(id);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    const allIds = notifications.map(n => n.id);
    setReadIds(new Set(allIds));
    if (currentUser) {
      markAllRead(currentUser.userId);
    }
  }, [currentUser, notifications]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id) && !n.isRead).length;

  const togglePanel = useCallback(() => setIsOpen(o => !o), []);
  const closePanel = useCallback(() => setIsOpen(false), []);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, isOpen, readIds,
      togglePanel, closePanel,
      markRead: handleMarkRead, markAllRead: handleMarkAllRead,
      refresh,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
