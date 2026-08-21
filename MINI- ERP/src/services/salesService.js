import { getCollection, getItem, createItem, updateItem } from '../data/storage.js';
import { generateId } from '../utils/idGenerator.js';
import { calcOrderTotals } from '../utils/calculations.js';
import { logAction, ACTIONS } from './auditService.js';
import { reserveStock, decreaseStock, releaseStock, getFreeToUse } from './inventoryService.js';
import { createRequest } from './procurementService.js';
import { getProduct } from './productService.js';

export function getSalesOrders(filters = {}) {
  let orders = getCollection('salesOrders');
  if (filters.status) orders = orders.filter(o => o.status === filters.status);
  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getSalesOrder(id) {
  return getItem('salesOrders', id);
}

export function createSalesOrder(data, userId) {
  const id = generateId('salesOrder');
  const order = {
    ...data,
    id,
    status: 'Draft',
    deliveryStatus: 'Pending',
    createdAt: new Date().toISOString()
  };
  createItem('salesOrders', order);
  logAction({ action: ACTIONS.SALES_ORDER_CREATED, entity: 'SalesOrder', entityId: id, description: `Sales Order created`, userId });
  return order;
}

export function confirmSalesOrder(id, userId) {
  const order = getSalesOrder(id);
  if (!order || order.status !== 'Draft') throw new Error('Invalid status transition');

  order.lines.forEach(line => {
    const product = getProduct(line.productId);
    const ftu = getFreeToUse(line.productId);
    
    if (ftu >= line.qty) {
      reserveStock(line.productId, line.qty, 'SalesOrder', id, userId);
    } else {
      if (ftu > 0) reserveStock(line.productId, ftu, 'SalesOrder', id, userId);
      const shortage = line.qty - ftu;
      
      if (product.procurementStrategy === 'MTO') {
        createRequest({
          productId: line.productId,
          requiredQty: shortage,
          availableQty: 0,
          shortageQty: shortage,
          sourceType: 'SalesOrder',
          sourceId: id,
          procurementType: product.procurementType,
          userId
        });
      }
    }
  });

  const updated = updateItem('salesOrders', id, { status: 'Confirmed', confirmedAt: new Date().toISOString() });
  logAction({ action: ACTIONS.SALES_ORDER_CONFIRMED, entity: 'SalesOrder', entityId: id, description: `Sales Order confirmed`, userId });
  return updated;
}

export function deliverSalesOrder(id, deliveries, userId) {
  const order = getSalesOrder(id);
  if (!order || (order.status !== 'Confirmed' && order.status !== 'Partially Delivered')) throw new Error('Invalid status transition');
  
  let fullyDelivered = true;
  deliveries.forEach(del => {
    const line = order.lines.find(l => l.id === del.lineId);
    if (!line) return;
    const deliveredQty = line.deliveredQty || 0;
    const remaining = line.qty - deliveredQty;
    if (del.qty > remaining) throw new Error('Cannot deliver more than remaining qty');
    
    releaseStock(line.productId, del.qty, 'SalesOrder', id, userId);
    decreaseStock(line.productId, del.qty, 'SalesDelivery', id, userId);
    line.deliveredQty = deliveredQty + del.qty;
    
    if (line.deliveredQty < line.qty) fullyDelivered = false;
  });
  
  order.lines.forEach(l => {
    if ((l.deliveredQty || 0) < l.qty) fullyDelivered = false;
  });
  
  const deliveryStatus = fullyDelivered ? 'Fully Delivered' : 'Partially Delivered';
  const status = fullyDelivered ? 'Fully Delivered' : order.status;
  
  const updated = updateItem('salesOrders', id, { lines: order.lines, deliveryStatus, status, deliveredAt: fullyDelivered ? new Date().toISOString() : order.deliveredAt });
  logAction({ action: ACTIONS.SALES_ORDER_DELIVERED, entity: 'SalesOrder', entityId: id, description: `Sales Order delivered`, userId });
  return updated;
}

export function cancelSalesOrder(id, userId) {
  const order = getSalesOrder(id);
  if (!order || order.status !== 'Draft') throw new Error('Invalid status transition');
  
  const updated = updateItem('salesOrders', id, { status: 'Cancelled' });
  logAction({ action: ACTIONS.SALES_ORDER_CANCELLED, entity: 'SalesOrder', entityId: id, description: `Sales Order cancelled`, userId });
  return updated;
}

export function getDeliverableQty(orderId, lineId) {
  const order = getSalesOrder(orderId);
  const line = order.lines.find(l => l.id === lineId);
  if (!line) return 0;
  const remaining = line.qty - (line.deliveredQty || 0);
  const ftu = getFreeToUse(line.productId);
  return Math.min(remaining, ftu);
}

export function getOrderSummary(id) {
  const order = getSalesOrder(id);
  if (!order) return null;
  const totals = calcOrderTotals(order.lines);
  return { ...order, totals };
}

export const getSalesOrderById = getSalesOrder;
export function updateSalesOrder(id, data) {
  return updateItem('salesOrders', id, data);
}

