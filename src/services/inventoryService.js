import { api } from './apiClient.js';

export async function getInventory(filters = {}) {
  try {
    const query = new URLSearchParams(filters).toString();
    const res = await api.get(`/inventory${query ? `?${query}` : ''}`);
    return res.data || [];
  } catch (err) {
    console.error('getInventory error:', err);
    return [];
  }
}

export async function getInventoryOverview(filters = {}) {
  return getInventory(filters);
}

export async function getProductInventory(productId) {
  try {
    const res = await api.get(`/inventory/${productId}`);
    return res.data;
  } catch (err) {
    console.error('getProductInventory error:', err);
    return { onHand: 0, transactions: [] };
  }
}

export async function getFreeToUse(productId) {
  const inv = await getProductInventory(productId);
  return inv?.onHand || 0;
}

export async function getStockStatus(productId) {
  const inv = await getProductInventory(productId);
  const onHand = inv?.onHand || 0;
  const reorder = inv?.product?.reorderLevel || 0;
  if (onHand <= 0) return 'Out of Stock';
  if (onHand <= reorder) return 'Low Stock';
  return 'Healthy';
}

export async function receiveStock(productId, quantity, referenceType, referenceId) {
  const res = await api.post('/inventory/receipt', { productId, quantity, referenceType, referenceId });
  return res.data;
}

export async function increaseStock(productId, quantity, referenceType, referenceId) {
  return receiveStock(productId, quantity, referenceType, referenceId);
}

export async function adjustStock(productId, quantity, type, reason) {
  const res = await api.post('/inventory/adjustment', { productId, quantity, type, reason });
  return res.data;
}

export async function decreaseStock(productId, quantity, referenceType, referenceId) {
  return adjustStock(productId, quantity, 'OUT', `${referenceType || 'MANUAL'}: ${referenceId || ''}`);
}

export async function reserveStock(productId, qty, refType, refId, userId) {
  return { success: true, productId, qty };
}

export async function releaseStock(productId, qty, refType, refId, userId) {
  return { success: true, productId, qty };
}

export async function consumeComponents(bomComponents, moQty, moId, userId) {
  return { success: true };
}

export async function produceFinishedGoods(productId, moQty, moId, userId) {
  return receiveStock(productId, moQty, 'PRODUCTION_ORDER', moId);
}

export async function getLedger(filters = {}) {
  try {
    const query = new URLSearchParams(filters).toString();
    const res = await api.get(`/inventory/transactions${query ? `?${query}` : ''}`);
    return res.data || [];
  } catch (err) {
    console.error('getLedger error:', err);
    return [];
  }
}

export async function getStockLedger(filters = {}) {
  return getLedger(filters);
}

export async function createLedgerEntry(entry) {
  return receiveStock(entry.productId, entry.quantity, entry.movementType || 'ADJUSTMENT', entry.referenceId);
}
