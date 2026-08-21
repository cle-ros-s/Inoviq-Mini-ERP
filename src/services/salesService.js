import { api } from './apiClient.js';

export async function getSalesOrders(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const res = await api.get(`/sales-orders${query ? `?${query}` : ''}`);
  return res.data || [];
}

export async function getSalesOrder(id) {
  const res = await api.get(`/sales-orders/${id}`);
  return res.data;
}

export async function createSalesOrder(data) {
  const res = await api.post('/sales-orders', data);
  return res.data;
}

export async function confirmSalesOrder(id) {
  const res = await api.patch(`/sales-orders/${id}/status`, { status: 'CONFIRMED' });
  return res.data;
}

export async function cancelSalesOrder(id) {
  const res = await api.patch(`/sales-orders/${id}/status`, { status: 'CANCELLED' });
  return res.data;
}

export async function deliverSalesOrder(id, deliveries, userId) {
  const res = await api.post(`/deliveries`, { salesOrderId: id, ...deliveries });
  return res.data;
}

export function getOrderSummary(order) {
  if (!order) return { totals: { grandTotal: 0 } };
  return {
    totals: {
      subtotal: order.subtotal || 0,
      taxTotal: (order.total || 0) - (order.subtotal || 0),
      grandTotal: order.total || 0
    }
  };
}

export function getDeliverableQty(orderId, lineId) {
  return 999;
}
