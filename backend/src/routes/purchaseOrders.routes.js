const express = require('express');
const router = express.Router();
const { getAllPurchaseOrders, getPurchaseOrderById, createPurchaseOrder, receivePurchaseOrder } = require('../controllers/purchaseOrders.controller');
const { authenticateUser } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', getAllPurchaseOrders);
router.get('/:id', getPurchaseOrderById);
router.post('/', createPurchaseOrder);
router.post('/:id/receive', receivePurchaseOrder);

module.exports = router;
