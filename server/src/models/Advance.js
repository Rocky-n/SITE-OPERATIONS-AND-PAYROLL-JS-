const mongoose = require('mongoose');

const AdvanceSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: [true, 'Worker ID is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Advance amount is required'],
    min: [1, 'Amount must be greater than 0'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'UPI'],
    default: 'Cash',
  },
  reason: {
    type: String,
    default: 'Advance against wages',
    trim: true,
  },
  recordedBy: {
    type: String,
    default: 'Manager',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Advance', AdvanceSchema);
