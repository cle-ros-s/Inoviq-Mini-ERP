import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { getNotifications, markRead, markAllRead, fetchSystemAttentionAlerts } from '../services/notificationService.js';
import { useErpData } from './ErpDataContext.jsx';
import { useUI } from './UIContext.jsx';
import { getSocket } from '../services/socket.js';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const { refreshCounter } = useErpData();
  const { addToast } = useUI();
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [isOpen, setIsOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    try {
      const localNotifs = await getNotifications(currentUser.userId);
      const systemAlerts = await fetchSystemAttentionAlerts(currentUser.role);
      
      setNotifications(prev => {
        // Keep real-time notifications that haven't been fetched from backend system alerts
        const rtOnly = prev.filter(n => n.id?.startsWith('notif-rt-'));
        const combined = [...rtOnly, ...systemAlerts, ...localNotifs];
        
        // Remove duplicates by ID
        const seen = new Set();
        return combined.filter(n => {
          if (seen.has(n.id)) return false;
          seen.add(n.id);
          return true;
        });
      });
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  }, [currentUser]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshCounter]);

  // Socket.IO Subscription for Instant Real-Time Notifications & Toasts
  useEffect(() => {
    const socket = getSocket();

    const handleNewNotification = (notif) => {
      if (!notif || !notif.title) return;
      console.log('⚡ Real-time notification received via Socket.IO:', notif);

      // Prepend to notifications list
      setNotifications(prev => [notif, ...prev.filter(n => n.id !== notif.id)]);

      // Display real-time visual toast pop-up
      const toastType = notif.severity === 'CRITICAL' ? 'error' : (notif.severity === 'WARNING' ? 'warning' : 'info');
      addToast({
        type: toastType,
        message: `⚡ ${notif.title}: ${notif.message}`,
        duration: 5000
      });
    };

    const handleErpUpdate = (payload) => {
      if (payload?.notification) {
        handleNewNotification(payload.notification);
      }
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('erp:update', handleErpUpdate);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('erp:update', handleErpUpdate);
    };
  }, [addToast]);

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
