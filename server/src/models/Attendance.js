const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  status: {
    type: String,
    enum: ['1 Day', 'Present', 'Absent', 'Half-day', '1.5 Days'],
    required: true,
    default: '1 Day',
  },
  notes: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a worker has only one attendance record per date
AttendanceSchema.index({ workerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
