import { api } from './apiClient.js';

export async function getBoms(filters = {}) {
  const res = await api.get('/boms');
  return res.data || [];
}

export async function getBom(id) {
  const res = await api.get(`/boms/${id}`);
  return res.data;
}

export const getBomById = getBom;

export async function getBomWithDetails(id) {
  return getBom(id);
}

export async function createBom(data) {
  const res = await api.post('/boms', data);
  return res.data;
}

export async function updateBom(id, data) {
  const res = await api.put(`/boms/${id}`, data);
  return res.data;
}

export async function getActiveBomForProduct(productId) {
  const boms = await getBoms();
  return boms.find(b => b.productId === productId);
}

export async function getBomComponents(bomId) {
  const bom = await getBom(bomId);
  return bom?.items || [];
}

export async function getBomOperations(bomId) {
  return [];
}

export async function getWorkCenters() {
  return [
    { id: 'WC-001', name: 'Assembly Station' },
    { id: 'WC-002', name: 'Painting & Finishing' },
    { id: 'WC-003', name: 'Packing & Quality' }
  ];
}

export async function createWorkCenter(data) {
  return { id: 'WC-NEW', ...data };
}

export async function updateWorkCenter(id, data) {
  return { id, ...data };
}

export async function checkMaterialAvailability(id, quantity = 1) {
  const res = await api.get(`/boms/${id}/availability?quantity=${quantity}`);
  return res.data;
}
