import { getCollection, getItem, createItem, updateItem } from '../data/storage.js';
import { generateId } from '../utils/idGenerator.js';
import { logAction, ACTIONS } from './auditService.js';
import { increaseStock } from './inventoryService.js';
import { markCompleted } from './procurementService.js';
import { getProduct } from './productService.js';

export function getPurchaseOrders(filters = {}) {
  let pos = getCollection('purchaseOrders');
  if (filters.status) pos = pos.filter(p => p.status === filters.status);
  return pos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getPurchaseOrder(id) {
  return getItem('purchaseOrders', id);
}

export function createPurchaseOrder(data, userId) {
  const id = generateId('purchaseOrder');
  const po = {
    ...data, id, status: 'Draft', receiptStatus: 'Pending', createdAt: new Date().toISOString()
  };
  createItem('purchaseOrders', po);
  logAction({ action: ACTIONS.PURCHASE_ORDER_CREATED, entity: 'PurchaseOrder', entityId: id, description: 'PO Created', userId });
  return po;
}

export function createDraftFromProcurement(procurementRequest, userId) {
  const product = getProduct(procurementRequest.productId);
  const data = {
    vendorId: product.vendorId || null,
    lines: [{
      id: generateId('ID'), // dummy id
      productId: product.id,
      qty: procurementRequest.shortageQty,
      costPrice: product.costPrice || 0,
      tax: 0
    }],
    sourceType: 'Procurement',
    sourceProcurementId: procurementRequest.id
  };
  return createPurchaseOrder(data, userId);
}

export function confirmPurchaseOrder(id, userId) {
  const po = getPurchaseOrder(id);
  if (!po || po.status !== 'Draft') throw new Error('Invalid status transition');
  const updated = updateItem('purchaseOrders', id, { status: 'Confirmed', confirmedAt: new Date().toISOString() });
  logAction({ action: ACTIONS.PURCHASE_ORDER_CONFIRMED, entity: 'PurchaseOrder', entityId: id, description: 'PO Confirmed', userId });
  return updated;
}

export function receivePurchase(orderId, receipts, userId) {
  const po = getPurchaseOrder(orderId);
  if (!po || (po.status !== 'Confirmed' && po.status !== 'Partially Received')) throw new Error('Invalid status transition');
  
  let fullyReceived = true;
  receipts.forEach(rec => {
    const line = po.lines.find(l => l.id === rec.lineId);
    if (!line) return;
    const recQty = line.receivedQty || 0;
    const remaining = line.qty - recQty;
    if (rec.qty > remaining) throw new Error('Cannot receive more than remaining');
    
    increaseStock(line.productId, rec.qty, 'PurchaseReceipt', orderId, userId);
    line.receivedQty = recQty + rec.qty;
    if (line.receivedQty < line.qty) fullyReceived = false;
  });
  
  po.lines.forEach(l => {
    if ((l.receivedQty || 0) < l.qty) fullyReceived = false;
  });
  
  const receiptId = generateId('purchaseReceipt');
  createItem('purchaseReceipts', { id: receiptId, purchaseOrderId: orderId, lines: receipts, createdAt: new Date().toISOString() });
  
  const receiptStatus = fullyReceived ? 'Fully Received' : 'Partially Received';
  const status = fullyReceived ? 'Fully Received' : po.status;
  
  const updated = updateItem('purchaseOrders', orderId, { lines: po.lines, receiptStatus, status });
  logAction({ action: ACTIONS.PURCHASE_RECEIVED, entity: 'PurchaseOrder', entityId: orderId, description: 'Purchase Received', userId });
  
  if (fullyReceived && po.sourceProcurementId) {
    markCompleted(po.sourceProcurementId, userId);
  }
  
  return updated;
}

export function cancelPurchaseOrder(id, userId) {
  const po = getPurchaseOrder(id);
  if (!po || po.status !== 'Draft') throw new Error('Invalid status transition');
  return updateItem('purchaseOrders', id, { status: 'Cancelled' });
}

export function getReceiptHistory(orderId) {
  return getCollection('purchaseReceipts').filter(r => r.purchaseOrderId === orderId);
}

export const getPurchaseOrderById = getPurchaseOrder;
export const receivePurchaseOrder = receivePurchase;
