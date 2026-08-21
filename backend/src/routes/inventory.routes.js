const express = require('express');
const router = express.Router();
const { getInventoryOverview, getProductInventory, getAllTransactions, receiveGoods, adjustInventory } = require('../controllers/inventory.controller');
const { authenticateUser } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', getInventoryOverview);
router.get('/transactions', getAllTransactions);
router.get('/:productId', getProductInventory);
router.post('/receipt', receiveGoods);
router.post('/adjustment', adjustInventory);

module.exports = router;
