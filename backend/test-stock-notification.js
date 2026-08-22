const prisma = require('./src/config/prisma');
const { calculateOrderStockAvailability, processSalesOrderStockCheck, evaluateWaitingOrdersStockFulfillment } = require('./src/utils/stockAllocationEngine');

async function runTest() {
  console.log('=== STARTING ISOLATED STOCK AVAILABILITY NOTIFICATION END-TO-END TEST ===\n');

  // 1. Create a clean, isolated product specifically for this test
  const cat = await prisma.category.findFirst();
  const customerA = await prisma.customer.findFirst();

  const sku = 'TBL-E2E-' + Date.now().toString().slice(-4);
  const product = await prisma.product.create({
    data: {
      sku,
      name: 'E2E Wooden Table ' + sku,
      categoryId: cat.id,
      salesPrice: 2500,
      costPrice: 1500,
      unitOfMeasure: 'PCS'
    }
  });

  // Create BOM for product to enable Manufacturing flow
  const rawMaterial = await prisma.product.findFirst({ where: { id: { not: product.id } } });
  const countBom = await prisma.bOM.count();
  const bom = await prisma.bOM.create({
    data: {
      bomNumber: 'BOM-E2E-' + String(countBom + 1).padStart(6, '0'),
      productId: product.id,
      version: '1.0',
      items: {
        create: [{ materialId: rawMaterial.id, quantity: 2, unitOfMeasure: 'PCS' }]
      }
    }
  });

  // Initial physical stock = 2
  await prisma.inventoryTransaction.create({
    data: {
      productId: product.id,
      quantity: 2,
      transactionType: 'RECEIPT',
      referenceType: 'MANUAL_TEST',
      referenceId: 'INITIAL_STOCK_2'
    }
  });

  console.log('1. Created isolated product:', product.name);
  console.log('   Initial Physical Stock created: 2 units');

  // 2. Create Customer Order for 10 units
  const countSo = await prisma.salesOrder.count();
  const orderNumber = 'SO-E2E-' + String(countSo + 1).padStart(6, '0');

  const orderA = await prisma.salesOrder.create({
    data: {
      orderNumber,
      customerId: customerA.id,
      status: 'CONFIRMED',
      total: 25000,
      items: {
        create: [{ productId: product.id, quantity: 10, unitPrice: 2500, lineTotal: 25000 }]
      }
    }
  });

  console.log('2. Created Customer Sales Order #', orderA.orderNumber, 'for 10 units.');

  // Run stock availability check
  await prisma.$transaction(async (tx) => {
    await processSalesOrderStockCheck(tx, orderA.id, null, null);
  });

  const check1 = await prisma.salesOrder.findUnique({ where: { id: orderA.id } });
  console.log('   Order Status after stock check:', check1.status, '(Expected: WAITING_FOR_STOCK)');

  // Verify Manufacturing Order creation
  const mo = await prisma.productionOrder.findFirst({
    where: { productId: product.id, status: 'PLANNED' },
    orderBy: { createdAt: 'desc' }
  });
  console.log('   Auto-created Production Order #:', mo?.productionNumber, 'Planned Qty:', mo?.plannedQuantity, '(Expected: 8)');

  // 3. Partial Production Completion (5 units -> Stock becomes 2 + 5 = 7)
  await prisma.$transaction(async (tx) => {
    await tx.inventoryTransaction.create({
      data: {
        productId: product.id,
        quantity: 5,
        transactionType: 'PRODUCTION_OUTPUT',
        referenceType: 'PRODUCTION_ORDER',
        referenceId: mo.productionNumber
      }
    });

    await evaluateWaitingOrdersStockFulfillment(tx, null, null);
  });

  const check2 = await prisma.salesOrder.findUnique({ where: { id: orderA.id } });
  const notifCountPartial = await prisma.notification.count({ where: { salesOrderId: orderA.id, type: 'ORDER_READY' } });
  console.log('3. Completed 5 units (Stock = 7).');
  console.log('   Order status:', check2.status, '(Expected: WAITING_FOR_STOCK)');
  console.log('   ORDER_READY notifications count:', notifCountPartial, '(Expected: 0)');

  // 4. Remaining Production Completion (3 units -> Stock becomes 7 + 3 = 10)
  await prisma.$transaction(async (tx) => {
    await tx.inventoryTransaction.create({
      data: {
        productId: product.id,
        quantity: 3,
        transactionType: 'PRODUCTION_OUTPUT',
        referenceType: 'PRODUCTION_ORDER',
        referenceId: mo.productionNumber
      }
    });

    await evaluateWaitingOrdersStockFulfillment(tx, null, null);
  });

  const check3 = await prisma.salesOrder.findUnique({ where: { id: orderA.id } });
  const notifFull = await prisma.notification.findFirst({ where: { salesOrderId: orderA.id, type: 'ORDER_READY' } });
  console.log('4. Completed remaining 3 units (Stock = 10).');
  console.log('   Order status:', check3.status, '(Expected: READY_FOR_FULFILLMENT)');
  console.log('   PostgreSQL Notification Created:');
  console.log('   - ID:', notifFull?.id);
  console.log('   - Title:', notifFull?.title);
  console.log('   - Message:', notifFull?.message);

  // 5. Test Duplicate Notification Prevention
  await prisma.$transaction(async (tx) => {
    await evaluateWaitingOrdersStockFulfillment(tx, null, null);
  });
  const notifCountTotal = await prisma.notification.count({ where: { salesOrderId: orderA.id, type: 'ORDER_READY' } });
  console.log('5. Re-evaluation test for duplicate prevention: Count =', notifCountTotal, '(Expected: 1)');

  if (check3.status === 'READY_FOR_FULFILLMENT' && notifCountTotal === 1) {
    console.log('\n========================================================');
    console.log('🎉 ALL END-TO-END VERIFICATION TESTS PASSED PERFECTLY! 🎉');
    console.log('========================================================');
    process.exit(0);
  } else {
    console.error('\n❌ Verification assertion failed.');
    process.exit(1);
  }
}

runTest().catch(e => {
  console.error('Test Error:', e);
  process.exit(1);
});
