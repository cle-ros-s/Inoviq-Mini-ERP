const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, suspendUser, activateUser, resetUserPassword, deleteUser } = require('../controllers/users.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', authorizeRole('ADMINISTRATOR'), createUser);
router.put('/:id', authorizeRole('ADMINISTRATOR'), updateUser);
router.patch('/:id/suspend', authorizeRole('ADMINISTRATOR'), suspendUser);
router.patch('/:id/activate', authorizeRole('ADMINISTRATOR'), activateUser);
router.post('/:id/reset-password', authorizeRole('ADMINISTRATOR'), resetUserPassword);
router.delete('/:id', authorizeRole('ADMINISTRATOR'), deleteUser);

module.exports = router;
