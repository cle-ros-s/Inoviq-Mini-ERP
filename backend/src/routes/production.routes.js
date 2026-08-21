const express = require('express');
const router = express.Router();
const { getAllProductionOrders, getProductionOrderById, createProductionOrder, startProduction, completeProduction } = require('../controllers/production.controller');
const { authenticateUser } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', getAllProductionOrders);
router.get('/:id', getProductionOrderById);
router.post('/', createProductionOrder);
router.post('/:id/start', startProduction);
router.post('/:id/complete', completeProduction);

module.exports = router;
