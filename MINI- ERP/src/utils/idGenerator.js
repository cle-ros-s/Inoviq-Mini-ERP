export function generateId(entityType) {
  const counters = getCounters();
  let prefix = '';
  switch (entityType) {
    case 'salesOrder': prefix = 'SO'; break;
    case 'purchaseOrder': prefix = 'PO'; break;
    case 'purchaseReceipt': prefix = 'PR'; break;
    case 'manufacturingOrder': prefix = 'MO'; break;
    case 'workOrder': prefix = 'WO'; break;
    case 'bom': prefix = 'BOM'; break;
    case 'procurementRequest': prefix = 'PROC'; break;
    case 'product': prefix = 'PRD'; break;
    case 'customer': prefix = 'CUST'; break;
    case 'vendor': prefix = 'VEND'; break;
    case 'auditLog': prefix = 'LOG'; break;
    case 'stockLedger': prefix = 'SL'; break;
    case 'user': prefix = 'USR'; break;
    case 'workCenter': prefix = 'WC'; break;
    case 'category': prefix = 'CAT'; break;
    case 'notification': prefix = 'NOTIF'; break;
    default: prefix = 'ID';
  }

  const nextVal = (counters[entityType] || 0) + 1;
  counters[entityType] = nextVal;
  localStorage.setItem('sfw:counters', JSON.stringify(counters));
  return `${prefix}-${String(nextVal).padStart(4, '0')}`;
}

export function resetCounters() {
  localStorage.setItem('sfw:counters', JSON.stringify({}));
}

export function getCounters() {
  const data = localStorage.getItem('sfw:counters');
  return data ? JSON.parse(data) : {};
}

export function setCountersAfterSeed(counters) {
  localStorage.setItem('sfw:counters', JSON.stringify(counters));
}

