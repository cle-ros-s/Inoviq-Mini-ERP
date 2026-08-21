const prisma = require('../config/prisma');

const getAllBOMs = async (req, res) => {
  try {
    const boms = await prisma.bOM.findMany({
      include: {
        product: { select: { name: true, sku: true, unitOfMeasure: true } },
        items: {
          include: {
            material: { select: { name: true, sku: true, unitOfMeasure: true, costPrice: true } }
          }
        }
      },
      orderBy: { bomNumber: 'asc' }
    });
    res.json({ success: true, data: boms });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const getBOMById = async (req, res) => {
  try {
    const bom = await prisma.bOM.findUnique({
      where: { id: req.params.id },
      include: {
        product: true,
        items: {
          include: {
            material: {
              include: {
                inventory: true
              }
            }
          }
        }
      }
    });
    if (!bom) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'BOM not found' } });
    res.json({ success: true, data: bom });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const createBOM = async (req, res) => {
  try {
    const { productId, version = '1.0', quantityProduced = 1, notes, items = [] } = req.body;
    if (!productId || items.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Product and component items are required' } });
    }

    const existing = await prisma.bOM.findUnique({ where: { productId } });
    if (existing) {
      return res.status(400).json({ success: false, error: { code: 'CONFLICT', message: 'BOM already exists for this product' } });
    }

    const count = await prisma.bOM.count();
    const bomNumber = `BOM-${String(count + 1).padStart(6, '0')}`;

    const bom = await prisma.bOM.create({
      data: {
        bomNumber,
        productId,
        version,
        quantityProduced: parseInt(quantityProduced),
        notes,
        items: {
          create: items.map(item => ({
            materialId: item.materialId,
            quantity: parseFloat(item.quantity),
            unitOfMeasure: item.unitOfMeasure || 'PCS'
          }))
        }
      },
      include: {
        product: true,
        items: { include: { material: true } }
      }
    });

    res.status(201).json({ success: true, data: bom, message: 'BOM created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const checkMaterialAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.query;

    const bom = await prisma.bOM.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            material: {
              include: { inventory: true }
            }
          }
        }
      }
    });

    if (!bom) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'BOM not found' } });

    const multiplier = parseFloat(quantity);
    let canFulfill = true;

    const availability = bom.items.map(item => {
      const required = Number(item.quantity) * multiplier;
      const onHand = item.material.inventory.reduce((acc, tx) => {
        if (['RECEIPT', 'PRODUCTION_OUTPUT', 'ADJUSTMENT_IN'].includes(tx.transactionType)) return acc + tx.quantity;
        if (['ISSUE', 'PRODUCTION_CONSUMPTION', 'ADJUSTMENT_OUT'].includes(tx.transactionType)) return acc - tx.quantity;
        return acc;
      }, 0);

      const shortage = Math.max(0, required - onHand);
      if (shortage > 0) canFulfill = false;

      return {
        materialId: item.materialId,
        materialName: item.material.name,
        sku: item.material.sku,
        unitOfMeasure: item.unitOfMeasure,
        required,
        available: onHand,
        shortage,
        canFulfill: shortage === 0
      };
    });

    res.json({
      success: true,
      data: {
        canFulfill,
        components: availability
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = { getAllBOMs, getBOMById, createBOM, checkMaterialAvailability };
