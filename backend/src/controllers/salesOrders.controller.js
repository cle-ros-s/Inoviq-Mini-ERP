const prisma = require('../config/prisma');

const getAllSalesOrders = async (req, res) => {
  try {
    const { search, status, customerId, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { companyName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.salesOrder.count({ where }),
      prisma.salesOrder.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: { include: { product: true } },
          deliveries: true,
          invoices: true
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
    console.error('getAllSalesOrders error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const getSalesOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    const order = await prisma.salesOrder.findFirst({
      where: isUuid ? { id } : { orderNumber: id },
      include: {
        customer: true,
        quotation: true,
        items: { include: { product: { include: { bom: true } } } },
        deliveries: true,
        invoices: { include: { payments: true } }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sales order not found' } });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    console.error('getSalesOrderById error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const createSalesOrder = async (req, res) => {
  try {
    const { customerId, items = [], notes } = req.body;
    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Customer and at least one item are required.' }
      });
    }

    // PostgreSQL Transaction
    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. Verify Customer
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        throw new Error(`Customer with ID "${customerId}" not found.`);
      }

      // 2. Validate Products & Calculate Totals
      const productIds = items.map(i => i.productId).filter(Boolean);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } }
      });
      const productMap = new Map(dbProducts.map(p => [p.id, p]));

      let subtotal = 0;
      const computedItems = [];

      for (const item of items) {
        if (!item.productId) {
          throw new Error('All items must have a valid productId.');
        }
        const dbProd = productMap.get(item.productId);
        if (!dbProd) {
          throw new Error(`Product with ID "${item.productId}" not found.`);
        }

        const quantity = parseInt(item.quantity, 10);
        if (isNaN(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity for ${dbProd.name}. Must be >= 1.`);
        }

        const unitPrice = item.unitPrice !== undefined 
          ? parseFloat(item.unitPrice) 
          : parseFloat(dbProd.salesPrice || 0);

        const lineTotal = quantity * unitPrice;
        subtotal += lineTotal;

        computedItems.push({
          productId: item.productId,
          quantity,
          unitPrice,
          lineTotal
        });
      }

      const count = await tx.salesOrder.count();
      const orderNumber = `SO-${String(count + 1).padStart(6, '0')}`;
      const total = subtotal;

      const order = await tx.salesOrder.create({
        data: {
          orderNumber,
          customerId,
          status: 'DRAFT',
          subtotal,
          total,
          items: {
            create: computedItems
          }
        },
        include: {
          customer: true,
          items: { include: { product: true } }
        }
      });

      // Audit Log if valid user exists
      let validUserId = req.user?.id;
      if (!validUserId) {
        const firstAdmin = await tx.user.findFirst({ select: { id: true } });
        validUserId = firstAdmin?.id;
      }
      if (validUserId) {
        await tx.auditLog.create({
          data: {
            userId: validUserId,
            action: 'SALES_ORDER_CREATED',
            entity: 'SalesOrder',
            entityId: order.id
          }
        });
      }

      return order;
    });

    req.app.get('io')?.emit('erp:update', { entity: 'salesOrder', action: 'create', data: createdOrder });
    req.app.get('io')?.emit('dashboard:refresh');

    res.status(201).json({ success: true, data: createdOrder, message: 'Sales order created successfully' });
  } catch (err) {
    console.error('createSalesOrder error:', err);
    res.status(400).json({ success: false, error: { code: 'CREATION_FAILED', message: err.message } });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const order = await prisma.salesOrder.findFirst({
      where: isUuid ? { id } : { orderNumber: id }
    });

    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sales order not found' } });
    }

    const updated = await prisma.salesOrder.update({
      where: { id: order.id },
      data: { status }
    });

    req.app.get('io')?.emit('erp:update', { entity: 'salesOrder', action: 'update', data: updated });
    req.app.get('io')?.emit('dashboard:refresh');

    res.json({ success: true, data: updated, message: `Order status updated to ${status}` });
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = { getAllSalesOrders, getSalesOrderById, createSalesOrder, updateOrderStatus };
