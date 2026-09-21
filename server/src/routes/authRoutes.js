const express = require('express');
const router = express.Router();
const { whitelistLogin, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', whitelistLogin);
router.post('/verify-otp', whitelistLogin); // Backward compatible alias
router.get('/me', authMiddleware, getMe);

module.exports = router;
