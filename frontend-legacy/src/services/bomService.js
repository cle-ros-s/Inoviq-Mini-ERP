import { getCollection, getItem, createItem, updateItem } from '../data/storage.js';
import { generateId } from '../utils/idGenerator.js';
import { logAction, ACTIONS } from './auditService.js';

export function getBoms(filters = {}) {
  return getCollection('boms');
}

export function getBom(id) {
  return getItem('boms', id);
}

export function getBomWithDetails(id) {
  const bom = getBom(id);
  if (!bom) return null;
  return { ...bom };
}

export function createBom(data, userId) {
  const id = generateId('bom');
  const bom = { ...data, id, status: 'active', createdAt: new Date().toISOString() };
  createItem('boms', bom);
  logAction({ action: ACTIONS.BOM_CREATED, entity: 'BoM', entityId: id, description: 'BoM created', userId });
  return bom;
}

export function updateBom(id, data, userId) {
  const updated = updateItem('boms', id, data);
  logAction({ action: ACTIONS.BOM_UPDATED, entity: 'BoM', entityId: id, description: 'BoM updated', userId });
  return updated;
}

export function getActiveBomForProduct(productId) {
  return getCollection('boms').find(b => b.productId === productId && b.status === 'active');
}

export function getBomComponents(bomId) {
  const bom = getBom(bomId);
  return bom ? bom.components : [];
}

export function getBomOperations(bomId) {
  const bom = getBom(bomId);
  return bom ? bom.operations : [];
}

export function getWorkCenters() {
  return getCollection('workCenters');
}

export function createWorkCenter(data, userId) {
  const id = generateId('workCenter');
  return createItem('workCenters', { ...data, id, createdAt: new Date().toISOString() });
}

export function updateWorkCenter(id, data, userId) {
  return updateItem('workCenters', id, data);
}

export const getBomById = getBom;
