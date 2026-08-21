const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getSalesDashboard,
  getPurchaseDashboard,
  getProductionDashboard,
  getInventoryDashboard,
  getQualityDashboard,
  getDeliveryDashboard,
  getFinanceDashboard,
  getRoleDashboard
} = require('../controllers/dashboard.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', getRoleDashboard);
router.get('/kpis', getRoleDashboard);
router.get('/admin', authorizeRole('ADMINISTRATOR', 'BUSINESS_OWNER'), getAdminDashboard);
router.get('/sales', authorizeRole('ADMINISTRATOR', 'BUSINESS_OWNER', 'SALES_EXECUTIVE'), getSalesDashboard);
router.get('/purchase', authorizeRole('ADMINISTRATOR', 'BUSINESS_OWNER', 'PURCHASE_MANAGER'), getPurchaseDashboard);
router.get('/production', authorizeRole('ADMINISTRATOR', 'BUSINESS_OWNER', 'PRODUCTION_MANAGER'), getProductionDashboard);
router.get('/inventory', authorizeRole('ADMINISTRATOR', 'BUSINESS_OWNER', 'INVENTORY_MANAGER'), getInventoryDashboard);
router.get('/quality', authorizeRole('ADMINISTRATOR', 'BUSINESS_OWNER', 'QUALITY_MANAGER'), getQualityDashboard);
router.get('/delivery', authorizeRole('ADMINISTRATOR', 'BUSINESS_OWNER', 'DELIVERY_MANAGER'), getDeliveryDashboard);
router.get('/finance', authorizeRole('ADMINISTRATOR', 'BUSINESS_OWNER', 'ACCOUNTS_FINANCE'), getFinanceDashboard);

module.exports = router;
