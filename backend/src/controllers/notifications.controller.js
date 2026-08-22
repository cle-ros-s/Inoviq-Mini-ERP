const prisma = require('../config/prisma');

const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Fetch user-specific notifications and general system notifications from PostgreSQL
    const where = userId ? {
      OR: [
        { userId: userId },
        { userId: null }
      ]
    } : {};

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        salesOrder: {
          select: { id: true, orderNumber: true, status: true, total: true }
        },
        product: {
          select: { id: true, name: true, sku: true }
        }
      }
    });

    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error('getAllNotifications error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    const where = userId ? {
      isRead: false,
      OR: [
        { userId: userId },
        { userId: null }
      ]
    } : { isRead: false };

    const count = await prisma.notification.count({ where });

    res.json({ success: true, data: { unreadCount: count } });
  } catch (err) {
    console.error('getUnreadCount error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }

    // Security check: verify ownership if assigned to specific user
    if (notif.userId && notif.userId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized access to this notification.' } });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('markNotificationRead error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const markAllRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    const where = userId ? {
      isRead: false,
      OR: [
        { userId: userId },
        { userId: null }
      ]
    } : { isRead: false };

    await prisma.notification.updateMany({
      where,
      data: { isRead: true, readAt: new Date() }
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('markAllRead error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = {
  getAllNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead
};
