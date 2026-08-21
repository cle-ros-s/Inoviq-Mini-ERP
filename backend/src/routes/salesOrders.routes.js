const express = require('express');
const router = express.Router();
const { getAllSalesOrders, getSalesOrderById, createSalesOrder, updateOrderStatus } = require('../controllers/salesOrders.controller');
const { authenticateUser } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', getAllSalesOrders);
router.get('/:id', getSalesOrderById);
router.post('/', createSalesOrder);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
