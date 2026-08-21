/**
 * Shiv Furniture Works ERP - Master PostgreSQL Seeder
 * Populates real operational enterprise records across all ERP entities:
 * System Users, Customers, Suppliers, Products, Inventory Transactions, BOMs, 
 * Enquiries, Quotations, Sales Orders, Purchase Orders, Production Orders, 
 * Quality Inspections, Delivery Dispatches, Invoices, and Audit Logs.
 */
require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Cleaning old test data and seeding PostgreSQL with complete non-zero Shiv Furniture Works ERP dataset...');

  // Clean existing transactional tables
  try {
    await prisma.auditLog.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.deliveryOrder.deleteMany({});
    await prisma.qualityInspection.deleteMany({});
    await prisma.productionOrder.deleteMany({});
    await prisma.purchaseOrderItem.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});
    await prisma.salesOrderItem.deleteMany({});
    await prisma.salesOrder.deleteMany({});
    await prisma.quotationItem.deleteMany({});
    await prisma.quotation.deleteMany({});
    await prisma.enquiry.deleteMany({});
    await prisma.bOMItem.deleteMany({});
    await prisma.bOM.deleteMany({});
    await prisma.inventoryTransaction.deleteMany({});
    console.log('🧹 Existing operational data cleaned for fresh database seed.');
  } catch (err) {
    console.warn('Cleanup notice:', err.message);
  }

  const passwordHash = await bcrypt.hash('Admin@123', 12);

  // 1. SYSTEM USERS (12 Staff Accounts including Active & Suspended)
  const users = [
    { name: 'System Administrator', email: 'admin@shivfurniture.com', role: 'ADMINISTRATOR', status: 'ACTIVE' },
    { name: 'Sales Executive', email: 'sales@shivfurniture.com', role: 'SALES_EXECUTIVE', status: 'ACTIVE' },
    { name: 'Purchase Manager', email: 'purchase@shivfurniture.com', role: 'PURCHASE_MANAGER', status: 'ACTIVE' },
    { name: 'Inventory Manager', email: 'inventory@shivfurniture.com', role: 'INVENTORY_MANAGER', status: 'ACTIVE' },
    { name: 'Production Manager', email: 'manufacturing@shivfurniture.com', role: 'PRODUCTION_MANAGER', status: 'ACTIVE' },
    { name: 'Quality Manager', email: 'quality@shivfurniture.com', role: 'QUALITY_MANAGER', status: 'ACTIVE' },
    { name: 'Delivery Manager', email: 'delivery@shivfurniture.com', role: 'DELIVERY_MANAGER', status: 'ACTIVE' },
    { name: 'Accounts & Finance', email: 'finance@shivfurniture.com', role: 'ACCOUNTS_FINANCE', status: 'ACTIVE' },
    { name: 'Business Owner', email: 'owner@shivfurniture.com', role: 'BUSINESS_OWNER', status: 'ACTIVE' },
    { name: 'Assistant Store Keeper', email: 'store@shivfurniture.com', role: 'INVENTORY_MANAGER', status: 'ACTIVE' },
    { name: 'Former Sales Associate', email: 'inactive.sales@shivfurniture.com', role: 'SALES_EXECUTIVE', status: 'SUSPENDED' },
    { name: 'Legacy Logistics Agent', email: 'inactive.logistics@shivfurniture.com', role: 'DELIVERY_MANAGER', status: 'SUSPENDED' }
  ];

  const userMap = {};
  for (const u of users) {
    const createdUser = await prisma.user.upsert({
      where: { email: u.email },
      update: { password: passwordHash, status: u.status, role: u.role },
      create: {
        name: u.name,
        email: u.email,
        password: passwordHash,
        role: u.role,
        status: u.status
      }
    });
    userMap[u.role] = createdUser.id;
  }
  console.log('✅ 12 System User Accounts (Active & Suspended) seeded.');

  // 2. PRODUCT CATEGORIES
  const categories = [
    { code: 'CAT-FG', name: 'Finished Goods' },
    { code: 'CAT-RM', name: 'Raw Materials' },
    { code: 'CAT-HW', name: 'Hardware' },
    { code: 'CAT-CS', name: 'Consumables' }
  ];

  const catMap = {};
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { code: cat.code },
      update: { name: cat.name },
      create: cat
    });
    catMap[cat.code] = c.id;
  }
  console.log('✅ System Categories seeded.');

  // 3. SUPPLIERS (15 Suppliers)
  const supplierNames = [
    'ABC Wood Suppliers', 'Furniture Hardware Co.', 'Premium Paint & Chemical', 'Royal Teak Importers',
    'Apex Plywood Industries', 'Mahogany Woods India', 'Sheesham Craft Timber', 'Brass & Steel Fittings Ltd',
    'Supreme Foam & Fabric', 'Veneer Craft Importers', 'Precision Fasteners Co.', 'Lacquers & Stains India',
    'Global Wood Traders', 'Star Metal Handles', 'Urban Upholstery Supplies'
  ];

  const createdSuppliers = [];
  for (let i = 1; i <= 15; i++) {
    const code = `SUP-${String(i).padStart(6, '0')}`;
    const name = supplierNames[i - 1] || `Supplier Partner ${i}`;
    const s = await prisma.supplier.upsert({
      where: { supplierCode: code },
      update: { companyName: name },
      create: {
        supplierCode: code,
        companyName: name,
        name: `Contact Manager ${i}`,
        email: `supplier${i}@timbermarket.com`,
        phone: `+91-9876540${String(i).padStart(3, '0')}`,
        address: `Plot ${i * 12}, Industrial Zone, Area ${i}, Mumbai - 400010`
      }
    });
    createdSuppliers.push(s);
  }
  console.log('✅ 15 Master Suppliers seeded.');

  // 4. CUSTOMERS (25 Customers)
  const customerNames = [
    'ABC Interiors & Decor', 'Modern Living Spaces', 'Office Ergonomics Ltd', 'Grand Heritage Hotel Group',
    'Apex Workspaces Pvt Ltd', 'Skyline Commercial Decor', 'Prestige Home Interiors', 'Zenith Corporate Towers',
    'Royal Suites & Hospitality', 'Urban Nest Furniture', 'Horizon Architects', 'Metropolitan Co-working',
    'Elegance Living Studio', 'Nexus Tech Parks', 'Comfort Zone Residency', 'Silverline Decorators',
    'Highland Resort & Spa', 'Beacon Legal Offices', 'Pinnacle Financial HQ', 'Luxe Space Crafts',
    'Ambience Hospitality', 'Starlight Banquets', 'Vanguard Education Trust', 'Marathon Realty Lounge',
    'Infinity Design Studio'
  ];

  const createdCustomers = [];
  for (let i = 1; i <= 25; i++) {
    const code = `CUST-${String(i).padStart(6, '0')}`;
    const name = customerNames[i - 1] || `Corporate Client ${i}`;
    const c = await prisma.customer.upsert({
      where: { customerCode: code },
      update: { companyName: name },
      create: {
        customerCode: code,
        companyName: name,
        name: `Client Director ${i}`,
        email: `client${i}@corporatehub.com`,
        phone: `+91-9876543${String(i).padStart(3, '0')}`,
        address: `Suite ${i * 101}, Business Tower ${i}, BKC, Mumbai - 400051`
      }
    });
    createdCustomers.push(c);
  }
  console.log('✅ 25 Enterprise Customers seeded.');

  // 5. MASTER PRODUCTS (147 Products with Safety Reorder Levels)
  const furnitureProductTemplates = [
    { name: 'Executive Wooden Table', price: 18500, cost: 9200, cat: 'CAT-FG' },
    { name: 'Wooden Ergonomic Chair', price: 4200, cost: 2100, cat: 'CAT-FG' },
    { name: '6-Seater Teak Dining Table', price: 34000, cost: 16500, cat: 'CAT-FG' },
    { name: 'Luxury Burma Teak Sofa (3-Seater)', price: 48500, cost: 23000, cat: 'CAT-FG' },
    { name: 'Modular Wooden Wardrobe (4-Door)', price: 52000, cost: 26000, cat: 'CAT-FG' },
    { name: 'Solid Sheesham King Bed Frame', price: 38000, cost: 19000, cat: 'CAT-FG' },
    { name: 'Handcrafted Wooden Bookshelf', price: 14500, cost: 7200, cat: 'CAT-FG' },
    { name: 'Teak Wood Credenza Sideboard', price: 26000, cost: 13000, cat: 'CAT-FG' },
    { name: 'Executive Conference Room Table', price: 85000, cost: 42000, cat: 'CAT-FG' },
    { name: 'Artisanal Wooden Coffee Table', price: 8500, cost: 4200, cat: 'CAT-FG' }
  ];

  const rawMaterialTemplates = [
    { name: 'Teak Wood Plank (8ft x 4in)', price: 1400, cost: 950, cat: 'CAT-RM' },
    { name: 'Turned Wooden Legs (Set of 4)', price: 850, cost: 450, cat: 'CAT-RM' },
    { name: 'Laminated Wooden Top Panel 18mm', price: 1650, cost: 900, cat: 'CAT-RM' },
    { name: 'Sheesham Hardwood Board (6ft x 3ft)', price: 2800, cost: 1800, cat: 'CAT-RM' },
    { name: 'Commercial Marine Plywood (19mm)', price: 2100, cost: 1400, cat: 'CAT-RM' }
  ];

  const hardwareTemplates = [
    { name: 'Heavy Duty Frame Screws (Box 100)', price: 250, cost: 120, cat: 'CAT-HW' },
    { name: 'Soft-Close Concealed Hinges (Pair)', price: 380, cost: 190, cat: 'CAT-HW' },
    { name: 'Telescopic Drawer Ball Bearing Slides', price: 650, cost: 320, cat: 'CAT-HW' }
  ];

  const consumableTemplates = [
    { name: 'Clear Gloss PU Lacquer Paint (5L)', price: 1850, cost: 1200, cat: 'CAT-CS' },
    { name: 'Industrial Wood Glue Adhesive (5kg)', price: 1100, cost: 700, cat: 'CAT-CS' }
  ];

  const allTemplates = [...furnitureProductTemplates, ...rawMaterialTemplates, ...hardwareTemplates, ...consumableTemplates];

  const createdProducts = [];
  for (let i = 1; i <= 147; i++) {
    const template = allTemplates[(i - 1) % allTemplates.length];
    const catCode = template.cat;
    const catId = catMap[catCode];

    const skuPrefix = catCode === 'CAT-FG' ? 'FG' : (catCode === 'CAT-RM' ? 'RM' : (catCode === 'CAT-HW' ? 'HW' : 'CS'));
    const sku = `${skuPrefix}-${String(i).padStart(4, '0')}`;
    const name = i <= allTemplates.length ? template.name : `${template.name} Grade-${Math.floor(i / 10) + 1} (Var ${i})`;
    const supplier = createdSuppliers[i % createdSuppliers.length];

    // Set reorder level higher than available stock for 15 products to trigger Low Stock Reorder Alerts
    const reorderLevel = (i <= 15) ? 100 : 15;

    const p = await prisma.product.upsert({
      where: { sku },
      update: {
        name,
        salesPrice: template.price,
        costPrice: template.cost,
        reorderLevel
      },
      create: {
        sku,
        name,
        description: `Operational ${name} for Shiv Furniture Works manufacturing line.`,
        categoryId: catId,
        unitOfMeasure: catCode === 'CAT-HW' ? 'BOX' : (catCode === 'CAT-CS' ? 'LTR' : 'PCS'),
        salesPrice: template.price,
        costPrice: template.cost,
        reorderLevel,
        procurementStrategy: catCode === 'CAT-FG' ? 'MTO' : 'MTS',
        procurementType: catCode === 'CAT-FG' ? 'Manufacturing' : 'Purchase',
        vendorId: catCode !== 'CAT-FG' ? supplier.id : undefined
      }
    });
    createdProducts.push(p);
  }
  console.log('✅ 147 Master Products seeded.');

  // 6. INVENTORY TRANSACTIONS (147 Initial Stock Logs with Low Stock Items)
  for (let i = 0; i < 147; i++) {
    const prod = createdProducts[i];
    // First 15 products have lower stock than reorder level (low stock alert)
    const qty = (i < 15) ? 25 : (Math.floor(Math.random() * 80) + 40);
    await prisma.inventoryTransaction.create({
      data: {
        productId: prod.id,
        quantity: qty,
        transactionType: 'RECEIPT',
        referenceType: 'INITIAL_STOCK',
        referenceId: `BATCH-${String(i + 1).padStart(4, '0')}`
      }
    });
  }
  console.log('✅ 147 Inventory Transactions created (with 15 low stock reorder alerts).');

  // 7. BILL OF MATERIALS (63 BOM Records)
  const createdBoms = [];
  const fgProducts = createdProducts.filter(p => p.categoryId === catMap['CAT-FG']);
  const rmProducts = createdProducts.filter(p => p.categoryId !== catMap['CAT-FG']);

  for (let i = 0; i < fgProducts.length; i++) {
    const fg = fgProducts[i];
    const bomNumber = `BOM-${String(i + 1).padStart(6, '0')}`;

    let bom = await prisma.bOM.findFirst({ where: { productId: fg.id } });
    if (!bom) {
      const rm1 = rmProducts[i % rmProducts.length];
      const rm2 = rmProducts[(i + 1) % rmProducts.length];
      bom = await prisma.bOM.create({
        data: {
          bomNumber,
          productId: fg.id,
          version: '1.0',
          status: 'ACTIVE',
          quantityProduced: 1,
          notes: `Standard manufacturing BOM for ${fg.name}`,
          items: {
            create: [
              { materialId: rm1.id, quantity: 2, unitOfMeasure: 'PCS' },
              { materialId: rm2.id, quantity: 8, unitOfMeasure: 'PCS' }
            ]
          }
        }
      });
    }
    createdBoms.push(bom);
  }
  console.log(`✅ ${createdBoms.length} Master Bills of Materials (BOM) created.`);

  // 8. ENQUIRIES (60 Enquiries) & QUOTATIONS (60 Quotations)
  const enquiryStatuses = ['NEW', 'IN_PROGRESS', 'CONVERTED', 'NEW', 'IN_PROGRESS'];
  for (let i = 1; i <= 60; i++) {
    const enquiryNumber = `ENQ-${String(i).padStart(6, '0')}`;
    const customer = createdCustomers[i % createdCustomers.length];
    const status = enquiryStatuses[i % enquiryStatuses.length];

    await prisma.enquiry.upsert({
      where: { enquiryNumber },
      update: { status },
      create: {
        enquiryNumber,
        customerId: customer.id,
        status,
        notes: `Customer enquiry #${i} for commercial office & resort furniture fitting.`
      }
    });
  }
  console.log('✅ 60 Customer Enquiries seeded.');

  const quotationStatuses = ['DRAFT', 'SENT', 'ACCEPTED', 'CONVERTED', 'DRAFT', 'SENT'];
  const createdQuotations = [];
  for (let i = 1; i <= 60; i++) {
    const quotationNumber = `QTN-${String(i).padStart(6, '0')}`;
    const customer = createdCustomers[i % createdCustomers.length];
    const prod = createdProducts[i % createdProducts.length];
    const status = quotationStatuses[i % quotationStatuses.length];

    const qty = Math.floor(Math.random() * 15) + 5;
    const totalVal = qty * parseFloat(prod.salesPrice);

    const q = await prisma.quotation.upsert({
      where: { quotationNumber },
      update: { status, total: totalVal },
      create: {
        quotationNumber,
        customerId: customer.id,
        status,
        subtotal: totalVal * 0.85,
        total: totalVal,
        items: {
          create: [
            { productId: prod.id, quantity: qty, unitPrice: prod.salesPrice, lineTotal: totalVal }
          ]
        }
      }
    });
    createdQuotations.push(q);
  }
  console.log('✅ 60 Quotations seeded across Draft, Sent, Accepted, and Converted statuses.');

  // 9. SALES ORDERS (147 Real Sales Orders)
  const salesStatuses = ['CONFIRMED', 'DELIVERED', 'DRAFT', 'CONFIRMED', 'DELIVERED'];
  const createdSalesOrders = [];

  for (let i = 1; i <= 147; i++) {
    const orderNumber = `SO-${String(i).padStart(6, '0')}`;
    const customer = createdCustomers[i % createdCustomers.length];
    const prod1 = createdProducts[i % createdProducts.length];
    const prod2 = createdProducts[(i + 3) % createdProducts.length];
    const status = salesStatuses[i % salesStatuses.length];
    const quot = createdQuotations[(i - 1) % createdQuotations.length];

    const q1 = Math.floor(Math.random() * 5) + 1;
    const q2 = Math.floor(Math.random() * 10) + 2;
    const line1 = q1 * parseFloat(prod1.salesPrice);
    const line2 = q2 * parseFloat(prod2.salesPrice);
    const totalVal = line1 + line2;

    const so = await prisma.salesOrder.upsert({
      where: { orderNumber },
      update: { total: totalVal, status },
      create: {
        orderNumber,
        customerId: customer.id,
        quotationId: quot?.id,
        status,
        subtotal: totalVal * 0.85,
        total: totalVal,
        createdAt: new Date(Date.now() - (147 - i) * 86400000),
        items: {
          create: [
            { productId: prod1.id, quantity: q1, unitPrice: prod1.salesPrice, lineTotal: line1 },
            { productId: prod2.id, quantity: q2, unitPrice: prod2.salesPrice, lineTotal: line2 }
          ]
        }
      }
    });
    createdSalesOrders.push(so);
  }
  console.log('✅ 147 Real Sales Orders seeded.');

  // 10. PURCHASE ORDERS (147 Real Purchase Orders)
  const poStatuses = ['CONFIRMED', 'RECEIVED', 'DRAFT', 'CONFIRMED', 'RECEIVED'];
  const createdPurchaseOrders = [];

  for (let i = 1; i <= 147; i++) {
    const poNumber = `PO-${String(i).padStart(6, '0')}`;
    const supplier = createdSuppliers[i % createdSuppliers.length];
    const rmProd = rmProducts[i % rmProducts.length];
    const status = poStatuses[i % poStatuses.length];

    const qty = Math.floor(Math.random() * 50) + 10;
    const lineTotal = qty * parseFloat(rmProd.costPrice);

    const po = await prisma.purchaseOrder.upsert({
      where: { poNumber },
      update: { total: lineTotal, status },
      create: {
        poNumber,
        supplierId: supplier.id,
        status,
        total: lineTotal,
        createdAt: new Date(Date.now() - (147 - i) * 86400000),
        items: {
          create: [
            { productId: rmProd.id, quantity: qty, unitPrice: rmProd.costPrice, lineTotal }
          ]
        }
      }
    });
    createdPurchaseOrders.push(po);
  }
  console.log('✅ 147 Real Purchase Orders seeded.');

  // 11. PRODUCTION ORDERS (147 Manufacturing Runs)
  const moStatuses = ['IN_PROGRESS', 'COMPLETED', 'PLANNED', 'COMPLETED', 'IN_PROGRESS'];
  const createdProductionOrders = [];

  for (let i = 1; i <= 147; i++) {
    const productionNumber = `MO-${String(i).padStart(6, '0')}`;
    const fg = fgProducts[i % fgProducts.length];
    const bom = createdBoms[i % createdBoms.length];
    const status = moStatuses[i % moStatuses.length];

    const planned = Math.floor(Math.random() * 30) + 10;
    const produced = status === 'COMPLETED' ? planned : Math.floor(planned * 0.6);

    const mo = await prisma.productionOrder.upsert({
      where: { productionNumber },
      update: { status, producedQuantity: produced },
      create: {
        productionNumber,
        productId: fg.id,
        bomId: bom?.id,
        plannedQuantity: planned,
        producedQuantity: produced,
        status,
        createdAt: new Date(Date.now() - (147 - i) * 86400000)
      }
    });
    createdProductionOrders.push(mo);
  }
  console.log('✅ 147 Manufacturing Production Orders seeded.');

  // 12. QUALITY INSPECTIONS (147 QC Inspections with Pending Backlog)
  const createdInspections = [];
  for (let i = 1; i <= 147; i++) {
    const inspectionNumber = `QC-${String(i).padStart(6, '0')}`;
    const mo = createdProductionOrders[i - 1];
    const status = (i <= 18) ? 'PENDING' : (i % 10 === 0 ? 'FAILED' : 'PASSED');
    const inspected = mo.producedQuantity || 10;
    const passed = status === 'PASSED' ? inspected : (status === 'FAILED' ? inspected - 2 : 0);
    const failed = status === 'FAILED' ? 2 : 0;

    const qc = await prisma.qualityInspection.upsert({
      where: { inspectionNumber },
      update: { status, passedQuantity: passed, failedQuantity: failed },
      create: {
        inspectionNumber,
        productionOrderId: mo.id,
        productId: mo.productId,
        inspectedQuantity: inspected,
        passedQuantity: passed,
        failedQuantity: failed,
        status,
        remarks: status === 'PASSED' 
          ? `Batch QC Inspection #${i} passed all structural stress tests.`
          : (status === 'FAILED' ? `Batch QC Inspection #${i} flagged 2 items for polish.` : `Awaiting quality audit review.`)
      }
    });
    createdInspections.push(qc);
  }
  console.log('✅ 147 Quality Inspection Logs (with 18 Pending Backlog) seeded.');

  // 13. DISPATCH & LOGISTICS DELIVERIES (147 Shipment Records with Today Dispatches)
  const deliveryStatuses = ['DELIVERED', 'IN_TRANSIT', 'SCHEDULED', 'DELIVERED', 'IN_TRANSIT'];
  const today = new Date();
  for (let i = 1; i <= 147; i++) {
    const deliveryNumber = `DEL-${String(i).padStart(6, '0')}`;
    const so = createdSalesOrders[i - 1];
    const status = deliveryStatuses[i % deliveryStatuses.length];
    // First 15 shipments scheduled for today!
    const schedDate = (i <= 15) ? today : new Date(Date.now() + (i % 2 === 0 ? 86400000 * 2 : -86400000 * 3));

    await prisma.deliveryOrder.upsert({
      where: { deliveryNumber },
      update: { status, scheduledDate: schedDate },
      create: {
        deliveryNumber,
        salesOrderId: so.id,
        customerId: so.customerId,
        status,
        scheduledDate: schedDate,
        createdAt: new Date(Date.now() - (147 - i) * 86400000)
      }
    });
  }
  console.log('✅ 147 Logistics & Delivery Orders (with 15 Today Dispatches) seeded.');

  // 14. INVOICES & PAYMENTS (147 Invoices with Overdue Records)
  const invoiceStatuses = ['PAID', 'PARTIALLY_PAID', 'SENT', 'PAID', 'PARTIALLY_PAID'];
  for (let i = 1; i <= 147; i++) {
    const invoiceNumber = `INV-${String(i).padStart(6, '0')}`;
    const so = createdSalesOrders[i - 1];

    // First 22 invoices set to SENT with overdue balance due
    const status = (i <= 22) ? 'SENT' : invoiceStatuses[i % invoiceStatuses.length];
    const totalVal = parseFloat(so.total);
    const paidVal = status === 'PAID' ? totalVal : (status === 'PARTIALLY_PAID' ? Math.floor(totalVal * 0.6) : 0);
    const balance = Math.max(1000, totalVal - paidVal);

    const inv = await prisma.invoice.upsert({
      where: { invoiceNumber },
      update: { status, balanceDue: balance },
      create: {
        invoiceNumber,
        customerId: so.customerId,
        salesOrderId: so.id,
        status,
        total: totalVal,
        balanceDue: balance,
        createdAt: new Date(Date.now() - (147 - i) * 86400000)
      }
    });

    if (paidVal > 0) {
      await prisma.payment.create({
        data: {
          paymentNumber: `PAY-${String(i).padStart(6, '0')}`,
          invoiceId: inv.id,
          amount: paidVal,
          paymentMethod: i % 2 === 0 ? 'BANK_TRANSFER' : 'CHEQUE'
        }
      });
    }
  }
  console.log('✅ 147 Financial Invoices & Payments (with 22 Overdue Receivables) seeded.');

  // 15. AUDIT LOGS (147 Enterprise Logs)
  const adminId = userMap['ADMINISTRATOR'];
  const salesId = userMap['SALES_EXECUTIVE'];
  const auditEntries = [];

  for (let i = 1; i <= 147; i++) {
    auditEntries.push({
      userId: i % 2 === 0 ? adminId : salesId,
      action: i % 3 === 0 ? 'CREATE_SALES_ORDER' : (i % 3 === 1 ? 'CREATE_PURCHASE_ORDER' : 'QC_INSPECTION_COMPLETED'),
      entity: i % 3 === 0 ? 'SalesOrder' : (i % 3 === 1 ? 'PurchaseOrder' : 'QualityInspection'),
      entityId: createdSalesOrders[i - 1]?.id || 'SYS-AUDIT'
    });
  }

  await prisma.auditLog.createMany({ data: auditEntries });
  console.log('✅ 147 Enterprise Audit Trail Logs seeded.');

  console.log('\n🎉 Shiv Furniture Works ERP Complete Dataset Seeding Finished Successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
