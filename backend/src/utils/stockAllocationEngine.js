const prisma = require('../config/prisma');
const { emitRealtimeNotification } = require('./socketNotifier');

/**
 * Calculates physical on-hand stock for a product from InventoryTransaction.
 */
async function calculateProductPhysicalStock(tx, productId) {
  const transactions = await tx.inventoryTransaction.findMany({
    where: { productId }
  });

  return transactions.reduce((acc, t) => {
    if (['RECEIPT', 'PRODUCTION_OUTPUT', 'ADJUSTMENT_IN'].includes(t.transactionType)) {
      return acc + t.quantity;
    } else if (['ISSUE', 'PRODUCTION_CONSUMPTION', 'ADJUSTMENT_OUT'].includes(t.transactionType)) {
      return acc - t.quantity;
    }
    return acc;
  }, 0);
}

/**
 * Calculates stock availability, reserved allocations, and shortage for a Sales Order.
 */
async function calculateOrderStockAvailability(tx, salesOrderId) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(salesOrderId);
  const order = await tx.salesOrder.findFirst({
    where: isUuid ? { id: salesOrderId } : { orderNumber: salesOrderId },
    include: {
      items: {
        include: {
          product: {
            include: { bom: true }
          }
        }
      }
    }
  });

  if (!order) {
    throw new Error(`Sales order ${salesOrderId} not found.`);
  }

  // Find all earlier pending orders (FIFO priority)
  const earlierOrders = await tx.salesOrder.findMany({
    where: {
      id: { not: order.id },
      createdAt: { lt: order.createdAt },
      status: { in: ['CONFIRMED', 'WAITING_FOR_STOCK', 'READY_FOR_FULFILLMENT'] }
    },
    include: { items: true }
  });

  // Calculate reserved stock by product
  const reservedByProduct = {};
  for (const eo of earlierOrders) {
    for (const item of eo.items) {
      reservedByProduct[item.productId] = (reservedByProduct[item.productId] || 0) + item.quantity;
    }
  }

  let totalShortage = 0;
  const itemsBreakdown = [];

  for (const item of order.items) {
    const physicalStock = await calculateProductPhysicalStock(tx, item.productId);
    const reserved = reservedByProduct[item.productId] || 0;
    const available = Math.max(0, physicalStock - reserved);
    const shortage = Math.max(0, item.quantity - available);
    totalShortage += shortage;

    // Check procurement status for this product
    let procurementStatus = 'In Stock';
    let procurementDetails = null;

    if (shortage > 0) {
      if (item.product.bom) {
        const prodOrder = await tx.productionOrder.findFirst({
          where: { productId: item.productId, status: { in: ['PLANNED', 'IN_PROGRESS'] } },
          orderBy: { createdAt: 'desc' }
        });
        if (prodOrder) {
          procurementStatus = `Manufacturing Order ${prodOrder.productionNumber} (${prodOrder.status})`;
          procurementDetails = { type: 'MANUFACTURING', id: prodOrder.id, number: prodOrder.productionNumber, status: prodOrder.status };
        } else {
          procurementStatus = 'Manufacturing Required';
        }
      } else {
        const poItem = await tx.purchaseOrderItem.findFirst({
          where: { productId: item.productId, purchaseOrder: { status: { in: ['DRAFT', 'SENT'] } } },
          include: { purchaseOrder: true },
          orderBy: { purchaseOrder: { createdAt: 'desc' } }
        });
        if (poItem) {
          procurementStatus = `Purchase Order ${poItem.purchaseOrder.poNumber} (${poItem.purchaseOrder.status})`;
          procurementDetails = { type: 'PURCHASE', id: poItem.purchaseOrder.id, number: poItem.purchaseOrder.poNumber, status: poItem.purchaseOrder.status };
        } else {
          procurementStatus = 'Purchase Required';
        }
      }
    }

    itemsBreakdown.push({
      itemId: item.id,
      productId: item.productId,
      productName: item.product.name,
      productSku: item.product.sku,
      hasBom: !!item.product.bom,
      required: item.quantity,
      physicalStock,
      reservedStock: reserved,
      available,
      shortage,
      procurementStatus,
      procurementDetails
    });
  }

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    isFullyAvailable: totalShortage === 0,
    totalShortage,
    itemsBreakdown
  };
}

/**
 * Process stock check upon order creation or confirmation.
 * Sets WAITING_FOR_STOCK or READY_FOR_FULFILLMENT and triggers auto-procurement if needed.
 */
async function processSalesOrderStockCheck(tx, salesOrderId, userId, io) {
  const availability = await calculateOrderStockAvailability(tx, salesOrderId);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(salesOrderId);

  const order = await tx.salesOrder.findFirst({
    where: isUuid ? { id: salesOrderId } : { orderNumber: salesOrderId },
    include: { items: { include: { product: { include: { bom: true } } } }, customer: true }
  });

  if (!order) return availability;

  let newStatus = order.status;

  if (availability.totalShortage > 0) {
    newStatus = 'WAITING_FOR_STOCK';

    // Auto-create procurement for shortage items
    for (const itemBreakdown of availability.itemsBreakdown) {
      if (itemBreakdown.shortage > 0) {
        if (itemBreakdown.hasBom) {
          // Check if MO exists
          const existingMo = await tx.productionOrder.findFirst({
            where: { productId: itemBreakdown.productId, status: { in: ['PLANNED', 'IN_PROGRESS'] } }
          });
          if (!existingMo) {
            const bom = await tx.bOM.findFirst({ where: { productId: itemBreakdown.productId } });
            if (bom) {
              const count = await tx.productionOrder.count();
              const productionNumber = `PO-${String(count + 1).padStart(6, '0')}`;
              await tx.productionOrder.create({
                data: {
                  productionNumber,
                  productId: itemBreakdown.productId,
                  bomId: bom.id,
                  plannedQuantity: itemBreakdown.shortage,
                  status: 'PLANNED'
                }
              });
            }
          }
        } else {
          // Check if PO exists
          const existingPoItem = await tx.purchaseOrderItem.findFirst({
            where: { productId: itemBreakdown.productId, purchaseOrder: { status: { in: ['DRAFT', 'SENT'] } } }
          });
          if (!existingPoItem) {
            const supplier = await tx.supplier.findFirst();
            if (supplier) {
              const count = await tx.purchaseOrder.count();
              const poNumber = `PO-${String(count + 1).padStart(6, '0')}`;
              const prod = await tx.product.findUnique({ where: { id: itemBreakdown.productId } });
              const unitPrice = prod?.costPrice || 0;
              const lineTotal = itemBreakdown.shortage * Number(unitPrice);

              await tx.purchaseOrder.create({
                data: {
                  poNumber,
                  supplierId: supplier.id,
                  status: 'DRAFT',
                  total: lineTotal,
                  items: {
                    create: [{
                      productId: itemBreakdown.productId,
                      quantity: itemBreakdown.shortage,
                      unitPrice,
                      lineTotal
                    }]
                  }
                }
              });
            }
          }
        }
      }
    }
  } else {
    newStatus = 'READY_FOR_FULFILLMENT';
  }

  // Update order status if changed
  if (order.status !== newStatus) {
    await tx.salesOrder.update({
      where: { id: order.id },
      data: { status: newStatus }
    });

    if (io) {
      emitRealtimeNotification(io, {
        module: 'SALES',
        title: `Sales Order ${order.orderNumber} ${newStatus.replace(/_/g, ' ')}`,
        message: newStatus === 'READY_FOR_FULFILLMENT' 
          ? `All required stock for order #${order.orderNumber} is available.`
          : `Order #${order.orderNumber} is waiting for stock. Procurement initiated.`,
        path: `/sales/${order.id}`,
        severity: newStatus === 'READY_FOR_FULFILLMENT' ? 'INFO' : 'WARNING',
        data: { ...order, status: newStatus }
      });
    }
  }

  return { ...availability, status: newStatus };
}

/**
 * Evaluates pending WAITING_FOR_STOCK Sales Orders sequentially (FIFO)
 * when stock is received into inventory.
 * Automatically marks fulfillable orders as READY_FOR_FULFILLMENT,
 * creates PostgreSQL Notifications & AuditLogs, and emits real-time notifications.
 */
async function evaluateWaitingOrdersStockFulfillment(tx, io, userId) {
  // Query all pending orders waiting for stock, ordered FIFO
  const waitingOrders = await tx.salesOrder.findMany({
    where: { status: 'WAITING_FOR_STOCK' },
    orderBy: { createdAt: 'asc' },
    include: {
      items: { include: { product: true } },
      customer: true
    }
  });

  if (waitingOrders.length === 0) return [];

  // Build current free physical stock map for all relevant products
  const freeStockMap = {};

  const updatedOrders = [];

  for (const order of waitingOrders) {
    let orderCanBeFulfilled = true;

    // Check if free stock is available for all items in this order
    for (const item of order.items) {
      if (freeStockMap[item.productId] === undefined) {
        const physicalStock = await calculateProductPhysicalStock(tx, item.productId);
        
        // Subtract stock allocated to earlier orders in CONFIRMED / READY_FOR_FULFILLMENT status
        const earlierAllocated = await tx.salesOrder.findMany({
          where: {
            id: { not: order.id },
            createdAt: { lt: order.createdAt },
            status: { in: ['CONFIRMED', 'READY_FOR_FULFILLMENT'] }
          },
          include: { items: true }
        });

        let reserved = 0;
        for (const eo of earlierAllocated) {
          for (const ei of eo.items) {
            if (ei.productId === item.productId) {
              reserved += ei.quantity;
            }
          }
        }

        freeStockMap[item.productId] = Math.max(0, physicalStock - reserved);
      }

      if (freeStockMap[item.productId] < item.quantity) {
        orderCanBeFulfilled = false;
        break;
      }
    }

    if (orderCanBeFulfilled) {
      // Deduct from free stock map for subsequent orders in this loop
      for (const item of order.items) {
        freeStockMap[item.productId] -= item.quantity;
      }

      // Update Sales Order status
      await tx.salesOrder.update({
        where: { id: order.id },
        data: { status: 'READY_FOR_FULFILLMENT' }
      });

      // PostgreSQL Duplicate-Safe Notification Persistence
      await tx.notification.upsert({
        where: {
          salesOrderId_type: {
            salesOrderId: order.id,
            type: 'ORDER_READY'
          }
        },
        update: {
          title: `Order #${order.orderNumber} Ready for Fulfillment`,
          message: `Your order #${order.orderNumber} for ${order.items.map(i => `${i.quantity} ${i.product.name}`).join(', ')} is now ready for fulfillment.`,
          path: `/sales/${order.id}`,
          isRead: false
        },
        create: {
          userId: null,
          salesOrderId: order.id,
          type: 'ORDER_READY',
          category: 'ATTENTION_REQUIRED',
          module: 'SALES',
          title: `Order #${order.orderNumber} Ready for Fulfillment`,
          message: `Your order #${order.orderNumber} for ${order.items.map(i => `${i.quantity} ${i.product.name}`).join(', ')} is now ready for fulfillment.`,
          path: `/sales/${order.id}`,
          isRead: false
        }
      });

      // Record Audit Log in PostgreSQL
      let validUserId = userId;
      if (!validUserId) {
        const admin = await tx.user.findFirst({ select: { id: true } });
        validUserId = admin?.id;
      }
      if (validUserId) {
        await tx.auditLog.create({
          data: {
            userId: validUserId,
            action: 'ORDER_READY_FOR_FULFILLMENT',
            entity: 'SalesOrder',
            entityId: order.id
          }
        });
      }

      // Emit Real-Time Socket Notification
      if (io) {
        emitRealtimeNotification(io, {
          module: 'SALES',
          title: `Order #${order.orderNumber} Ready for Fulfillment`,
          message: `Required inventory stock is now available for order #${order.orderNumber}.`,
          path: `/sales/${order.id}`,
          severity: 'INFO',
          data: { ...order, status: 'READY_FOR_FULFILLMENT' }
        });
      }

      updatedOrders.push(order);
    }
  }

  return updatedOrders;
}

module.exports = {
  calculateProductPhysicalStock,
  calculateOrderStockAvailability,
  processSalesOrderStockCheck,
  evaluateWaitingOrdersStockFulfillment
};
