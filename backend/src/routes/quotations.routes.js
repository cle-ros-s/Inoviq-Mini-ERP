const express = require('express');
const router = express.Router();
const { getAllQuotations, getQuotationById, createQuotation, updateQuotationStatus, convertToSalesOrder } = require('../controllers/quotations.controller');
const { authenticateUser } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', getAllQuotations);
router.get('/:id', getQuotationById);
router.post('/', createQuotation);
router.patch('/:id/status', updateQuotationStatus);
router.post('/:id/convert-to-order', convertToSalesOrder);

module.exports = router;
