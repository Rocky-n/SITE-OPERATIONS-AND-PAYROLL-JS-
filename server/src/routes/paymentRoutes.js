const express = require('express');
const router = express.Router();
const {
  recordPayment,
  confirmPayment,
  getPaymentLedger,
} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/record', recordPayment);
router.put('/:id/confirm', confirmPayment);
router.patch('/:id/confirm', confirmPayment);
router.get('/ledger', getPaymentLedger);

module.exports = router;
