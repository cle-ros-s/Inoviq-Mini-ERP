import { api } from './apiClient.js';

export async function getManufacturingOrders(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const res = await api.get(`/production-orders${query ? `?${query}` : ''}`);
  return res.data || [];
}

export async function getManufacturingOrder(id) {
  const res = await api.get(`/production-orders/${id}`);
  return res.data;
}

export const getManufacturingOrderById = getManufacturingOrder;

export async function createManufacturingOrder(data) {
  const res = await api.post('/production-orders', data);
  return res.data;
}

export async function confirmManufacturingOrder(id) {
  return { success: true };
}

export async function startManufacturingOrder(id) {
  const res = await api.post(`/production-orders/${id}/start`);
  return res.data;
}

export async function completeManufacturingOrder(id, producedQuantity) {
  const res = await api.post(`/production-orders/${id}/complete`, { producedQuantity });
  return res.data;
}

export async function cancelManufacturingOrder(id) {
  return { success: true };
}

export function createDraftFromProcurement(procurementRequest, userId) {
  return createManufacturingOrder({
    productId: procurementRequest.productId,
    plannedQuantity: procurementRequest.shortageQty
  });
}

export async function getMaterialAvailability(moId) {
  return [];
}

export async function getWorkOrders(moId) {
  return [];
}

export async function updateWorkOrder(id, updates) {
  return { success: true };
}

export function isDelayed(mo) {
  return false;
}
