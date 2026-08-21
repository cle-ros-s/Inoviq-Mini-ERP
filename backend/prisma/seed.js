/**
 * Database Seed Script
 * Creates standard ERP user roles, categories, suppliers, and factory products in shiv_furniture_erp.
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
  console.log('🌱 Seeding PostgreSQL database with ERP users, categories, suppliers, and products...');

  const passwordHash = await bcrypt.hash('Admin@123', 12);

  const users = [
    { name: 'System Administrator', email: 'admin@shivfurniture.com', role: 'ADMINISTRATOR' },
    { name: 'Sales Executive', email: 'sales@shivfurniture.com', role: 'SALES_EXECUTIVE' },
    { name: 'Purchase Manager', email: 'purchase@shivfurniture.com', role: 'PURCHASE_MANAGER' },
    { name: 'Inventory Manager', email: 'inventory@shivfurniture.com', role: 'INVENTORY_MANAGER' },
    { name: 'Production Manager', email: 'manufacturing@shivfurniture.com', role: 'PRODUCTION_MANAGER' },
    { name: 'Quality Manager', email: 'quality@shivfurniture.com', role: 'QUALITY_MANAGER' },
    { name: 'Delivery Manager', email: 'delivery@shivfurniture.com', role: 'DELIVERY_MANAGER' },
    { name: 'Accounts & Finance', email: 'finance@shivfurniture.com', role: 'ACCOUNTS_FINANCE' },
    { name: 'Business Owner', email: 'owner@shivfurniture.com', role: 'BUSINESS_OWNER' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: passwordHash, status: 'ACTIVE', role: u.role },
      create: {
        name: u.name,
        email: u.email,
        password: passwordHash,
        role: u.role,
        status: 'ACTIVE'
      }
    });
  }
  console.log('✅ Standard users ready.');

  // Create system categories
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
  console.log('✅ System categories initialized.');

  // Create standard suppliers
  const suppliers = [
    {
      supplierCode: 'SUP-000001',
      companyName: 'ABC Wood Suppliers',
      name: 'Ramesh Patel',
      email: 'supply@abcwood.com',
      phone: '+91-9876540001',
      address: '12 Timber Market, Lakdi Bunder, Mumbai - 400010'
    },
    {
      supplierCode: 'SUP-000002',
      companyName: 'Furniture Hardware Co.',
      name: 'Anil Gupta',
      email: 'orders@fhco.com',
      phone: '+91-9876540002',
      address: '45 Industrial Estate, Andheri East, Mumbai - 400093'
    },
    {
      supplierCode: 'SUP-000003',
      companyName: 'Premium Paint & Chemical Suppliers',
      name: 'Suresh Mehta',
      email: 'sales@premiumpaints.com',
      phone: '+91-9876540003',
      address: '88 Chemical Zone, TTC Industrial Area, Navi Mumbai - 400705'
    }
  ];

  for (const sup of suppliers) {
    await prisma.supplier.upsert({
      where: { supplierCode: sup.supplierCode },
      update: sup,
      create: sup
    });
  }
  console.log('✅ Standard suppliers initialized.');

  // Create standard customers
  const customers = [
    {
      customerCode: 'CUST-000001',
      companyName: 'ABC Interiors & Decor',
      name: 'Pooja Verma',
      email: 'info@abcinteriors.com',
      phone: '+91-9876543210',
      address: 'Suite 204, Crystal Plaza, Bandra West, Mumbai - 400050'
    },
    {
      customerCode: 'CUST-000002',
      companyName: 'Modern Living Spaces',
      name: 'Karan Mehra',
      email: 'orders@modernliving.com',
      phone: '+91-9876543211',
      address: 'Shop 15, Furniture Hub, Lower Parel, Mumbai - 400013'
    },
    {
      customerCode: 'CUST-000003',
      companyName: 'Office Ergonomics Ltd',
      name: 'Sunil Rao',
      email: 'purchase@officeergo.com',
      phone: '+91-9876543212',
      address: 'Tower B, Cyber City, Sector 29, Gurugram - 122002'
    }
  ];

  for (const cust of customers) {
    await prisma.customer.upsert({
      where: { customerCode: cust.customerCode },
      update: cust,
      create: cust
    });
  }
  console.log('✅ Standard customers initialized.');

  // Create standard products
  const products = [
    {
      sku: 'WD-TBL-001',
      name: 'Executive Wooden Table',
      description: 'Solid teak wood office executive desk with lacquer finish',
      categoryId: catMap['CAT-FG'],
      unitOfMeasure: 'PCS',
      salesPrice: 8500,
      costPrice: 4200,
      reorderLevel: 5,
      procurementStrategy: 'MTO',
      procurementType: 'Manufacturing'
    },
    {
      sku: 'WD-CHR-001',
      name: 'Wooden Ergonomic Chair',
      description: 'Comfortable handcrafted wooden chair with upholstered seat',
      categoryId: catMap['CAT-FG'],
      unitOfMeasure: 'PCS',
      salesPrice: 3200,
      costPrice: 1600,
      reorderLevel: 10,
      procurementStrategy: 'MTS',
      procurementType: 'Manufacturing'
    },
    {
      sku: 'DN-TBL-001',
      name: '6-Seater Dining Table',
      description: 'Solid Sheesham wood dining table for home & restaurants',
      categoryId: catMap['CAT-FG'],
      unitOfMeasure: 'PCS',
      salesPrice: 12000,
      costPrice: 5800,
      reorderLevel: 3,
      procurementStrategy: 'MTO',
      procurementType: 'Manufacturing'
    },
    {
      sku: 'WD-LEG-001',
      name: 'Turned Wooden Legs (Set of 4)',
      description: 'Pre-turned solid teak wood table and chair legs',
      categoryId: catMap['CAT-RM'],
      unitOfMeasure: 'SET',
      salesPrice: 600,
      costPrice: 320,
      reorderLevel: 50,
      procurementStrategy: 'MTS',
      procurementType: 'Purchase'
    },
    {
      sku: 'WD-TOP-001',
      name: 'Laminated Wooden Top Panel',
      description: '18mm water-resistant ply with teak veneer lamination',
      categoryId: catMap['CAT-RM'],
      unitOfMeasure: 'PCS',
      salesPrice: 1200,
      costPrice: 650,
      reorderLevel: 25,
      procurementStrategy: 'MTS',
      procurementType: 'Purchase'
    },
    {
      sku: 'HW-SCR-001',
      name: 'Heavy Duty Assembly Screws (Pack of 100)',
      description: 'Zinc-plated wood screws 2-inch for frame joining',
      categoryId: catMap['CAT-HW'],
      unitOfMeasure: 'BOX',
      salesPrice: 150,
      costPrice: 80,
      reorderLevel: 100,
      procurementStrategy: 'MTS',
      procurementType: 'Purchase'
    },
    {
      sku: 'WD-PNT-001',
      name: 'Polyurethane Wood Varnish & Paint (5L)',
      description: 'Clear gloss PU lacquer for wooden furniture surface protection',
      categoryId: catMap['CAT-CS'],
      unitOfMeasure: 'LTR',
      salesPrice: 1400,
      costPrice: 950,
      reorderLevel: 15,
      procurementStrategy: 'MTS',
      procurementType: 'Purchase'
    }
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: prod,
      create: prod
    });
  }
  console.log('✅ Factory products initialized.');

  console.log('\n🎉 Seed complete! Real PostgreSQL data ready for products and suppliers.\n');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
