const express = require('express');
const router = express.Router();
const { getAllInspections, getInspectionById, createInspection, submitInspectionResult } = require('../controllers/quality.controller');
const { authenticateUser } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', getAllInspections);
router.get('/:id', getInspectionById);
router.post('/', createInspection);
router.put('/:id/result', submitInspectionResult);

module.exports = router;
