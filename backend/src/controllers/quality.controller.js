const prisma = require('../config/prisma');
const { emitRealtimeNotification } = require('../utils/socketNotifier');

const getAllInspections = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;

    const [total, inspections] = await Promise.all([
      prisma.qualityInspection.count({ where }),
      prisma.qualityInspection.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          product: true,
          productionOrder: true
        }
      })
    ]);

    res.json({
      success: true,
      data: inspections,
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

const getInspectionById = async (req, res) => {
  try {
    const inspection = await prisma.qualityInspection.findUnique({
      where: { id: req.params.id },
      include: {
        product: true,
        productionOrder: true
      }
    });
    if (!inspection) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Inspection not found' } });
    res.json({ success: true, data: inspection });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const createInspection = async (req, res) => {
  try {
    const { productionOrderId, productId, inspectedQuantity } = req.body;
    if (!productionOrderId || !productId || !inspectedQuantity) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Production order, product, and quantity required' } });
    }

    const count = await prisma.qualityInspection.count();
    const inspectionNumber = `QC-${String(count + 1).padStart(6, '0')}`;

    const inspection = await prisma.qualityInspection.create({
      data: {
        inspectionNumber,
        productionOrderId,
        productId,
        inspectedQuantity: parseInt(inspectedQuantity),
        status: 'PENDING'
      },
      include: {
        product: true,
        productionOrder: true
      }
    });

    const io = req.app.get('io');
    emitRealtimeNotification(io, {
      module: 'QUALITY',
      title: `Quality Inspection ${inspection.inspectionNumber} Created`,
      message: `Pending quality check for ${inspection.inspectedQuantity} unit(s) of ${inspection.product?.name || 'Product'}`,
      path: `/quality/${inspection.id}`,
      severity: 'WARNING',
      data: inspection
    });

    res.status(201).json({ success: true, data: inspection, message: 'Quality inspection created' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const submitInspectionResult = async (req, res) => {
  try {
    const { passedQuantity, failedQuantity, remarks } = req.body;
    const passed = parseInt(passedQuantity) || 0;
    const failed = parseInt(failedQuantity) || 0;

    let status = 'PASSED';
    if (failed > 0 && passed > 0) status = 'PARTIALLY_PASSED';
    else if (failed > 0 && passed === 0) status = 'FAILED';

    const inspection = await prisma.qualityInspection.update({
      where: { id: req.params.id },
      data: {
        passedQuantity: passed,
        failedQuantity: failed,
        status,
        remarks
      }
    });

    const io = req.app.get('io');
    emitRealtimeNotification(io, {
      module: 'QUALITY',
      title: `Quality Audit Result: ${inspection.inspectionNumber} ${status}`,
      message: `Passed: ${passed}, Defective/Failed: ${failed}`,
      path: `/quality/${inspection.id}`,
      severity: status === 'FAILED' ? 'CRITICAL' : (status === 'PARTIALLY_PASSED' ? 'WARNING' : 'INFO'),
      data: inspection
    });

    res.json({ success: true, data: inspection, message: `Inspection marked as ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = { getAllInspections, getInspectionById, createInspection, submitInspectionResult };
