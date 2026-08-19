export function exportToCsv(data, filename, columns) {
  if (!data || !data.length) return;
  const header = columns.map(col => col.label).join(',');
  const rows = data.map(row => {
    return columns.map(col => {
      let val = row[col.key];
      if (val === null || val === undefined) val = '';
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join(',');
  });
  
  const csvContent = [header, ...rows].join('\\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportProducts(products, inventory) {
  const data = products.map(p => {
    const inv = inventory.find(i => i.productId === p.id) || {};
    return { ...p, onHand: inv.onHand || 0, reserved: inv.reserved || 0 };
  });
  exportToCsv(data, 'Products', [
    { key: 'id', label: 'ID' },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'salesPrice', label: 'Sales Price' },
    { key: 'costPrice', label: 'Cost Price' },
    { key: 'onHand', label: 'On Hand' },
    { key: 'reserved', label: 'Reserved' },
    { key: 'active', label: 'Active' }
  ]);
}

export function exportSalesOrders(orders) {
  exportToCsv(orders, 'SalesOrders', [
    { key: 'id', label: 'Order ID' },
    { key: 'customerId', label: 'Customer ID' },
    { key: 'status', label: 'Status' },
    { key: 'deliveryStatus', label: 'Delivery Status' },
    { key: 'createdAt', label: 'Created At' }
  ]);
}

export function exportPurchaseOrders(orders) {
  exportToCsv(orders, 'PurchaseOrders', [
    { key: 'id', label: 'Order ID' },
    { key: 'vendorId', label: 'Vendor ID' },
    { key: 'status', label: 'Status' },
    { key: 'receiptStatus', label: 'Receipt Status' },
    { key: 'createdAt', label: 'Created At' }
  ]);
}

export function exportManufacturingOrders(orders) {
  exportToCsv(orders, 'ManufacturingOrders', [
    { key: 'id', label: 'MO ID' },
    { key: 'productId', label: 'Product ID' },
    { key: 'qty', label: 'Quantity' },
    { key: 'status', label: 'Status' },
    { key: 'plannedDate', label: 'Planned Date' }
  ]);
}

export function exportInventory(inventory) {
  exportToCsv(inventory, 'Inventory', [
    { key: 'productId', label: 'Product ID' },
    { key: 'onHand', label: 'On Hand' },
    { key: 'reserved', label: 'Reserved' },
    { key: 'updatedAt', label: 'Last Updated' }
  ]);
}

export function exportStockLedger(ledger) {
  exportToCsv(ledger, 'StockLedger', [
    { key: 'id', label: 'Ledger ID' },
    { key: 'productId', label: 'Product ID' },
    { key: 'movementType', label: 'Type' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'onHandAfter', label: 'On Hand' },
    { key: 'referenceId', label: 'Ref ID' },
    { key: 'createdAt', label: 'Date' }
  ]);
}

export function exportAuditLogs(logs) {
  exportToCsv(logs, 'AuditLogs', [
    { key: 'id', label: 'Log ID' },
    { key: 'action', label: 'Action' },
    { key: 'entity', label: 'Entity' },
    { key: 'entityId', label: 'Entity ID' },
    { key: 'userId', label: 'User ID' },
    { key: 'createdAt', label: 'Timestamp' }
  ]);
}
