import { getCollection } from '../data/storage.js';
import { getInventory } from './inventoryService.js';
import { isDelayed } from './manufacturingService.js';

export function getKPIs() {
  const sos = getCollection('salesOrders');
  const pos = getCollection('purchaseOrders');
  const mos = getCollection('manufacturingOrders');
  const prods = getCollection('products');
  const procs = getCollection('procurementRequests');
  const inv = getInventory();
  
  let reservedStock = 0, freeStock = 0, lowStockProducts = 0;
  inv.forEach(i => {
    reservedStock += (i.reserved || 0);
    freeStock += i.freeToUse;
    const p = prods.find(pr => pr.id === i.productId);
    if (p && i.onHand <= (p.reorderLevel || 0)) lowStockProducts++;
  });

  return {
    totalSalesOrders: sos.length,
    pendingDeliveries: sos.filter(o => o.deliveryStatus === 'Pending' || o.deliveryStatus === 'Partially Delivered').length,
    manufacturingOrders: mos.length,
    delayedOrders: mos.filter(m => isDelayed(m)).length,
    purchaseOrders: pos.length,
    partialReceipts: pos.filter(p => p.receiptStatus === 'Partially Received').length,
    totalProducts: prods.length,
    lowStockProducts,
    reservedStock,
    freeStock,
    pendingProcurement: procs.filter(p => p.status === 'Pending').length
  };
}

export function getSalesChartData(days = 7) {
  const sos = getCollection('salesOrders');
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const ordersToday = sos.filter(o => o.createdAt.split('T')[0] === date);
    const value = ordersToday.reduce((sum, o) => {
      return sum + o.lines.reduce((s, l) => s + (l.qty * l.unitPrice), 0);
    }, 0);
    data.push({ date, orders: ordersToday.length, value });
  }
  return data;
}

export function getInventoryChartData() {
  const inv = getInventory();
  const prods = getCollection('products');
  return inv.map(i => {
    const p = prods.find(pr => pr.id === i.productId);
    return {
      name: p ? p.name : i.productId,
      onHand: i.onHand,
      reserved: i.reserved,
      freeToUse: i.freeToUse
    };
  });
}

export function getManufacturingChartData() {
  const mos = getCollection('manufacturingOrders');
  const statuses = ['Draft', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
  return statuses.map(s => ({
    status: s,
    count: mos.filter(m => m.status === s).length
  }));
}

export function getPurchaseChartData() {
  const pos = getCollection('purchaseOrders');
  const statuses = ['Draft', 'Confirmed', 'Partially Received', 'Fully Received', 'Cancelled'];
  return statuses.map(s => ({
    status: s,
    count: pos.filter(p => p.status === s || (s === 'Partially Received' && p.receiptStatus === 'Partially Received') || (s === 'Fully Received' && p.receiptStatus === 'Fully Received')).length
  }));
}
