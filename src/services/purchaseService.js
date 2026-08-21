import { api } from './apiClient.js';

export async function getPurchaseOrders(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const res = await api.get(`/purchase-orders${query ? `?${query}` : ''}`);
  return res.data || [];
}

export async function getPurchaseOrder(id) {
  const res = await api.get(`/purchase-orders/${id}`);
  return res.data;
}

export async function createPurchaseOrder(data) {
  const res = await api.post('/purchase-orders', data);
  return res.data;
}

export async function confirmPurchaseOrder(id) {
  return { success: true };
}

export async function receivePurchaseOrder(id) {
  const res = await api.post(`/purchase-orders/${id}/receive`);
  return res.data;
}

export const receivePurchase = receivePurchaseOrder;

export async function cancelPurchaseOrder(id) {
  return { success: true };
}

export function createDraftFromProcurement(procurementRequest, userId) {
  return createPurchaseOrder({
    supplierId: procurementRequest.vendorId,
    items: [{
      productId: procurementRequest.productId,
      quantity: procurementRequest.shortageQty,
      unitPrice: 0
    }]
  });
}

export async function getReceiptHistory(orderId) {
  return [];
}
