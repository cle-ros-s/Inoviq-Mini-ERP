const prisma = require('../config/prisma');

const getAllInvoices = async (req, res) => {
  try {
    const { status, customerId, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          salesOrder: true,
          payments: true
        }
      })
    ]);

    res.json({
      success: true,
      data: invoices,
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

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        salesOrder: { include: { items: { include: { product: true } } } },
        payments: { orderBy: { paymentDate: 'desc' } }
      }
    });
    if (!invoice) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const createInvoice = async (req, res) => {
  try {
    const { salesOrderId, customerId } = req.body;
    if (!salesOrderId || !customerId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Sales order and customer required' } });
    }

    const order = await prisma.salesOrder.findUnique({ where: { id: salesOrderId } });
    if (!order) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sales order not found' } });

    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId,
        salesOrderId,
        status: 'ISSUED',
        total: order.total,
        balanceDue: order.total
      },
      include: {
        customer: true,
        salesOrder: true
      }
    });

    res.status(201).json({ success: true, data: invoice, message: 'Invoice created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const recordPayment = async (req, res) => {
  try {
    const { amount, paymentMethod = 'BANK_TRANSFER' } = req.body;
    const payAmount = parseFloat(amount);

    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid payment amount > 0 required' } });
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
    if (!invoice) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });

    if (payAmount > Number(invoice.balanceDue)) {
      return res.status(400).json({ success: false, error: { code: 'EXCESS_PAYMENT', message: `Amount exceeds balance due of ₹${invoice.balanceDue}` } });
    }

    const count = await prisma.payment.count();
    const paymentNumber = `PAY-${String(count + 1).padStart(6, '0')}`;

    const newBalance = Number(invoice.balanceDue) - payAmount;
    const newStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          invoiceId: invoice.id,
          amount: payAmount,
          paymentMethod
        }
      });

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          balanceDue: newBalance,
          status: newStatus
        }
      });

      return { payment, invoice: updatedInvoice };
    });

    res.status(201).json({ success: true, data: result, message: 'Payment recorded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = { getAllInvoices, getInvoiceById, createInvoice, recordPayment };
