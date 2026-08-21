import { createItem, getCollection, updateItem } from '../data/storage.js';
import { generateId } from '../utils/idGenerator.js';

export function pushNotification({ type, title, message, referenceType, referenceId, userId }) {
  const id = generateId('notification');
  const notification = {
    id,
    type,
    title,
    message,
    referenceType,
    referenceId,
    userId,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  return createItem('notifications', notification);
}

export function getNotifications(userId) {
  const all = getCollection('notifications');
  const user = getCollection('users').find(u => u.id === userId);
  if (user && user.role === 'admin') {
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return all.filter(n => !n.userId || n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function markRead(notificationId) {
  return updateItem('notifications', notificationId, { isRead: true });
}

export function markAllRead(userId) {
  const notifications = getNotifications(userId);
  notifications.forEach(n => {
    if (!n.isRead) updateItem('notifications', n.id, { isRead: true });
  });
}

export function getUnreadCount(userId) {
  return getNotifications(userId).filter(n => !n.isRead).length;
}
