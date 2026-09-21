const express = require('express');
const router = express.Router();
const {
  getAllAdvances,
  createAdvance,
  deleteAdvance,
} = require('../controllers/advanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.route('/').get(getAllAdvances).post(createAdvance);
router.route('/:id').delete(deleteAdvance);

module.exports = router;
