const express = require('express');
const router = express.Router();
const { getPayrollReport } = require('../controllers/payrollController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getPayrollReport);

module.exports = router;
