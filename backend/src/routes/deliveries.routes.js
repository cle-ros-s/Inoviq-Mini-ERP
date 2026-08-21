const express = require('express');
const router = express.Router();
const { getAllDeliveries, getDeliveryById, createDelivery, updateDeliveryStatus } = require('../controllers/deliveries.controller');
const { authenticateUser } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', getAllDeliveries);
router.get('/:id', getDeliveryById);
router.post('/', createDelivery);
router.patch('/:id/status', updateDeliveryStatus);

module.exports = router;
