import { api } from './apiClient.js';

export async function getProducts(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const res = await api.get(`/products${query ? `?${query}` : ''}`);
  return res.data || [];
}

export async function getProduct(id) {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

export async function getProductsWithInventory(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const res = await api.get(`/products${query ? `?${query}` : ''}`);
  return res.data || [];
}

export async function getProductWithInventory(id) {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

export async function createProduct(data, userId) {
  const res = await api.post('/products', data);
  return res.data;
}

export async function updateProduct(id, data, userId) {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
}

export async function deactivateProduct(id, userId) {
  const res = await api.patch(`/products/${id}/toggle-status`);
  return res.data;
}

export async function deleteProduct(id, userId) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
}

export async function canDelete(id) {
  return { canDelete: true, reason: '' };
}
