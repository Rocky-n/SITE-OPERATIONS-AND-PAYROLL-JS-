const express = require('express');
const router = express.Router();
const {
  getAttendanceByDate,
  markAttendance,
  bulkMarkAttendance,
  getWorkerAttendanceHistory,
} = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getAttendanceByDate);
router.post('/', markAttendance);
router.post('/bulk', bulkMarkAttendance);
router.get('/worker/:workerId', getWorkerAttendanceHistory);

module.exports = router;
