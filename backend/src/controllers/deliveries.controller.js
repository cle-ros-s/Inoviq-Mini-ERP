const prisma = require('../config/prisma');
const { emitRealtimeNotification } = require('../utils/socketNotifier');

const getAllDeliveries = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;

    const [total, deliveries] = await Promise.all([
      prisma.deliveryOrder.count({ where }),
      prisma.deliveryOrder.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          salesOrder: { include: { items: { include: { product: true } } } }
        }
      })
    ]);

    res.json({
      success: true,
      data: deliveries,
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

const getDeliveryById = async (req, res) => {
  try {
    const delivery = await prisma.deliveryOrder.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        salesOrder: { include: { items: { include: { product: true } } } }
      }
    });
    if (!delivery) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Delivery not found' } });
    res.json({ success: true, data: delivery });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const createDelivery = async (req, res) => {
  try {
    const { salesOrderId, customerId, scheduledDate } = req.body;
    if (!salesOrderId || !customerId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Sales order and customer required' } });
    }

    const count = await prisma.deliveryOrder.count();
    const deliveryNumber = `DEL-${String(count + 1).padStart(6, '0')}`;

    const delivery = await prisma.deliveryOrder.create({
      data: {
        deliveryNumber,
        salesOrderId,
        customerId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        status: 'PLANNED'
      },
      include: {
        customer: true,
        salesOrder: true
      }
    });

    const io = req.app.get('io');
    emitRealtimeNotification(io, {
      module: 'LOGISTICS',
      title: `Delivery Dispatch ${delivery.deliveryNumber} Scheduled`,
      message: `Scheduled shipment for customer ${delivery.customer?.companyName || 'Customer'}`,
      path: `/delivery/${delivery.id}`,
      severity: 'INFO',
      data: delivery
    });

    res.status(201).json({ success: true, data: delivery, message: 'Delivery scheduled' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body; // DISPATCHED, DELIVERED
    const delivery = await prisma.deliveryOrder.findUnique({
      where: { id: req.params.id },
      include: { salesOrder: { include: { items: true } } }
    });

    if (!delivery) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Delivery not found' } });

    await prisma.$transaction(async (tx) => {
      // If marking DELIVERED, issue stock out
      if (status === 'DELIVERED' && delivery.status !== 'DELIVERED') {
        for (const item of delivery.salesOrder.items) {
          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              transactionType: 'ISSUE',
              referenceType: 'DELIVERY_ORDER',
              referenceId: delivery.deliveryNumber
            }
          });
        }
        await tx.salesOrder.update({
          where: { id: delivery.salesOrderId },
          data: { status: 'DELIVERED' }
        });
      }

      await tx.deliveryOrder.update({
        where: { id: delivery.id },
        data: { status }
      });
    });

    const io = req.app.get('io');
    emitRealtimeNotification(io, {
      module: 'LOGISTICS',
      title: `Shipment ${delivery.deliveryNumber} ${status}`,
      message: status === 'DELIVERED' ? 'Delivery completed and customer order fulfilled.' : `Shipment status updated to ${status}`,
      path: `/delivery/${delivery.id}`,
      severity: 'INFO',
      data: delivery
    });

    res.json({ success: true, message: `Delivery marked as ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = { getAllDeliveries, getDeliveryById, createDelivery, updateDeliveryStatus };
