const prisma = require('../config/prisma');

const getAllProductionOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;

    const [total, orders] = await Promise.all([
      prisma.productionOrder.count({ where }),
      prisma.productionOrder.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          product: true,
          bom: { include: { items: { include: { material: true } } } },
          qualityInspections: true
        }
      })
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const getProductionOrderById = async (req, res) => {
  try {
    const order = await prisma.productionOrder.findUnique({
      where: { id: req.params.id },
      include: {
        product: true,
        bom: { include: { items: { include: { material: true } } } },
        qualityInspections: true
      }
    });
    if (!order) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Production order not found' } });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const createProductionOrder = async (req, res) => {
  try {
    const { productId, plannedQuantity } = req.body;
    if (!productId || !plannedQuantity || plannedQuantity <= 0) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Product and planned quantity > 0 required' } });
    }

    const bom = await prisma.bOM.findUnique({ where: { productId } });
    if (!bom) {
      return res.status(400).json({ success: false, error: { code: 'NO_BOM', message: 'No Bill of Materials found for this product. Create a BOM first.' } });
    }

    const count = await prisma.productionOrder.count();
    const productionNumber = `PROD-${String(count + 1).padStart(6, '0')}`;

    const order = await prisma.productionOrder.create({
      data: {
        productionNumber,
        productId,
        bomId: bom.id,
        plannedQuantity: parseInt(plannedQuantity),
        status: 'PLANNED'
      },
      include: {
        product: true,
        bom: true
      }
    });

    const io = req.app.get('io');
    io?.emit('erp:update', { entity: 'productionOrder', action: 'create', data: order });
    io?.emit('dashboard:refresh');
    io?.emit('data_updated');

    res.status(201).json({ success: true, data: order, message: 'Production order created' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const startProduction = async (req, res) => {
  try {
    const order = await prisma.productionOrder.findUnique({
      where: { id: req.params.id },
      include: {
        bom: { include: { items: { include: { material: { include: { inventory: true } } } } } }
      }
    });

    if (!order) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Production order not found' } });
    if (order.status !== 'PLANNED') return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Only PLANNED orders can be started' } });

    // Check material availability
    for (const item of order.bom.items) {
      const required = Number(item.quantity) * order.plannedQuantity;
      const onHand = item.material.inventory.reduce((acc, tx) => {
        if (['RECEIPT', 'PRODUCTION_OUTPUT', 'ADJUSTMENT_IN'].includes(tx.transactionType)) return acc + tx.quantity;
        if (['ISSUE', 'PRODUCTION_CONSUMPTION', 'ADJUSTMENT_OUT'].includes(tx.transactionType)) return acc - tx.quantity;
        return acc;
      }, 0);

      if (onHand < required) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'MATERIAL_SHORTAGE',
            message: `Shortage of ${item.material.name}. Required: ${required}, Available: ${onHand}`
          }
        });
      }
    }

    // Deduct stock (PRODUCTION_CONSUMPTION)
    await prisma.$transaction(async (tx) => {
      for (const item of order.bom.items) {
        const required = Number(item.quantity) * order.plannedQuantity;
        await tx.inventoryTransaction.create({
          data: {
            productId: item.materialId,
            quantity: Math.ceil(required),
            transactionType: 'PRODUCTION_CONSUMPTION',
            referenceType: 'PRODUCTION_ORDER',
            referenceId: order.productionNumber
          }
        });
      }

      await tx.productionOrder.update({
        where: { id: order.id },
        data: { status: 'IN_PROGRESS' }
      });
    });

    const io = req.app.get('io');
    io?.emit('erp:update', { entity: 'productionOrder', action: 'start', data: order });
    io?.emit('dashboard:refresh');
    io?.emit('data_updated');

    res.json({ success: true, message: 'Production started, raw materials consumed' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const completeProduction = async (req, res) => {
  try {
    const { producedQuantity } = req.body;
    const order = await prisma.productionOrder.findUnique({ where: { id: req.params.id } });

    if (!order) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Production order not found' } });
    if (order.status !== 'IN_PROGRESS') return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Only IN_PROGRESS orders can be completed' } });

    const finalQty = parseInt(producedQuantity) || order.plannedQuantity;

    await prisma.$transaction(async (tx) => {
      // Add output finished goods to inventory
      await tx.inventoryTransaction.create({
        data: {
          productId: order.productId,
          quantity: finalQty,
          transactionType: 'PRODUCTION_OUTPUT',
          referenceType: 'PRODUCTION_ORDER',
          referenceId: order.productionNumber
        }
      });

      // Update production order status
      await tx.productionOrder.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          producedQuantity: finalQty
        }
      });
    });

    const io = req.app.get('io');
    io?.emit('erp:update', { entity: 'productionOrder', action: 'complete', data: order });
    io?.emit('dashboard:refresh');
    io?.emit('data_updated');

    res.json({ success: true, message: 'Production completed! Finished goods added to stock.' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = { getAllProductionOrders, getProductionOrderById, createProductionOrder, startProduction, completeProduction };
