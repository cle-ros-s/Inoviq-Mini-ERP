import { getCollection, getItem, updateItem, createItem } from '../data/storage.js';
import { generateId } from '../utils/idGenerator.js';
import { calcFreeToUse, calcStockStatus } from '../utils/calculations.js';
import { logAction, ACTIONS } from './auditService.js';
import { pushNotification } from './notificationService.js';

export function getInventory() {
  const inv = getCollection('inventory');
  return inv.map(i => ({ ...i, freeToUse: calcFreeToUse(i.onHand, i.reserved) }));
}

export function getProductInventory(productId) {
  let inv = getCollection('inventory').find(i => i.productId === productId);
  if (!inv) return null;
  return { ...inv, freeToUse: calcFreeToUse(inv.onHand, inv.reserved) };
}

export function getFreeToUse(productId) {
  const inv = getProductInventory(productId);
  return inv ? inv.freeToUse : 0;
}

export function getStockStatus(productId) {
  const inv = getProductInventory(productId);
  if (!inv) return 'Out of Stock';
  const product = getItem('products', productId);
  return calcStockStatus(inv.onHand, product ? product.reorderLevel : 0);
}

function _updateInventory(productId, updates, movementType, quantity, refType, refId, userId, description) {
  let inv = getCollection('inventory').find(i => i.productId === productId);
  if (!inv) throw new Error('Inventory record not found');
  const onHandBefore = inv.onHand;
  const reservedBefore = inv.reserved;
  
  const newOnHand = updates.onHand !== undefined ? updates.onHand : inv.onHand;
  const newReserved = updates.reserved !== undefined ? updates.reserved : inv.reserved;
  
  if (newOnHand < 0) throw new Error('Insufficient stock: onHand cannot be negative');
  if (newReserved < 0) throw new Error('Reserved stock cannot be negative');
  
  inv = updateItem('inventory', inv.id, { onHand: newOnHand, reserved: newReserved, updatedAt: new Date().toISOString() });
  
  createLedgerEntry({
    productId, movementType, quantity,
    onHandBefore, onHandAfter: inv.onHand,
    reservedBefore, reservedAfter: inv.reserved,
    referenceType: refType, referenceId: refId, userId, description
  });
  
  checkLowStock(productId, inv);
  return inv;
}

export function reserveStock(productId, qty, refType, refId, userId) {
  if (qty <= 0) return;
  const inv = getProductInventory(productId);
  if (!inv) throw new Error('Inventory not found');
  if (qty > inv.freeToUse) throw new Error('Insufficient free stock to reserve');
  return _updateInventory(productId, { reserved: inv.reserved + qty }, 'Reservation', qty, refType, refId, userId, 'Stock Reserved');
}

export function releaseStock(productId, qty, refType, refId, userId) {
  if (qty <= 0) return;
  const inv = getProductInventory(productId);
  if (!inv) throw new Error('Inventory not found');
  const releaseQty = Math.min(qty, inv.reserved);
  return _updateInventory(productId, { reserved: inv.reserved - releaseQty }, 'Reservation Release', releaseQty, refType, refId, userId, 'Reservation Released');
}

export function increaseStock(productId, qty, refType, refId, userId) {
  if (qty <= 0) return;
  const inv = getProductInventory(productId);
  if (!inv) throw new Error('Inventory not found');
  return _updateInventory(productId, { onHand: inv.onHand + qty }, refType === 'PurchaseReceipt' ? 'Purchase Receipt' : (refType === 'ManufacturingOrder' ? 'Manufacturing Production' : 'Manual Adjustment'), qty, refType, refId, userId, 'Stock Increased');
}

export function decreaseStock(productId, qty, refType, refId, userId) {
  if (qty <= 0) return;
  const inv = getProductInventory(productId);
  if (!inv) throw new Error('Inventory not found');
  return _updateInventory(productId, { onHand: inv.onHand - qty }, refType === 'SalesDelivery' ? 'Sales Delivery' : (refType === 'ManufacturingOrder' ? 'Manufacturing Consumption' : 'Manual Adjustment'), qty, refType, refId, userId, 'Stock Decreased');
}

export function consumeComponents(bomComponents, moQty, moId, userId) {
  bomComponents.forEach(comp => {
    const totalQty = comp.qty * moQty;
    releaseStock(comp.productId, totalQty, 'ManufacturingOrder', moId, userId);
    decreaseStock(comp.productId, totalQty, 'ManufacturingOrder', moId, userId);
  });
}

export function produceFinishedGoods(productId, moQty, moId, userId) {
  increaseStock(productId, moQty, 'ManufacturingOrder', moId, userId);
}

export function createLedgerEntry({productId, movementType, quantity, onHandBefore, onHandAfter, reservedBefore, reservedAfter, referenceType, referenceId, userId, description}) {
  const id = generateId('stockLedger');
  const entry = {
    id, productId, movementType, quantity,
    onHandBefore, onHandAfter,
    reservedBefore, reservedAfter,
    freeToUseBefore: onHandBefore - reservedBefore,
    freeToUseAfter: onHandAfter - reservedAfter,
    referenceType, referenceId, userId, description,
    createdAt: new Date().toISOString()
  };
  createItem('stockLedger', entry);
  logAction({ action: ACTIONS.STOCK_CHANGED, entity: 'Product', entityId: productId, description: `${movementType} ${quantity} for ${referenceId}`, userId });
  return entry;
}

export function getLedger(filters = {}) {
  let ledger = getCollection('stockLedger');
  if (filters.productId) ledger = ledger.filter(l => l.productId === filters.productId);
  if (filters.movementType) ledger = ledger.filter(l => l.movementType === filters.movementType);
  if (filters.referenceType) ledger = ledger.filter(l => l.referenceType === filters.referenceType);
  if (filters.dateFrom) ledger = ledger.filter(l => new Date(l.createdAt) >= new Date(filters.dateFrom));
  if (filters.dateTo) ledger = ledger.filter(l => new Date(l.createdAt) <= new Date(filters.dateTo));
  return ledger.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function checkLowStock(productId, currentInventory) {
  const product = getItem('products', productId);
  if (!product) return;
  if (currentInventory.onHand <= product.reorderLevel || currentInventory.onHand === 0) {
    pushNotification({
      type: 'LOW_STOCK',
      title: 'Low Stock Alert',
      message: `Product ${product.name} is running low.`,
      referenceType: 'Product',
      referenceId: productId,
      userId: null // send to all admins/inventory managers
    });
  }
}


export function getInventoryOverview() {
  // Returns all products merged with inventory data
  const products = getCollection('products');
  const invRecords = getCollection('inventory');
  const invMap = {};
  invRecords.forEach(i => invMap[i.productId] = i);

  return products.map(p => {
    const inv = invMap[p.id] || { onHand: 0, reserved: 0 };
    const freeToUse = calcFreeToUse(inv.onHand, inv.reserved);
    const product = getItem('products', p.id);
    return {
      ...p,
      productName: p.name,
      onHand: inv.onHand,
      reserved: inv.reserved,
      freeToUse,
      status: calcStockStatus(inv.onHand, p.reorderLevel || 0),
    };
  });
}

export function getStockLedger(filters) {
  return getLedger(filters || {});
}

