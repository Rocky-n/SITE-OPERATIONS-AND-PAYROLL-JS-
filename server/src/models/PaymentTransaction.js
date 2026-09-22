const mongoose = require('mongoose');

const PaymentTransactionSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: [true, 'Worker is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Payment amount must be greater than 0'],
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
  },
  status: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid',
  },
  transactionReference: {
    type: String,
    required: true,
    unique: true,
  },
  details: {
    phoneNumber: { type: String }, // For PhonePe / UPI
    upiId: { type: String },       // For UPI / QR
    bankName: { type: String },    // For Netbanking
    notes: { type: String },
  },
  date: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PaymentTransaction', PaymentTransactionSchema);
