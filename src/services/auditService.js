import { createItem, getCollection } from '../data/storage.js';
import { generateId } from '../utils/idGenerator.js';

export const ACTIONS = {
  LOGIN: 'Login', LOGOUT: 'Logout',
  PRODUCT_CREATED: 'Product Created', PRODUCT_UPDATED: 'Product Updated', PRODUCT_DEACTIVATED: 'Product Deactivated',
  SALES_ORDER_CREATED: 'Sales Order Created', SALES_ORDER_CONFIRMED: 'Sales Order Confirmed',
  SALES_ORDER_DELIVERED: 'Sales Order Delivered', SALES_ORDER_CANCELLED: 'Sales Order Cancelled',
  PURCHASE_ORDER_CREATED: 'Purchase Order Created', PURCHASE_ORDER_CONFIRMED: 'Purchase Order Confirmed',
  PURCHASE_RECEIVED: 'Purchase Received',
  BOM_CREATED: 'BoM Created', BOM_UPDATED: 'BoM Updated',
  MANUFACTURING_CREATED: 'Manufacturing Created', MANUFACTURING_STARTED: 'Manufacturing Started',
  MANUFACTURING_COMPLETED: 'Manufacturing Completed', MANUFACTURING_CANCELLED: 'Manufacturing Cancelled',
  STOCK_CHANGED: 'Stock Changed',
  USER_CREATED: 'User Created', USER_UPDATED: 'User Updated', USER_DEACTIVATED: 'User Deactivated',
  ROLE_CHANGED: 'Role Changed',
  PROCUREMENT_CREATED: 'Procurement Created', PROCUREMENT_COMPLETED: 'Procurement Completed'
};

export function logAction({ action, entity, entityId, description, oldValue, newValue, userId }) {
  const id = generateId('auditLog');
  const log = {
    id,
    action,
    entity,
    entityId,
    description,
    oldValue: oldValue ? JSON.stringify(oldValue) : null,
    newValue: newValue ? JSON.stringify(newValue) : null,
    userId,
    createdAt: new Date().toISOString()
  };
  return createItem('auditLogs', log);
}

export function getLogs(filters = {}) {
  let logs = getCollection('auditLogs');
  if (filters.userId) logs = logs.filter(l => l.userId === filters.userId);
  if (filters.action) logs = logs.filter(l => l.action === filters.action);
  if (filters.entity) logs = logs.filter(l => l.entity === filters.entity);
  if (filters.dateFrom) logs = logs.filter(l => new Date(l.createdAt) >= new Date(filters.dateFrom));
  if (filters.dateTo) logs = logs.filter(l => new Date(l.createdAt) <= new Date(filters.dateTo));
  return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getRecentActivity(limit = 10) {
  const logs = getLogs();
  return logs.slice(0, limit);
}
