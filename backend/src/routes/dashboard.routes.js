const express = require('express');
const router = express.Router();
const { getAdminDashboard } = require('../controllers/dashboard.controller');
const { authenticateUser } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/admin', getAdminDashboard);
router.get('/kpis', getAdminDashboard);

module.exports = router;
