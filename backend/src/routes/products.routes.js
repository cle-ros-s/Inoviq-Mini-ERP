const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, createProduct, updateProduct, toggleProductStatus, deleteProduct } = require('../controllers/products.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.patch('/:id/toggle-status', toggleProductStatus);
router.delete('/:id', authorizeRole('ADMINISTRATOR'), deleteProduct);

module.exports = router;
