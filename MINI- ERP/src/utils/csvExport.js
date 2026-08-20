export function exportToCSV(data, filename = 'export.csv') {
  if (!data || !data.length) return;
  const keys = Object.keys(data[0]);
  const csvContent = [
    keys.join(','),
    ...data.map(row => keys.map(k => `"${(row[k] || '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportProducts(products) {
  exportToCSV(products, 'products.csv');
}

export function exportInventory(data) {
  exportToCSV(data, 'inventory.csv');
}

export function exportSalesOrders(orders) {
  exportToCSV(orders, 'sales-orders.csv');
}

export function exportPurchaseOrders(orders) {
  exportToCSV(orders, 'purchase-orders.csv');
}

export function exportManufacturingOrders(orders) {
  exportToCSV(orders, 'manufacturing-orders.csv');
}

export function exportStockLedger(ledger) {
  exportToCSV(ledger, 'stock-ledger.csv');
}

export function exportAuditLogs(logs) {
  exportToCSV(logs, 'audit-logs.csv');
}

