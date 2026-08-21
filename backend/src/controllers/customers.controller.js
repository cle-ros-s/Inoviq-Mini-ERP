const prisma = require('../config/prisma');

const getAllCustomers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { customerCode: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { salesOrders: true, quotations: true, invoices: true } }
        }
      })
    ]);

    res.json({
      success: true,
      data: customers,
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

const getCustomerById = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        salesOrders: { orderBy: { createdAt: 'desc' }, take: 10 },
        quotations: { orderBy: { createdAt: 'desc' }, take: 10 },
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });
    if (!customer) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { companyName, name, email, phone, address, status = 'ACTIVE' } = req.body;
    if (!companyName || !email || !phone) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Company name, email, and phone are required' } });
    }

    const count = await prisma.customer.count();
    const customerCode = `CUS-${String(count + 1).padStart(6, '0')}`;

    const customer = await prisma.customer.create({
      data: { customerCode, companyName, name, email, phone, address, status }
    });

    res.status(201).json({ success: true, data: customer, message: 'Customer created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { companyName, name, email, phone, address, status } = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { companyName, name, email, phone, address, status }
    });
    res.json({ success: true, data: customer, message: 'Customer updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    await prisma.customer.update({
      where: { id: req.params.id },
      data: { status: 'DELETED' }
    });
    res.json({ success: true, message: 'Customer soft deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
