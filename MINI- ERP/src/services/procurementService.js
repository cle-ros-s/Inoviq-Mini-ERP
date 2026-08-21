import { getCollection, getItem, createItem, updateItem } from '../data/storage.js';
import { generateId } from '../utils/idGenerator.js';
import { logAction, ACTIONS } from './auditService.js';
import { createDraftFromProcurement as createPurchaseDraft } from './purchaseService.js';
import { createDraftFromProcurement as createManufacturingDraft } from './manufacturingService.js';

export function getProcurementRequests(filters = {}) {
  let reqs = getCollection('procurementRequests');
  if (filters.status) reqs = reqs.filter(r => r.status === filters.status);
  return reqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getProcurementRequest(id) {
  return getItem('procurementRequests', id);
}

export function createRequest({productId, requiredQty, availableQty, shortageQty, sourceType, sourceId, procurementType, userId}) {
  const id = generateId('procurementRequest');
  const req = {
    id, productId, requiredQty, availableQty, shortageQty, sourceType, sourceId, procurementType, userId,
    status: 'Pending', createdAt: new Date().toISOString()
  };
  createItem('procurementRequests', req);
  logAction({ action: ACTIONS.PROCUREMENT_CREATED, entity: 'ProcurementRequest', entityId: id, description: `Procurement Request created`, userId });
  triggerProcurement(id, userId);
  return req;
}

export function triggerProcurement(requestId, userId) {
  const req = getProcurementRequest(requestId);
  if (!req || req.status !== 'Pending') return;
  
  let targetId;
  if (req.procurementType === 'Purchase') {
    const po = createPurchaseDraft(req, userId);
    targetId = po.id;
    updateItem('procurementRequests', requestId, { status: 'Purchase Created', targetId });
  } else if (req.procurementType === 'Manufacturing') {
    const mo = createManufacturingDraft(req, userId);
    targetId = mo.id;
    updateItem('procurementRequests', requestId, { status: 'Manufacturing Created', targetId });
  }
}

export function markCompleted(requestId, userId) {
  const updated = updateItem('procurementRequests', requestId, { status: 'Completed' });
  logAction({ action: ACTIONS.PROCUREMENT_COMPLETED, entity: 'ProcurementRequest', entityId: requestId, description: `Procurement Request completed`, userId });
  return updated;
}

export function cancelRequest(requestId, userId) {
  return updateItem('procurementRequests', requestId, { status: 'Cancelled' });
}

export const getProcurements = getProcurementRequests;
export const getProcurementById = getProcurementRequest;
