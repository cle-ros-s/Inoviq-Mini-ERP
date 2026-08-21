const prisma = require('./src/config/prisma.js');

async function seedOrders() {
  console.log('Seeding initial operational records in PostgreSQL...');

  const products = await prisma.product.findMany();
  const suppliers = await prisma.supplier.findMany();
  const customers = await prisma.customer.findMany();

  const prodMap = new Map(products.map(p => [p.sku, p]));
  const supMap = new Map(suppliers.map(s => [s.supplierCode, s]));
  const custMap = new Map(customers.map(c => [c.customerCode, c]));

  // 1. Seed BOM for Wooden Chair if not exists
  const chairProd = prodMap.get('WD-CHR-001');
  const legsProd = prodMap.get('WD-LEG-001');
  const screwProd = prodMap.get('HW-SCR-001');

  let chairBom;
  if (chairProd && legsProd && screwProd) {
    chairBom = await prisma.bOM.findUnique({ where: { productId: chairProd.id } });
    if (!chairBom) {
      chairBom = await prisma.bOM.create({
        data: {
          bomNumber: 'BOM-000001',
          productId: chairProd.id,
          version: '1.0',
          status: 'ACTIVE',
          quantityProduced: 1,
          items: {
            create: [
              { materialId: legsProd.id, quantity: 1, unitOfMeasure: 'SET' },
              { materialId: screwProd.id, quantity: 8, unitOfMeasure: 'PCS' }
            ]
          }
        }
      });
      console.log('✅ Seeded BOM-000001 for Wooden Ergonomic Chair');
    }
  }

  // 2. Seed Sample Purchase Order
  const woodSup = supMap.get('SUP-000001');
  const teakProd = prodMap.get('RAW-TK-001');
  if (woodSup && teakProd) {
    const poCount = await prisma.purchaseOrder.count();
    if (poCount === 0) {
      await prisma.purchaseOrder.create({
        data: {
          poNumber: 'PO-000001',
          supplierId: woodSup.id,
          status: 'CONFIRMED',
          total: 17000,
          items: {
            create: [
              { productId: teakProd.id, quantity: 20, unitPrice: 850, lineTotal: 17000 }
            ]
          }
        }
      });
      console.log('✅ Seeded PO-000001 for ABC Wood Suppliers');
    }
  }

  // 3. Seed Sample Sales Order
  const decorCust = custMap.get('CUST-000001');
  const tableProd = prodMap.get('WD-TBL-001');
  if (decorCust && tableProd) {
    const soCount = await prisma.salesOrder.count();
    if (soCount === 0) {
      await prisma.salesOrder.create({
        data: {
          orderNumber: 'SO-000001',
          customerId: decorCust.id,
          status: 'CONFIRMED',
          subtotal: 17000,
          total: 17000,
          items: {
            create: [
              { productId: tableProd.id, quantity: 2, unitPrice: 8500, lineTotal: 17000 }
            ]
          }
        }
      });
      console.log('✅ Seeded SO-000001 for ABC Interiors');
    }
  }

  // 4. Seed Sample Production Order
  if (chairProd && chairBom) {
    const moCount = await prisma.productionOrder.count();
    if (moCount === 0) {
      await prisma.productionOrder.create({
        data: {
          productionNumber: 'MO-000001',
          productId: chairProd.id,
          bomId: chairBom.id,
          plannedQuantity: 10,
          status: 'CONFIRMED'
        }
      });
      console.log('✅ Seeded MO-000001 for Chair Production');
    }
  }

  console.log('🎉 Operational records ready.');
}

seedOrders().catch(console.error).finally(() => prisma.$disconnect());
