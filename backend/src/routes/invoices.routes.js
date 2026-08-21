const express = require('express');
const router = express.Router();
const { getAllInvoices, getInvoiceById, createInvoice, recordPayment } = require('../controllers/invoices.controller');
const { authenticateUser } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
router.post('/:id/payment', recordPayment);

module.exports = router;
