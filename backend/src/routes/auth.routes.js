const express = require('express');
const router = express.Router();
const { login, refreshToken, getMe, changePassword } = require('../controllers/auth.controller');
const { authenticateUser } = require('../middlewares/auth');

router.post('/login', login);
router.post('/refresh', refreshToken);
router.get('/me', authenticateUser, getMe);
router.post('/change-password', authenticateUser, changePassword);

module.exports = router;
