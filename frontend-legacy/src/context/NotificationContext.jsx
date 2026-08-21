import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { getNotifications, markRead, markAllRead, getUnreadCount } from '../services/notificationService.js';
import { useErpData } from './ErpDataContext.jsx';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const { refreshCounter } = useErpData();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const refresh = useCallback(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const notifs = getNotifications(currentUser.userId, currentUser.role);
      setNotifications(notifs);
      setUnreadCount(getUnreadCount(currentUser.userId, currentUser.role));
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  }, [currentUser]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshCounter]);

  const handleMarkRead = useCallback((id) => {
    markRead(id);
    refresh();
  }, [refresh]);

  const handleMarkAllRead = useCallback(() => {
    if (currentUser) {
      markAllRead(currentUser.userId);
      refresh();
    }
  }, [currentUser, refresh]);

  const togglePanel = useCallback(() => setIsOpen(o => !o), []);
  const closePanel = useCallback(() => setIsOpen(false), []);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, isOpen,
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
