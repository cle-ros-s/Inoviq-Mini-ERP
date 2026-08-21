const express = require('express');
const router = express.Router();
const { getAllBOMs, getBOMById, createBOM, checkMaterialAvailability } = require('../controllers/bom.controller');
const { authenticateUser } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', getAllBOMs);
router.get('/:id', getBOMById);
router.post('/', createBOM);
router.get('/:id/availability', checkMaterialAvailability);

module.exports = router;
