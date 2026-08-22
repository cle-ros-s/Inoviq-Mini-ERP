const prisma = require('../config/prisma');
const { emitRealtimeNotification } = require('../utils/socketNotifier');

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

const getAllBOMs = async (req, res) => {
  try {
    const boms = await prisma.bOM.findMany({
      include: {
        product: { select: { id: true, name: true, sku: true, unitOfMeasure: true } },
        items: {
          include: {
            material: { select: { id: true, name: true, sku: true, unitOfMeasure: true, costPrice: true } }
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
    const { id } = req.params;
    const isUuid = isUUID(id);

    const bom = await prisma.bOM.findFirst({
      where: isUuid ? { id } : { bomNumber: { equals: id, mode: 'insensitive' } },
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
    if (!productId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Product and component items are required' } });
    }

    // Check if BOM already exists for this product - if so, update (upsert)
    const existing = await prisma.bOM.findUnique({ where: { productId } });
    if (existing) {
      const updated = await prisma.$transaction(async (tx) => {
        await tx.bOMItem.deleteMany({ where: { bomId: existing.id } });
        return await tx.bOM.update({
          where: { id: existing.id },
          data: {
            version,
            quantityProduced: parseInt(quantityProduced, 10) || 1,
            notes: notes || null,
            items: {
              create: items.map(item => ({
                materialId: item.materialId,
                quantity: parseFloat(item.quantity) || 1,
                unitOfMeasure: item.unitOfMeasure || 'PCS'
              }))
            }
          },
          include: {
            product: true,
            items: { include: { material: true } }
          }
        });
      });

      const io = req.app.get('io');
      emitRealtimeNotification(io, {
        module: 'MANUFACTURING',
        title: `Bill of Materials ${updated.bomNumber} Updated`,
        message: `Updated BoM specification for ${updated.product?.name || 'Product'} (v${updated.version})`,
        path: `/bom/${updated.id}`,
        severity: 'INFO',
        data: updated
      });

      return res.status(200).json({ success: true, data: updated, message: 'BOM updated successfully' });
    }

    const count = await prisma.bOM.count();
    const bomNumber = `BOM-${String(count + 1).padStart(6, '0')}`;

    const bom = await prisma.bOM.create({
      data: {
        bomNumber,
        productId,
        version,
        quantityProduced: parseInt(quantityProduced, 10) || 1,
        notes: notes || null,
        items: {
          create: items.map(item => ({
            materialId: item.materialId,
            quantity: parseFloat(item.quantity) || 1,
            unitOfMeasure: item.unitOfMeasure || 'PCS'
          }))
        }
      },
      include: {
        product: true,
        items: { include: { material: true } }
      }
    });

    const io = req.app.get('io');
    emitRealtimeNotification(io, {
      module: 'MANUFACTURING',
      title: `New Bill of Materials ${bom.bomNumber} Created`,
      message: `Created BoM specification for ${bom.product?.name || 'Product'} (v${bom.version})`,
      path: `/bom/${bom.id}`,
      severity: 'INFO',
      data: bom
    });

    res.status(201).json({ success: true, data: bom, message: 'BOM created successfully' });
  } catch (err) {
    console.error('createBOM error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const updateBOM = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, version, quantityProduced, notes, items, status } = req.body;

    const isUuid = isUUID(id);
    const existing = await prisma.bOM.findFirst({
      where: isUuid ? { id } : { bomNumber: { equals: id, mode: 'insensitive' } }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'BOM not found' } });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (Array.isArray(items)) {
        await tx.bOMItem.deleteMany({ where: { bomId: existing.id } });
      }

      return await tx.bOM.update({
        where: { id: existing.id },
        data: {
          ...(productId ? { productId } : {}),
          ...(version ? { version } : {}),
          ...(quantityProduced ? { quantityProduced: parseInt(quantityProduced, 10) } : {}),
          ...(notes !== undefined ? { notes } : {}),
          ...(status ? { status } : {}),
          ...(Array.isArray(items) ? {
            items: {
              create: items.map(item => ({
                materialId: item.materialId,
                quantity: parseFloat(item.quantity) || 1,
                unitOfMeasure: item.unitOfMeasure || 'PCS'
              }))
            }
          } : {})
        },
        include: {
          product: true,
          items: { include: { material: true } }
        }
      });
    });

    const io = req.app.get('io');
    emitRealtimeNotification(io, {
      module: 'MANUFACTURING',
      title: `Bill of Materials ${updated.bomNumber} Updated`,
      message: `Updated BoM specification for ${updated.product?.name || 'Product'} (v${updated.version})`,
      path: `/bom/${updated.id}`,
      severity: 'INFO',
      data: updated
    });

    res.json({ success: true, data: updated, message: 'BOM updated successfully' });
  } catch (err) {
    console.error('updateBOM error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const checkMaterialAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.query;

    const isUuid = isUUID(id);
    const bom = await prisma.bOM.findFirst({
      where: isUuid ? { id } : { bomNumber: { equals: id, mode: 'insensitive' } },
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

module.exports = { getAllBOMs, getBOMById, createBOM, updateBOM, checkMaterialAvailability };
