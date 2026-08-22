const express = require('express');
const router = express.Router();
const {
  getAllNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead
} = require('../controllers/notifications.controller');
const { authenticateUser } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', getAllNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markNotificationRead);

module.exports = router;
