const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Worker name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  dailyWageRate: {
    type: Number,
    required: [true, 'Daily wage rate is required'],
    min: [0, 'Daily wage cannot be negative'],
  },
  assignedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Assigned project is required'],
  },
  role: {
    type: String,
    default: 'General Worker',
    trim: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Worker', WorkerSchema);
