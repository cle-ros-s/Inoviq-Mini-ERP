/**
 * Socket.IO Real-time Notification Emitter Helper
 * Broadcasts structured notifications and ERP updates to connected web clients.
 */
function emitRealtimeNotification(io, { module = 'SYSTEM', title, message, path = '/dashboard', severity = 'INFO', data = null }) {
  if (!io) return;

  const notification = {
    id: `notif-rt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: severity,
    severity,
    category: 'ATTENTION_REQUIRED',
    module,
    title,
    message,
    path,
    actionText: 'View Details →',
    isRead: false,
    createdAt: new Date().toISOString()
  };

  try {
    // 1. Broadcast real-time notification object
    io.emit('notification:new', notification);

    // 2. Broadcast ERP data update event
    io.emit('erp:update', { entity: module.toLowerCase(), action: 'update', data, notification });

    // 3. Refresh dashboards across active user sessions
    io.emit('dashboard:refresh');
    io.emit('data_updated');
  } catch (err) {
    console.error('Failed to emit real-time socket notification:', err.message);
  }

  return notification;
}

module.exports = { emitRealtimeNotification };
