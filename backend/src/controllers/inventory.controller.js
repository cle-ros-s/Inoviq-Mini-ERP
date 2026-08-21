const prisma = require('../config/prisma');

const getInventoryOverview = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        inventory: true
      },
      orderBy: { name: 'asc' }
    });

    const inventoryList = products.map(p => {
      const onHand = p.inventory.reduce((acc, tx) => {
        if (['RECEIPT', 'PRODUCTION_OUTPUT', 'ADJUSTMENT_IN'].includes(tx.transactionType)) {
          return acc + tx.quantity;
        } else if (['ISSUE', 'PRODUCTION_CONSUMPTION', 'ADJUSTMENT_OUT'].includes(tx.transactionType)) {
          return acc - tx.quantity;
        }
        return acc;
      }, 0);

      let status = 'Healthy';
      if (onHand <= 0) status = 'Out of Stock';
      else if (onHand <= p.reorderLevel) status = 'Low Stock';

      return {
        productId: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category.name,
        unitOfMeasure: p.unitOfMeasure,
        costPrice: p.costPrice,
        salesPrice: p.salesPrice,
        onHand,
        reorderLevel: p.reorderLevel,
        status,
        totalValue: onHand * Number(p.costPrice)
      };
    });

    res.json({ success: true, data: inventoryList });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const getProductInventory = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.productId },
      include: {
        category: true,
        inventory: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!product) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });

    const onHand = product.inventory.reduce((acc, tx) => {
      if (['RECEIPT', 'PRODUCTION_OUTPUT', 'ADJUSTMENT_IN'].includes(tx.transactionType)) {
        return acc + tx.quantity;
      } else if (['ISSUE', 'PRODUCTION_CONSUMPTION', 'ADJUSTMENT_OUT'].includes(tx.transactionType)) {
        return acc - tx.quantity;
      }
      return acc;
    }, 0);

    res.json({
      success: true,
      data: {
        product: { id: product.id, name: product.name, sku: product.sku, unitOfMeasure: product.unitOfMeasure, reorderLevel: product.reorderLevel },
        onHand,
        transactions: product.inventory
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const { productId, transactionType, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (productId) where.productId = productId;
    if (transactionType) where.transactionType = transactionType;

    const [total, transactions] = await Promise.all([
      prisma.inventoryTransaction.count({ where }),
      prisma.inventoryTransaction.findMany({
        where,
        skip,
        take,
        orderBy: { timestamp: 'desc' },
        include: {
          product: { select: { name: true, sku: true, unitOfMeasure: true } }
        }
      })
    ]);

    res.json({
      success: true,
      data: transactions,
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

const receiveGoods = async (req, res) => {
  try {
    const { productId, quantity, referenceType, referenceId } = req.body;
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid product and quantity > 0 required' } });
    }

    const tx = await prisma.inventoryTransaction.create({
      data: {
        productId,
        quantity: parseInt(quantity),
        transactionType: 'RECEIPT',
        referenceType: referenceType || 'MANUAL_RECEIPT',
        referenceId
      }
    });

    res.status(201).json({ success: true, data: tx, message: 'Stock received successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const adjustInventory = async (req, res) => {
  try {
    const { productId, quantity, type, reason } = req.body; // type: 'IN' or 'OUT'
    if (!productId || !quantity || quantity <= 0 || !['IN', 'OUT'].includes(type)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid productId, quantity, and type (IN/OUT) required' } });
    }

    const transactionType = type === 'IN' ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';

    // If OUT, check if enough stock
    if (type === 'OUT') {
      const history = await prisma.inventoryTransaction.findMany({ where: { productId } });
      const currentStock = history.reduce((acc, t) => {
        if (['RECEIPT', 'PRODUCTION_OUTPUT', 'ADJUSTMENT_IN'].includes(t.transactionType)) return acc + t.quantity;
        if (['ISSUE', 'PRODUCTION_CONSUMPTION', 'ADJUSTMENT_OUT'].includes(t.transactionType)) return acc - t.quantity;
        return acc;
      }, 0);

      if (currentStock < parseInt(quantity)) {
        return res.status(400).json({ success: false, error: { code: 'INSUFFICIENT_STOCK', message: `Cannot adjust out ${quantity}. Available: ${currentStock}` } });
      }
    }

    const tx = await prisma.inventoryTransaction.create({
      data: {
        productId,
        quantity: parseInt(quantity),
        transactionType,
        referenceType: 'MANUAL_ADJUSTMENT',
        referenceId: reason || 'Stock Count Adjustment'
      }
    });

    res.status(201).json({ success: true, data: tx, message: 'Stock adjusted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = { getInventoryOverview, getProductInventory, getAllTransactions, receiveGoods, adjustInventory };
