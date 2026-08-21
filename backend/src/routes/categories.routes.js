const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categories.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', getAllCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', authorizeRole('ADMINISTRATOR'), deleteCategory);

module.exports = router;
