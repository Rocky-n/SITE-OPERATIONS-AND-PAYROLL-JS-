const PaymentTransaction = require('../models/PaymentTransaction');
const Worker = require('../models/Worker');

// Record a payment transaction (PhonePe, Netbanking, Cash)
const recordPayment = async (req, res) => {
  try {
    const { workerId, amount, paymentMethod, details, status: incomingStatus } = req.body;

    if (!workerId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'workerId, amount, and paymentMethod are required',
      });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Determine Status:
    // Cash: immediately "Paid"
    // Netbanking & PhonePe: "Pending" awaiting verification
    let status = incomingStatus;
    if (!status) {
      status = paymentMethod === 'Cash' ? 'Paid' : 'Pending';
    }

    // Generate unique transaction reference
    const prefix =
      paymentMethod === 'PhonePe'
        ? 'TXN-PP'
        : paymentMethod === 'Netbanking'
        ? 'TXN-NB'
        : 'CASH-REC';
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const transactionReference = `${prefix}-${timestamp}-${randomSuffix}`;

    const transaction = await PaymentTransaction.create({
      workerId,
      amount: Number(amount),
      paymentMethod,
      status,
      transactionReference,
      details: {
        phoneNumber: details?.phoneNumber || (paymentMethod === 'PhonePe' ? worker.phone : undefined),
        bankName: details?.bankName || (paymentMethod === 'Netbanking' ? 'Indian Overseas Bank (IOB)' : undefined),
        notes: details?.notes || `Disbursed via ${paymentMethod}`,
      },
      date: new Date(),
    });

    const populated = await PaymentTransaction.findById(transaction._id).populate({
      path: 'workerId',
      select: 'name phone assignedProject',
      populate: { path: 'assignedProject', select: 'name' },
    });

    res.status(201).json({
      success: true,
      message: `Payment of ₹${amount} recorded with status "${status}"`,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record payment', error: error.message });
  }
};

// Confirm a pending payment transaction (PUT/PATCH /api/payments/:id/confirm)
const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await PaymentTransaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Payment transaction not found' });
    }

    transaction.status = 'Paid';
    await transaction.save();

    const populated = await PaymentTransaction.findById(transaction._id).populate({
      path: 'workerId',
      select: 'name phone assignedProject',
      populate: { path: 'assignedProject', select: 'name' },
    });

    res.status(200).json({
      success: true,
      message: `Payment transaction ${transaction.transactionReference} confirmed as Paid`,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to confirm payment', error: error.message });
  }
};

// Fetch payment ledger
const getPaymentLedger = async (req, res) => {
  try {
    const { workerId, paymentMethod, status, startDate, endDate } = req.query;
    const filter = {};

    if (workerId) filter.workerId = workerId;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (status) filter.status = status;
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const transactions = await PaymentTransaction.find(filter)
      .populate({
        path: 'workerId',
        select: 'name phone assignedProject',
        populate: { path: 'assignedProject', select: 'name' },
      })
      .sort({ date: -1 });

    const totalAmount = transactions.reduce((sum, item) => sum + item.amount, 0);

    res.status(200).json({
      success: true,
      count: transactions.length,
      totalAmount,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch ledger', error: error.message });
  }
};

module.exports = {
  recordPayment,
  confirmPayment,
  getPaymentLedger,
};
