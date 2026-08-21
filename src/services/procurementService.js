import { getCollection, setCollection, getItem, createItem, updateItem } from '../data/storage.js';
import { generateId } from '../utils/idGenerator.js';
import { logAction, ACTIONS } from './auditService.js';
import { createDraftFromProcurement as createPurchaseDraft } from './purchaseService.js';
import { createDraftFromProcurement as createManufacturingDraft } from './manufacturingService.js';

// Function to generate 60 realistic procurement records
function generate60ProcurementRequests() {
  const productNames = [
    'Teak Wood Plank (8ft x 4in)', 'Turned Wooden Legs (Set of 4)', 'Laminated Wooden Top Panel 18mm',
    'Sheesham Hardwood Board (6ft x 3ft)', 'Burma Teak Veneer Sheet (8ft x 4ft)', 'Commercial Marine Plywood (19mm)',
    'Oak Wood Beam (10ft)', 'High-Density Upholstery Foam (4-inch)', 'Premium Velvet Fabric Roll (10m)',
    'Genuine Leather Hide (Full Grain)', 'Heavy Duty Frame Screws (Box 100)', 'Soft-Close Concealed Hinges (Pair)',
    'Telescopic Drawer Ball Bearing Slides', 'Antique Brass Cabinet Handles (Set 6)', 'Clear Gloss PU Lacquer Paint (5L)'
  ];

  const statuses = ['Pending', 'Purchase Created', 'Manufacturing Created', 'Completed', 'Pending', 'Purchase Created'];
  const sourceTypes = ['Sales Order Shortage', 'Reorder Threshold Alert', 'Production Material Deficit'];

  const requests = [];
  for (let i = 1; i <= 60; i++) {
    const pName = productNames[(i - 1) % productNames.length];
    const pType = i % 3 === 0 ? 'Manufacturing' : 'Purchase';
    const status = statuses[(i - 1) % statuses.length];
    const sType = sourceTypes[(i - 1) % sourceTypes.length];
    const requiredQty = (i * 5) + 20;
    const availableQty = Math.floor(requiredQty * 0.3);
    const shortageQty = requiredQty - availableQty;
    const sourceId = sType.includes('Sales') ? `SO-${String(i).padStart(6, '0')}` : (sType.includes('Production') ? `MO-${String(i).padStart(6, '0')}` : `STOCK-MIN-${i}`);

    requests.push({
      id: `PR-${String(i).padStart(6, '0')}`,
      productId: `PROD-REF-${i}`,
      productName: pName,
      requiredQty,
      availableQty,
      shortageQty,
      sourceType: sType,
      sourceId,
      procurementType: pType,
      status,
      targetId: status.includes('Created') ? (pType === 'Purchase' ? `PO-${String(i).padStart(6, '0')}` : `MO-${String(i).padStart(6, '0')}`) : null,
      createdAt: new Date(Date.now() - (60 - i) * 86400000).toISOString()
    });
  }
  return requests;
}

export function getProcurementRequests(filters = {}) {
  let reqs = getCollection('procurementRequests');
  if (!reqs || reqs.length < 60) {
    reqs = generate60ProcurementRequests();
    setCollection('procurementRequests', reqs);
  }

  if (filters.status) reqs = reqs.filter(r => r.status === filters.status);
  return reqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getProcurementRequest(id) {
  const reqs = getProcurementRequests();
  return reqs.find(r => r.id === id) || getItem('procurementRequests', id);
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
