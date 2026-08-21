const prisma = require('../config/prisma');

const getAllSuppliers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { supplierCode: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, suppliers] = await Promise.all([
      prisma.supplier.count({ where }),
      prisma.supplier.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { purchaseOrders: true } }
        }
      })
    ]);

    res.json({
      success: true,
      data: suppliers,
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

const getSupplierById = async (req, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id },
      include: {
        purchaseOrders: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });
    if (!supplier) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    res.json({ success: true, data: supplier });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { companyName, name, email, phone, address, status = 'ACTIVE' } = req.body;
    if (!companyName || !email || !phone) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Company name, email, and phone are required' } });
    }

    const count = await prisma.supplier.count();
    const supplierCode = `SUP-${String(count + 1).padStart(6, '0')}`;

    const supplier = await prisma.supplier.create({
      data: { supplierCode, companyName, name, email, phone, address, status }
    });

    res.status(201).json({ success: true, data: supplier, message: 'Supplier created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { companyName, name, email, phone, address, status } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: { companyName, name, email, phone, address, status }
    });
    res.json({ success: true, data: supplier, message: 'Supplier updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    await prisma.supplier.update({
      where: { id: req.params.id },
      data: { status: 'DELETED' }
    });
    res.json({ success: true, message: 'Supplier soft deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = { getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
