const express = require('express');
const router = express.Router();
const { getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/suppliers.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', authorizeRole('ADMINISTRATOR'), deleteSupplier);

module.exports = router;
