import { getCollection, getItem, createItem, updateItem } from '../data/storage.js';
import { generateId } from '../utils/idGenerator.js';
import { logAction, ACTIONS } from './auditService.js';
import { reserveStock, consumeComponents, produceFinishedGoods, getInventory } from './inventoryService.js';
import { getActiveBomForProduct, getBomComponents, getBomOperations } from './bomService.js';
import { calcMaterialAvailability } from '../utils/calculations.js';
import { markCompleted } from './procurementService.js';

export function getManufacturingOrders(filters = {}) {
  return getCollection('manufacturingOrders').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getManufacturingOrder(id) {
  return getItem('manufacturingOrders', id);
}

export function createManufacturingOrder(data, userId) {
  const id = generateId('manufacturingOrder');
  const mo = { ...data, id, status: 'Draft', createdAt: new Date().toISOString() };
  createItem('manufacturingOrders', mo);
  logAction({ action: ACTIONS.MANUFACTURING_CREATED, entity: 'ManufacturingOrder', entityId: id, description: 'MO Created', userId });
  return mo;
}

export function createDraftFromProcurement(procurementRequest, userId) {
  const bom = getActiveBomForProduct(procurementRequest.productId);
  return createManufacturingOrder({
    productId: procurementRequest.productId,
    qty: procurementRequest.shortageQty,
    bomId: bom ? bom.id : null,
    sourceType: 'Procurement',
    sourceProcurementId: procurementRequest.id
  }, userId);
}

export function getMaterialAvailability(moId) {
  const mo = getManufacturingOrder(moId);
  if (!mo || !mo.bomId) return [];
  const comps = getBomComponents(mo.bomId).map(c => ({ ...c, requiredQty: c.qty * mo.qty }));
  return calcMaterialAvailability(comps, getInventory());
}

export function confirmManufacturingOrder(id, userId) {
  const mo = getManufacturingOrder(id);
  if (!mo || mo.status !== 'Draft') throw new Error('Invalid status transition');
  if (!mo.bomId) throw new Error('No BoM assigned');
  
  const avail = getMaterialAvailability(id);
  avail.forEach(c => {
    const reserveQty = Math.min(c.required, c.available);
    if (reserveQty > 0) {
      reserveStock(c.productId, reserveQty, 'ManufacturingOrder', id, userId);
    }
  });
  
  const ops = getBomOperations(mo.bomId);
  ops.forEach(op => {
    createItem('workOrders', {
      id: generateId('workOrder'), moId: id, ...op, status: 'Pending', createdAt: new Date().toISOString()
    });
  });
  
  const updated = updateItem('manufacturingOrders', id, { status: 'Confirmed', confirmedAt: new Date().toISOString() });
  logAction({ action: ACTIONS.MANUFACTURING_CREATED, entity: 'ManufacturingOrder', entityId: id, description: 'MO Confirmed', userId });
  return updated;
}

export function startManufacturingOrder(id, userId) {
  const mo = getManufacturingOrder(id);
  if (!mo || mo.status !== 'Confirmed') throw new Error('Invalid status transition');
  const updated = updateItem('manufacturingOrders', id, { status: 'In Progress' });
  logAction({ action: ACTIONS.MANUFACTURING_STARTED, entity: 'ManufacturingOrder', entityId: id, description: 'MO Started', userId });
  return updated;
}

export function completeManufacturingOrder(id, userId) {
  const mo = getManufacturingOrder(id);
  if (!mo || mo.status !== 'In Progress') throw new Error('Invalid status transition');
  
  const wos = getWorkOrders(id);
  const incomplete = wos.find(w => w.status !== 'Completed' && w.status !== 'Skipped');
  if (incomplete) throw new Error('All Work Orders must be Completed or Skipped');
  
  const avail = getMaterialAvailability(id);
  const shortages = avail.find(c => c.shortage > 0);
  if (shortages) throw new Error('Material shortage remains');
  
  const comps = getBomComponents(mo.bomId);
  consumeComponents(comps, mo.qty, id, userId);
  produceFinishedGoods(mo.productId, mo.qty, id, userId);
  
  const updated = updateItem('manufacturingOrders', id, { status: 'Completed', completedAt: new Date().toISOString() });
  logAction({ action: ACTIONS.MANUFACTURING_COMPLETED, entity: 'ManufacturingOrder', entityId: id, description: 'MO Completed', userId });
  
  if (mo.sourceProcurementId) markCompleted(mo.sourceProcurementId, userId);
  return updated;
}

export function cancelManufacturingOrder(id, userId) {
  const mo = getManufacturingOrder(id);
  if (!mo || (mo.status !== 'Draft' && mo.status !== 'Confirmed')) throw new Error('Invalid status transition');
  
  const updated = updateItem('manufacturingOrders', id, { status: 'Cancelled' });
  logAction({ action: ACTIONS.MANUFACTURING_CANCELLED, entity: 'ManufacturingOrder', entityId: id, description: 'MO Cancelled', userId });
  return updated;
}

export function getWorkOrders(moId) {
  return getCollection('workOrders').filter(w => w.moId === moId);
}

export function updateWorkOrder(id, updates, userId) {
  return updateItem('workOrders', id, updates);
}

export function isDelayed(mo) {
  if (!mo.plannedDate) return false;
  return new Date(mo.plannedDate) < new Date() && !['Completed', 'Cancelled'].includes(mo.status);
}

export const getManufacturingOrderById = getManufacturingOrder;
export function updateManufacturingOrder(id, data) { return updateItem('manufacturingOrders', id, data); }
