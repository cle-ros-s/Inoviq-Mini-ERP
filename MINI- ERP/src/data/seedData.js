import { createItem } from './storage.js';
import { setCountersAfterSeed } from '../utils/idGenerator.js';

export function seedDatabase() {
  const now = new Date().toISOString();
  
  // Categories
  createItem('categories', { id: 'CAT-0001', name: 'Finished Goods', createdAt: now });
  createItem('categories', { id: 'CAT-0002', name: 'Raw Materials', createdAt: now });
  createItem('categories', { id: 'CAT-0003', name: 'Hardware', createdAt: now });
  createItem('categories', { id: 'CAT-0004', name: 'Consumables', createdAt: now });

  // Work Centers
  createItem('workCenters', { id: 'WC-0001', name: 'Assembly Line', description: 'For product assembly and construction', createdAt: now });
  createItem('workCenters', { id: 'WC-0002', name: 'Paint Floor', description: 'Sanding, staining, and painting operations', createdAt: now });
  createItem('workCenters', { id: 'WC-0003', name: 'Packaging Unit', description: 'Final quality check and packaging', createdAt: now });

  // Vendors
  createItem('vendors', { id: 'VEND-0001', name: 'ABC Wood Suppliers', contact: '+91-9876540001', email: 'supply@abcwood.com', createdAt: now });
  createItem('vendors', { id: 'VEND-0002', name: 'Furniture Hardware Co.', contact: '+91-9876540002', email: 'orders@fhco.com', createdAt: now });
  createItem('vendors', { id: 'VEND-0003', name: 'Premium Paint Suppliers', contact: '+91-9876540003', email: 'sales@premiumpaints.com', createdAt: now });

  // Customers
  createItem('customers', { id: 'CUST-0001', name: 'ABC Interiors', phone: '+91-9876543210', email: 'info@abcinteriors.com', createdAt: now });
  createItem('customers', { id: 'CUST-0002', name: 'Modern Homes', phone: '+91-9876543211', email: 'orders@modernhomes.com', createdAt: now });
  createItem('customers', { id: 'CUST-0003', name: 'Office Solutions', phone: '+91-9876543212', email: 'purchase@officesolutions.com', createdAt: now });
  createItem('customers', { id: 'CUST-0004', name: 'Royal Furniture', phone: '+91-9876543213', email: 'buy@royalfurniture.com', createdAt: now });

  // Products
  createItem('products', { id: 'PRD-0001', name: 'Wooden Table', sku: 'WD-TBL-001', category: 'CAT-0001', salesPrice: 8500, costPrice: 4200, reorderLevel: 5, procurementStrategy: 'MTO', procurementType: 'Manufacturing', bomId: 'BOM-0001', active: true, createdAt: now });
  createItem('products', { id: 'PRD-0002', name: 'Wooden Chair', sku: 'WD-CHR-001', category: 'CAT-0001', salesPrice: 3200, costPrice: 1600, reorderLevel: 10, procurementStrategy: 'MTS', procurementType: 'Manufacturing', bomId: 'BOM-0002', active: true, createdAt: now });
  createItem('products', { id: 'PRD-0003', name: 'Office Chair', sku: 'OF-CHR-001', category: 'CAT-0001', salesPrice: 5500, costPrice: 2800, reorderLevel: 8, procurementStrategy: 'MTS', procurementType: 'Manufacturing', bomId: null, active: true, createdAt: now });
  createItem('products', { id: 'PRD-0004', name: 'Dining Table', sku: 'DN-TBL-001', category: 'CAT-0001', salesPrice: 12000, costPrice: 5800, reorderLevel: 3, procurementStrategy: 'MTO', procurementType: 'Manufacturing', bomId: 'BOM-0003', active: true, createdAt: now });
  createItem('products', { id: 'PRD-0005', name: 'Wooden Cabinet', sku: 'WD-CAB-001', category: 'CAT-0001', salesPrice: 9500, costPrice: 4500, reorderLevel: 4, procurementStrategy: 'MTO', procurementType: 'Manufacturing', bomId: null, active: true, createdAt: now });
  
  createItem('products', { id: 'PRD-0006', name: 'Wooden Legs', sku: 'WD-LEG-001', category: 'CAT-0002', salesPrice: 150, costPrice: 80, reorderLevel: 50, procurementStrategy: 'MTS', procurementType: 'Purchase', vendorId: 'VEND-0001', active: true, createdAt: now });
  createItem('products', { id: 'PRD-0007', name: 'Wooden Top', sku: 'WD-TOP-001', category: 'CAT-0002', salesPrice: 600, costPrice: 320, reorderLevel: 20, procurementStrategy: 'MTS', procurementType: 'Purchase', vendorId: 'VEND-0001', active: true, createdAt: now });
  createItem('products', { id: 'PRD-0008', name: 'Screws', sku: 'HW-SCR-001', category: 'CAT-0003', salesPrice: 5, costPrice: 2, reorderLevel: 200, procurementStrategy: 'MTS', procurementType: 'Purchase', vendorId: 'VEND-0002', active: true, createdAt: now });
  createItem('products', { id: 'PRD-0009', name: 'Wood Paint', sku: 'WD-PNT-001', category: 'CAT-0004', salesPrice: 350, costPrice: 180, reorderLevel: 30, procurementStrategy: 'MTS', procurementType: 'Purchase', vendorId: 'VEND-0003', active: true, createdAt: now });
  createItem('products', { id: 'PRD-0010', name: 'Wood Panel', sku: 'WD-PNL-001', category: 'CAT-0002', salesPrice: 800, costPrice: 420, reorderLevel: 25, procurementStrategy: 'MTS', procurementType: 'Purchase', vendorId: 'VEND-0001', active: true, createdAt: now });

  // BoMs
  createItem('boms', {
    id: 'BOM-0001', productId: 'PRD-0001', version: '1.0', status: 'active', createdAt: now,
    components: [
      { productId: 'PRD-0006', qty: 4, unit: 'pcs' },
      { productId: 'PRD-0007', qty: 1, unit: 'pcs' },
      { productId: 'PRD-0008', qty: 12, unit: 'pcs' }
    ],
    operations: [
      { seq: 1, name: 'Assembly', workCenter: 'WC-0001', duration: 60 },
      { seq: 2, name: 'Painting', workCenter: 'WC-0002', duration: 30 },
      { seq: 3, name: 'Packing', workCenter: 'WC-0003', duration: 20 }
    ]
  });

  createItem('boms', {
    id: 'BOM-0002', productId: 'PRD-0002', version: '1.0', status: 'active', createdAt: now,
    components: [
      { productId: 'PRD-0006', qty: 4, unit: 'pcs' },
      { productId: 'PRD-0010', qty: 2, unit: 'pcs' },
      { productId: 'PRD-0008', qty: 8, unit: 'pcs' }
    ],
    operations: [
      { seq: 1, name: 'Assembly', workCenter: 'WC-0001', duration: 45 },
      { seq: 2, name: 'Painting', workCenter: 'WC-0002', duration: 25 },
      { seq: 3, name: 'Packing', workCenter: 'WC-0003', duration: 15 }
    ]
  });

  createItem('boms', {
    id: 'BOM-0003', productId: 'PRD-0004', version: '1.0', status: 'active', createdAt: now,
    components: [
      { productId: 'PRD-0006', qty: 6, unit: 'pcs' },
      { productId: 'PRD-0007', qty: 2, unit: 'pcs' },
      { productId: 'PRD-0008', qty: 20, unit: 'pcs' },
      { productId: 'PRD-0009', qty: 1, unit: 'litre' }
    ],
    operations: [
      { seq: 1, name: 'Assembly', workCenter: 'WC-0001', duration: 90 },
      { seq: 2, name: 'Painting', workCenter: 'WC-0002', duration: 45 },
      { seq: 3, name: 'Packing', workCenter: 'WC-0003', duration: 25 }
    ]
  });

  // Users
  createItem('users', { id: 'USR-0001', name: 'Admin', email: 'admin@shivfurniture.com', password: 'Admin@123', role: 'admin', active: true, createdAt: now });
  createItem('users', { id: 'USR-0002', name: 'Sales User', email: 'sales@shivfurniture.com', password: 'Sales@123', role: 'sales', active: true, createdAt: now });
  createItem('users', { id: 'USR-0003', name: 'Purchase User', email: 'purchase@shivfurniture.com', password: 'Purchase@123', role: 'purchase', active: true, createdAt: now });
  createItem('users', { id: 'USR-0004', name: 'Manufacturing User', email: 'manufacturing@shivfurniture.com', password: 'Manufacturing@123', role: 'manufacturing', active: true, createdAt: now });
  createItem('users', { id: 'USR-0005', name: 'Inventory Manager', email: 'inventory@shivfurniture.com', password: 'Inventory@123', role: 'inventory', active: true, createdAt: now });
  createItem('users', { id: 'USR-0006', name: 'Business Owner', email: 'owner@shivfurniture.com', password: 'Owner@123', role: 'owner', active: true, createdAt: now });

  const getPastDate = (daysAgo) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  const getFutureDate = (daysAhead) => new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

  // Sales Orders
  createItem('salesOrders', {
    id: 'SO-0001', customerId: 'CUST-0002', status: 'Fully Delivered', deliveryStatus: 'Fully Delivered',
    lines: [{ id: 'SOL-01', productId: 'PRD-0002', qty: 5, unitPrice: 3200, discount: 0, tax: 18 }],
    createdAt: getPastDate(7), confirmedAt: getPastDate(7), deliveredAt: getPastDate(6)
  });
  createItem('salesOrders', {
    id: 'SO-0002', customerId: 'CUST-0003', status: 'Confirmed', deliveryStatus: 'Pending',
    lines: [{ id: 'SOL-02', productId: 'PRD-0003', qty: 10, unitPrice: 5500, discount: 5, tax: 18 }],
    createdAt: getPastDate(3), confirmedAt: getPastDate(3)
  });
  createItem('salesOrders', {
    id: 'SO-0003', customerId: 'CUST-0004', status: 'Draft', deliveryStatus: 'Pending',
    lines: [{ id: 'SOL-03', productId: 'PRD-0004', qty: 3, unitPrice: 12000, discount: 0, tax: 18 }],
    createdAt: getPastDate(1)
  });
  createItem('salesOrders', {
    id: 'SO-0004', customerId: 'CUST-0001', status: 'Draft', deliveryStatus: 'Pending',
    lines: [{ id: 'SOL-04', productId: 'PRD-0001', qty: 10, unitPrice: 8500, discount: 0, tax: 18 }],
    createdAt: now
  });

  // Purchase Orders
  createItem('purchaseOrders', {
    id: 'PO-0001', vendorId: 'VEND-0002', status: 'Fully Received', receiptStatus: 'Fully Received',
    lines: [{ id: 'POL-01', productId: 'PRD-0008', qty: 500, costPrice: 2, tax: 18 }],
    createdAt: getPastDate(10)
  });
  createItem('purchaseOrders', {
    id: 'PO-0002', vendorId: 'VEND-0001', status: 'Confirmed', receiptStatus: 'Partially Received',
    lines: [
      { id: 'POL-02', productId: 'PRD-0006', qty: 100, costPrice: 80, tax: 18 },
      { id: 'POL-03', productId: 'PRD-0007', qty: 30, costPrice: 320, tax: 18 }
    ],
    previouslyReceived: [
      { productId: 'PRD-0006', qty: 50 },
      { productId: 'PRD-0007', qty: 15 }
    ],
    createdAt: getPastDate(5), confirmedAt: getPastDate(4)
  });

  // Purchase Receipts
  createItem('purchaseReceipts', {
    id: 'PR-0001', purchaseOrderId: 'PO-0002',
    lines: [
      { productId: 'PRD-0006', qty: 50 },
      { productId: 'PRD-0007', qty: 15 }
    ],
    createdAt: getPastDate(2)
  });

  // Manufacturing Orders
  createItem('manufacturingOrders', {
    id: 'MO-0001', productId: 'PRD-0002', qty: 20, bomId: 'BOM-0002', status: 'Completed', plannedDate: getPastDate(5), assignee: 'USR-0004',
    createdAt: getPastDate(8), completedAt: getPastDate(4)
  });
  createItem('manufacturingOrders', {
    id: 'MO-0002', productId: 'PRD-0001', qty: 3, bomId: 'BOM-0001', status: 'Confirmed', plannedDate: getFutureDate(1), assignee: 'USR-0004',
    createdAt: getPastDate(2), confirmedAt: getPastDate(1)
  });

  // Work Orders for MO-0002
  createItem('workOrders', { id: 'WO-0001', moId: 'MO-0002', seq: 1, name: 'Assembly', workCenter: 'WC-0001', duration: 60, status: 'Pending', createdAt: getPastDate(1) });
  createItem('workOrders', { id: 'WO-0002', moId: 'MO-0002', seq: 2, name: 'Painting', workCenter: 'WC-0002', duration: 30, status: 'Pending', createdAt: getPastDate(1) });
  createItem('workOrders', { id: 'WO-0003', moId: 'MO-0002', seq: 3, name: 'Packing', workCenter: 'WC-0003', duration: 20, status: 'Pending', createdAt: getPastDate(1) });

  // Inventory
  const initialInv = [
    { id: 'INV-01', productId: 'PRD-0001', onHand: 2, reserved: 0, updatedAt: now },
    { id: 'INV-02', productId: 'PRD-0002', onHand: 100, reserved: 0, updatedAt: now },
    { id: 'INV-03', productId: 'PRD-0003', onHand: 45, reserved: 10, updatedAt: now },
    { id: 'INV-04', productId: 'PRD-0004', onHand: 5, reserved: 0, updatedAt: now },
    { id: 'INV-05', productId: 'PRD-0005', onHand: 8, reserved: 0, updatedAt: now },
    { id: 'INV-06', productId: 'PRD-0006', onHand: 200, reserved: 12, updatedAt: now },
    { id: 'INV-07', productId: 'PRD-0007', onHand: 50, reserved: 3, updatedAt: now },
    { id: 'INV-08', productId: 'PRD-0008', onHand: 500, reserved: 36, updatedAt: now },
    { id: 'INV-09', productId: 'PRD-0009', onHand: 60, reserved: 0, updatedAt: now },
    { id: 'INV-10', productId: 'PRD-0010', onHand: 80, reserved: 0, updatedAt: now }
  ];
  initialInv.forEach(inv => createItem('inventory', inv));

  // Settings
  createItem('settings', {
    id: 'SETTINGS', companyName: 'Shiv Furniture Works', companyAddress: '123 Industrial Area, Furniture Nagar, Mumbai - 400001',
    currency: 'INR', currencySymbol: '₹', theme: 'light', density: 'comfortable'
  });

  // Set counters to correct next values after seeding
  setCountersAfterSeed({
    salesOrder: 4, purchaseOrder: 2, purchaseReceipt: 1, manufacturingOrder: 2,
    workOrder: 6, bom: 3, procurementRequest: 0, product: 10, customer: 4,
    vendor: 3, auditLog: 15, stockLedger: 20, user: 6, workCenter: 3,
    category: 4, notification: 5
  });


  // Create some initial audit logs and ledger entries
  for (let i = 1; i <= 15; i++) {
    createItem('auditLogs', {
      id: `LOG-${String(i).padStart(4, '0')}`, action: 'Action', entity: 'System', entityId: 'N/A',
      description: `System seeded ${i}`, userId: 'USR-0001', createdAt: now
    });
  }
  
  // Create 20 Stock Ledger entries
  for (let i = 1; i <= 20; i++) {
    createItem('stockLedger', {
      id: `SL-${String(i).padStart(4, '0')}`, productId: 'PRD-0001', movementType: 'Manual Adjustment',
      quantity: 0, onHandBefore: 2, onHandAfter: 2, reservedBefore: 0, reservedAfter: 0,
      referenceType: 'Seed', referenceId: 'SEED', userId: 'USR-0001', description: 'Opening Stock', createdAt: now
    });
  }
}
