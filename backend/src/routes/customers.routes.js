const express = require('express');
const router = express.Router();
const { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customers.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', authorizeRole('ADMINISTRATOR'), deleteCustomer);

module.exports = router;
