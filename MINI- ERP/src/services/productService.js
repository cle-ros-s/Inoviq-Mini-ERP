import { getCollection, getItem, createItem, updateItem } from '../data/storage.js';
import { generateId } from '../utils/idGenerator.js';
import { validateSku } from '../utils/validators.js';
import { logAction, ACTIONS } from './auditService.js';
import { getProductInventory, getInventory } from './inventoryService.js';

export function getProducts(filters = {}) {
  let products = getCollection('products');
  if (filters.search) {
    const s = filters.search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s));
  }
  if (filters.category) products = products.filter(p => p.category === filters.category);
  if (filters.status) products = products.filter(p => (filters.status === 'active' ? p.active : !p.active));
  if (filters.procurementType) products = products.filter(p => p.procurementType === filters.procurementType);
  if (filters.procurementStrategy) products = products.filter(p => p.procurementStrategy === filters.procurementStrategy);
  return products;
}

export function getProduct(id) {
  return getItem('products', id);
}

export function createProduct(data, userId) {
  const allProducts = getCollection('products');
  const valid = validateSku(data.sku, allProducts);
  if (!valid.isValid) throw new Error(valid.errors.sku);
  
  const id = generateId('product');
  const newProduct = { ...data, id, active: true, createdAt: new Date().toISOString() };
  createItem('products', newProduct);
  
  // Create inventory record
  createItem('inventory', {
    id: generateId('ID'), // dummy ID or proper inventory generator
    productId: id,
    onHand: data.openingStock || 0,
    reserved: 0,
    updatedAt: new Date().toISOString()
  });
  
  logAction({ action: ACTIONS.PRODUCT_CREATED, entity: 'Product', entityId: id, description: `Product ${data.name} created`, userId });
  return newProduct;
}

export function updateProduct(id, data, userId) {
  const allProducts = getCollection('products');
  const valid = validateSku(data.sku, allProducts, id);
  if (!valid.isValid) throw new Error(valid.errors.sku);
  
  const product = getItem('products', id);
  if (!product) throw new Error('Product not found');
  
  const updated = updateItem('products', id, data);
  logAction({ action: ACTIONS.PRODUCT_UPDATED, entity: 'Product', entityId: id, description: `Product ${data.name} updated`, userId });
  return updated;
}

export function deactivateProduct(id, userId) {
  const updated = updateItem('products', id, { active: false });
  logAction({ action: ACTIONS.PRODUCT_DEACTIVATED, entity: 'Product', entityId: id, description: `Product deactivated`, userId });
  return updated;
}

export function deleteProduct(id, userId) {
  const chk = canDelete(id);
  if (!chk.canDelete) throw new Error(chk.reason);
  // actual delete (not requested in standard soft delete, but implementing as requested)
  // this is a simplified stub, typical ERPs prefer deactivation
  throw new Error('Hard delete is restricted. Please deactivate instead.');
}

export function canDelete(id) {
  const inv = getProductInventory(id);
  if (inv && (inv.onHand > 0 || inv.reserved > 0)) return { canDelete: false, reason: 'Product has active inventory' };
  // Check SO/PO/MO history...
  return { canDelete: true, reason: '' };
}

export function getProductWithInventory(id) {
  const p = getProduct(id);
  if (!p) return null;
  const inv = getProductInventory(id) || { onHand: 0, reserved: 0, freeToUse: 0 };
  return { ...p, inventory: inv };
}

export function getProductsWithInventory() {
  const products = getProducts();
  const invMap = {};
  getInventory().forEach(i => invMap[i.productId] = i);
  return products.map(p => {
    const inv = invMap[p.id] || { onHand: 0, reserved: 0, freeToUse: 0 };
    const freeToUse = (inv.onHand || 0) - (inv.reserved || 0);
    const delStatus = canDelete(p.id);
    return {
      ...p,
      onHand: inv.onHand || 0,
      reserved: inv.reserved || 0,
      freeToUse: freeToUse > 0 ? freeToUse : 0,
      inventory: inv,
      canDelete: delStatus ? delStatus.canDelete : true
    };
  });
}

export const getProductById = getProduct;
