const prisma = require('../config/prisma');

const getAllPurchaseOrders = async (req, res) => {
  try {
    const { search, status, supplierId, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    if (search) {
      where.OR = [
        { poNumber: { contains: search, mode: 'insensitive' } },
        { supplier: { companyName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.purchaseOrder.count({ where }),
      prisma.purchaseOrder.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: true,
          items: { include: { product: true } }
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
    console.error('getAllPurchaseOrders error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const order = await prisma.purchaseOrder.findFirst({
      where: isUuid ? { id } : { poNumber: id },
      include: {
        supplier: true,
        items: { include: { product: true } }
      }
    });
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Purchase order not found' } });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    console.error('getPurchaseOrderById error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const createPurchaseOrder = async (req, res) => {
  try {
    const { supplierId, items = [] } = req.body;
    if (!supplierId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Supplier and at least one item are required.' }
      });
    }

    // Run within a PostgreSQL Transaction
    const createdPo = await prisma.$transaction(async (tx) => {
      // 1. Validate Supplier in PostgreSQL
      const supplier = await tx.supplier.findUnique({ where: { id: supplierId } });
      if (!supplier) {
        throw new Error(`Supplier with ID "${supplierId}" does not exist in the database.`);
      }

      // 2. Validate all Products in PostgreSQL
      const productIds = items.map(i => i.productId).filter(Boolean);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } }
      });
      const productMap = new Map(dbProducts.map(p => [p.id, p]));

      let grandTotal = 0;
      const validatedItems = [];

      for (const item of items) {
        if (!item.productId) {
          throw new Error('All items must have a valid productId.');
        }
        const dbProd = productMap.get(item.productId);
        if (!dbProd) {
          throw new Error(`Product with ID "${item.productId}" does not exist in the database.`);
        }

        const quantity = parseInt(item.quantity, 10);
        if (isNaN(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity for product ${dbProd.name}. Must be >= 1.`);
        }

        const unitPrice = item.costPrice !== undefined 
          ? parseFloat(item.costPrice) 
          : (item.unitPrice !== undefined ? parseFloat(item.unitPrice) : parseFloat(dbProd.costPrice || 0));

        if (isNaN(unitPrice) || unitPrice < 0) {
          throw new Error(`Invalid unit price for product ${dbProd.name}.`);
        }

        const lineTotal = quantity * unitPrice;
        grandTotal += lineTotal;

        validatedItems.push({
          productId: item.productId,
          quantity,
          unitPrice,
          lineTotal
        });
      }

      // 3. Generate Sequential PO Number
      const count = await tx.purchaseOrder.count();
      const poNumber = `PO-${String(count + 1).padStart(6, '0')}`;

      // 4. Create Purchase Order record
      const po = await tx.purchaseOrder.create({
        data: {
          poNumber,
          supplierId,
          status: 'DRAFT',
          total: grandTotal,
          items: {
            create: validatedItems
          }
        },
        include: {
          supplier: true,
          items: { include: { product: true } }
        }
      });

      // 5. Create Audit Log if valid user exists
      let validUserId = req.user?.id;
      if (!validUserId) {
        const firstAdmin = await tx.user.findFirst({ select: { id: true } });
        validUserId = firstAdmin?.id;
      }
      if (validUserId) {
        await tx.auditLog.create({
          data: {
            userId: validUserId,
            action: 'PURCHASE_ORDER_CREATED',
            entity: 'PurchaseOrder',
            entityId: po.id
          }
        });
      }

      return po;
    });

    const io = req.app.get('io');
    io?.emit('erp:update', { entity: 'purchaseOrder', action: 'create', data: createdPo });
    io?.emit('dashboard:refresh');
    io?.emit('data_updated');

    res.status(201).json({ success: true, data: createdPo, message: 'Purchase order created successfully' });
  } catch (err) {
    console.error('createPurchaseOrder error:', err);
    res.status(400).json({ success: false, error: { code: 'CREATION_FAILED', message: err.message } });
  }
};

const receivePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const po = await prisma.purchaseOrder.findFirst({
      where: isUuid ? { id } : { poNumber: id },
      include: { items: true }
    });

    if (!po) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'PO not found' } });
    }

    await prisma.$transaction(async (tx) => {
      // Create stock transactions for each item
      for (const item of po.items) {
        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            transactionType: 'RECEIPT',
            quantity: item.quantity,
            referenceType: 'PURCHASE_ORDER',
            referenceId: po.poNumber
          }
        });
      }

      // Update PO Status
      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status: 'RECEIVED' }
      });
    });

    const io = req.app.get('io');
    io?.emit('erp:update', { entity: 'purchaseOrder', action: 'receive', data: po });
    io?.emit('dashboard:refresh');
    io?.emit('data_updated');

    res.json({ success: true, message: 'Purchase order received and stock updated' });
  } catch (err) {
    console.error('receivePurchaseOrder error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  receivePurchaseOrder
};
