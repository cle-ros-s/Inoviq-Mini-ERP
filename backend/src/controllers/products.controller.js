const prisma = require('../config/prisma');

const getAllProducts = async (req, res) => {
  try {
    const { search, categoryId, active, procurementStrategy, procurementType, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (active !== undefined) where.active = active === 'true';
    if (procurementStrategy) where.procurementStrategy = procurementStrategy;
    if (procurementType) where.procurementType = procurementType;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: {
          category: true,
          bom: true,
          inventory: {
            select: { quantity: true, transactionType: true }
          }
        }
      })
    ]);

    // Calculate on-hand stock for each product
    const productsWithStock = products.map(p => {
      const onHand = (p.inventory || []).reduce((acc, tx) => {
        if (['RECEIPT', 'PRODUCTION_OUTPUT', 'ADJUSTMENT_IN'].includes(tx.transactionType)) {
          return acc + tx.quantity;
        } else if (['ISSUE', 'PRODUCTION_CONSUMPTION', 'ADJUSTMENT_OUT'].includes(tx.transactionType)) {
          return acc - tx.quantity;
        }
        return acc;
      }, 0);

      let stockStatus = 'Healthy';
      if (onHand <= 0) stockStatus = 'Out of Stock';
      else if (onHand <= p.reorderLevel) stockStatus = 'Low Stock';

      const { inventory, ...prodData } = p;
      return {
        ...prodData,
        onHand,
        stockStatus
      };
    });

    res.json({
      success: true,
      data: productsWithStock,
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

const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        bom: {
          include: {
            items: {
              include: { material: true }
            }
          }
        },
        inventory: {
          orderBy: { timestamp: 'desc' },
          take: 20
        }
      }
    });

    if (!product) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });

    const onHand = (product.inventory || []).reduce((acc, tx) => {
      if (['RECEIPT', 'PRODUCTION_OUTPUT', 'ADJUSTMENT_IN'].includes(tx.transactionType)) {
        return acc + tx.quantity;
      } else if (['ISSUE', 'PRODUCTION_CONSUMPTION', 'ADJUSTMENT_OUT'].includes(tx.transactionType)) {
        return acc - tx.quantity;
      }
      return acc;
    }, 0);

    res.json({
      success: true,
      data: { ...product, onHand }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      description,
      categoryId,
      unitOfMeasure = 'PCS',
      salesPrice = 0,
      costPrice = 0,
      reorderLevel = 0,
      procurementStrategy,
      procurementType,
      vendorId,
      openingStock = 0
    } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name and Category are required' } });
    }

    let finalSku = sku;
    if (!finalSku) {
      const count = await prisma.product.count();
      finalSku = `PRD-${String(count + 1).padStart(6, '0')}`;
    }

    const existing = await prisma.product.findUnique({ where: { sku: finalSku } });
    if (existing) {
      return res.status(400).json({ success: false, error: { code: 'CONFLICT', message: 'SKU already exists' } });
    }

    const product = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          sku: finalSku,
          name,
          description,
          categoryId,
          unitOfMeasure,
          salesPrice: parseFloat(salesPrice),
          costPrice: parseFloat(costPrice),
          reorderLevel: parseInt(reorderLevel),
          procurementStrategy,
          procurementType,
          vendorId,
          active: true
        }
      });

      if (parseInt(openingStock) > 0) {
        await tx.inventoryTransaction.create({
          data: {
            productId: prod.id,
            quantity: parseInt(openingStock),
            transactionType: 'RECEIPT',
            referenceType: 'OPENING_STOCK',
            referenceId: 'INITIAL_SETUP'
          }
        });
      }

      return prod;
    });

    res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      description,
      categoryId,
      unitOfMeasure,
      salesPrice,
      costPrice,
      reorderLevel,
      procurementStrategy,
      procurementType,
      vendorId,
      active
    } = req.body;

    const data = {};
    if (sku) data.sku = sku;
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (categoryId) data.categoryId = categoryId;
    if (unitOfMeasure) data.unitOfMeasure = unitOfMeasure;
    if (salesPrice !== undefined) data.salesPrice = parseFloat(salesPrice);
    if (costPrice !== undefined) data.costPrice = parseFloat(costPrice);
    if (reorderLevel !== undefined) data.reorderLevel = parseInt(reorderLevel);
    if (procurementStrategy !== undefined) data.procurementStrategy = procurementStrategy;
    if (procurementType !== undefined) data.procurementType = procurementType;
    if (vendorId !== undefined) data.vendorId = vendorId;
    if (active !== undefined) data.active = active;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data
    });

    res.json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const toggleProductStatus = async (req, res) => {
  try {
    const current = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { active: !current.active }
    });

    res.json({ success: true, data: product, message: `Product ${product.active ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, toggleProductStatus, deleteProduct };
