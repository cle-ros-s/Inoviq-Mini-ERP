const prisma = require('../config/prisma');

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

const getAllInvoices = async (req, res) => {
  try {
    const { status, customerId, page = 1, limit = 100 } = req.query;
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
    const { salesOrderId, customerId, customer, salesOrder, amount, status } = req.body;

    let targetCustomer = null;
    let targetSalesOrder = null;

    // 1. Safe resolve Sales Order without Prisma invalid UUID error
    const orderSearchTerm = (salesOrderId || salesOrder || '').trim();
    if (orderSearchTerm) {
      if (isUUID(orderSearchTerm)) {
        targetSalesOrder = await prisma.salesOrder.findUnique({
          where: { id: orderSearchTerm },
          include: { customer: true }
        });
      } else {
        targetSalesOrder = await prisma.salesOrder.findFirst({
          where: { orderNumber: { equals: orderSearchTerm, mode: 'insensitive' } },
          include: { customer: true }
        });
      }
    }

    // 2. Safe resolve Customer without Prisma invalid UUID error
    const customerSearchTerm = (customerId || customer || '').trim();
    if (customerSearchTerm) {
      if (isUUID(customerSearchTerm)) {
        targetCustomer = await prisma.customer.findUnique({ where: { id: customerSearchTerm } });
      } else {
        targetCustomer = await prisma.customer.findFirst({
          where: {
            OR: [
              { customerCode: { equals: customerSearchTerm, mode: 'insensitive' } },
              { companyName: { contains: customerSearchTerm, mode: 'insensitive' } }
            ]
          }
        });
      }
    }

    // Fallback customer from sales order if available
    if (!targetCustomer && targetSalesOrder?.customer) {
      targetCustomer = targetSalesOrder.customer;
    }

    // Ensure target Customer exists
    if (!targetCustomer) {
      const companyName = customer || 'General Client';
      targetCustomer = await prisma.customer.findFirst({
        where: { companyName: { contains: companyName, mode: 'insensitive' } }
      });

      if (!targetCustomer) {
        const cCount = await prisma.customer.count();
        targetCustomer = await prisma.customer.create({
          data: {
            customerCode: `CUST-${String(cCount + 1).padStart(6, '0')}`,
            companyName,
            email: 'billing@client.com',
            phone: '+91-9876543210'
          }
        });
      }
    }

    // Ensure target Sales Order exists
    if (!targetSalesOrder) {
      targetSalesOrder = await prisma.salesOrder.findFirst({
        where: { customerId: targetCustomer.id }
      });
      if (!targetSalesOrder) {
        targetSalesOrder = await prisma.salesOrder.findFirst();
      }
    }

    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;
    const invoiceTotal = amount && !isNaN(parseFloat(amount)) ? parseFloat(amount) : (targetSalesOrder ? parseFloat(targetSalesOrder.total) : 10000);
    const invoiceStatus = (status || 'DRAFT').toUpperCase().replace(' ', '_');

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: targetCustomer.id,
        salesOrderId: targetSalesOrder.id,
        status: ['DRAFT', 'SENT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'UNPAID'].includes(invoiceStatus) ? invoiceStatus : 'DRAFT',
        total: invoiceTotal,
        balanceDue: invoiceTotal
      },
      include: {
        customer: true,
        salesOrder: true
      }
    });

    res.status(201).json({ success: true, data: invoice, id: invoice.id, message: 'Invoice created successfully' });
  } catch (err) {
    console.error('createInvoice backend error:', err);
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
