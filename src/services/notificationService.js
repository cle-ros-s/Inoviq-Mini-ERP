import { createItem, getCollection, updateItem } from '../data/storage.js';
import { generateId } from '../utils/idGenerator.js';
import { api } from './apiClient.js';

export function pushNotification({ type, title, message, referenceType, referenceId, userId, category = 'ATTENTION_REQUIRED' }) {
  const id = generateId('notification');
  const notification = {
    id,
    type: type || 'WARNING',
    category: category || 'ATTENTION_REQUIRED',
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

export async function fetchSystemAttentionAlerts(role = 'admin') {
  try {
    let normalizedRole = (role || 'admin').toLowerCase();
    if (normalizedRole.includes('sales')) normalizedRole = 'sales';
    else if (normalizedRole.includes('purchase')) normalizedRole = 'purchase';
    else if (normalizedRole.includes('manufacturing') || normalizedRole.includes('production')) normalizedRole = 'manufacturing';
    else if (normalizedRole.includes('inventory')) normalizedRole = 'inventory';
    else if (normalizedRole.includes('quality')) normalizedRole = 'quality';
    else if (normalizedRole.includes('delivery')) normalizedRole = 'delivery';
    else if (normalizedRole.includes('finance') || normalizedRole.includes('accounts')) normalizedRole = 'finance';
    else normalizedRole = 'admin';

    const res = await api.get(`/dashboard/${normalizedRole}`);
    const dashData = res?.data?.dashboard || {};
    const alerts = dashData.alerts || [];

    return alerts.map((alertText, index) => {
      let targetPath = '/dashboard';
      let title = 'Attention Required';
      let module = 'SYSTEM';
      let severity = 'WARNING';
      let actionText = 'View Details →';

      const lower = alertText.toLowerCase();
      if (lower.includes('stock') || lower.includes('reorder')) {
        targetPath = '/inventory';
        title = 'Low Stock Reorder Alert';
        module = 'INVENTORY';
        severity = 'CRITICAL';
        actionText = 'View Inventory →';
      } else if (lower.includes('quotation') || lower.includes('enquir') || lower.includes('sales')) {
        targetPath = '/sales';
        title = 'Sales Pipeline & Quotation Action';
        module = 'SALES';
        severity = 'WARNING';
        actionText = 'View Sales Orders →';
      } else if (lower.includes('quality') || lower.includes('inspection') || lower.includes('defect')) {
        targetPath = '/quality';
        title = 'Quality Audit Backlog Review';
        module = 'QUALITY';
        severity = 'WARNING';
        actionText = 'Review Quality Audits →';
      } else if (lower.includes('delivery') || lower.includes('fulfillment') || lower.includes('dispatch') || lower.includes('shipment')) {
        targetPath = '/delivery';
        title = 'Logistics & Dispatch Notice';
        module = 'LOGISTICS';
        severity = 'INFO';
        actionText = 'Track Shipments →';
      } else if (lower.includes('invoice') || lower.includes('overdue') || lower.includes('payment') || lower.includes('receivable')) {
        targetPath = '/finance';
        title = 'Overdue Finance & Billing Notice';
        module = 'FINANCE';
        severity = 'CRITICAL';
        actionText = 'Review Overdue Invoices →';
      } else if (lower.includes('purchase') || lower.includes('procurement') || lower.includes('vendor')) {
        targetPath = '/procurement';
        title = 'Procurement & Requisition Request';
        module = 'PROCUREMENT';
        severity = 'WARNING';
        actionText = 'Manage Procurement →';
      } else if (lower.includes('user') || lower.includes('security') || lower.includes('suspended')) {
        targetPath = '/users';
        title = 'User Account & Security Notice';
        module = 'SECURITY';
        severity = 'INFO';
        actionText = 'Manage System Users →';
      }

      return {
        id: `sys-attention-${index + 1}`,
        type: severity,
        category: 'ATTENTION_REQUIRED',
        module,
        title,
        message: alertText,
        path: targetPath,
        actionText,
        isRead: false,
        createdAt: new Date().toISOString()
      };
    });
  } catch (err) {
    console.error('Failed to fetch system attention alerts:', err);
    return [];
  }
}

export function getNotifications(userId) {
  const all = getCollection('notifications') || [];
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
