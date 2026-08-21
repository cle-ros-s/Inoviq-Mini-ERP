const prisma = require('../config/prisma');

const getAllQuotations = async (req, res) => {
  try {
    const { search, status, customerId, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (search) {
      where.OR = [
        { quotationNumber: { contains: search, mode: 'insensitive' } },
        { customer: { companyName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [total, quotations] = await Promise.all([
      prisma.quotation.count({ where }),
      prisma.quotation.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: { include: { product: true } }
        }
      })
    ]);

    res.json({
      success: true,
      data: quotations,
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

const getQuotationById = async (req, res) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: { include: { product: true } }
      }
    });
    if (!quotation) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Quotation not found' } });
    res.json({ success: true, data: quotation });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const createQuotation = async (req, res) => {
  try {
    const { customerId, discount = 0, items = [] } = req.body;
    if (!customerId || items.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Customer and items are required' } });
    }

    const count = await prisma.quotation.count();
    const quotationNumber = `QUO-${String(count + 1).padStart(6, '0')}`;

    let subtotal = 0;
    const computedItems = items.map(item => {
      const lineTotal = Number(item.quantity) * Number(item.unitPrice);
      subtotal += lineTotal;
      return {
        productId: item.productId,
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        lineTotal
      };
    });

    const discountAmount = (subtotal * Number(discount)) / 100;
    const taxable = subtotal - discountAmount;
    const tax = taxable * 0.18; // 18% GST standard
    const total = taxable + tax;

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId,
        status: 'DRAFT',
        subtotal,
        discount: discountAmount,
        tax,
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

    res.status(201).json({ success: true, data: quotation, message: 'Quotation created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const updateQuotationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const quotation = await prisma.quotation.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json({ success: true, data: quotation, message: `Quotation status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const convertToSalesOrder = async (req, res) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });

    if (!quotation) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Quotation not found' } });

    const count = await prisma.salesOrder.count();
    const orderNumber = `SO-${String(count + 1).padStart(6, '0')}`;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.create({
        data: {
          orderNumber,
          customerId: quotation.customerId,
          quotationId: quotation.id,
          status: 'DRAFT',
          subtotal: quotation.subtotal,
          total: quotation.total,
          items: {
            create: quotation.items.map(i => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              lineTotal: i.lineTotal
            }))
          }
        },
        include: {
          customer: true,
          items: { include: { product: true } }
        }
      });

      await tx.quotation.update({
        where: { id: quotation.id },
        data: { status: 'CONVERTED' }
      });

      return order;
    });

    res.status(201).json({ success: true, data: result, message: 'Converted to Sales Order successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = { getAllQuotations, getQuotationById, createQuotation, updateQuotationStatus, convertToSalesOrder };
