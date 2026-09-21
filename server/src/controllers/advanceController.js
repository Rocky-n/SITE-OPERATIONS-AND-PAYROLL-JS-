const Advance = require('../models/Advance');
const Worker = require('../models/Worker');

const getAllAdvances = async (req, res) => {
  try {
    const { workerId } = req.query;
    const filter = {};
    if (workerId) filter.workerId = workerId;

    const advances = await Advance.find(filter)
      .populate({
        path: 'workerId',
        select: 'name phone dailyWageRate assignedProject',
        populate: { path: 'assignedProject', select: 'name' },
      })
      .sort({ date: -1 });

    const totalAdvances = advances.reduce((sum, item) => sum + item.amount, 0);

    res.status(200).json({
      success: true,
      count: advances.length,
      totalAdvances,
      data: advances,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch advances', error: error.message });
  }
};

const createAdvance = async (req, res) => {
  try {
    const { workerId, amount, paymentMode, reason, date } = req.body;

    if (!workerId || !amount) {
      return res.status(400).json({ success: false, message: 'Worker ID and amount are required' });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const advance = await Advance.create({
      workerId,
      amount: Number(amount),
      paymentMode: paymentMode || 'Cash',
      reason: reason || 'Advance against wages',
      date: date ? new Date(date) : new Date(),
    });

    const populated = await Advance.findById(advance._id).populate('workerId', 'name phone');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Advance recorded successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record advance', error: error.message });
  }
};

const deleteAdvance = async (req, res) => {
  try {
    const advance = await Advance.findByIdAndDelete(req.params.id);
    if (!advance) {
      return res.status(404).json({ success: false, message: 'Advance record not found' });
    }
    res.status(200).json({ success: true, message: 'Advance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete advance', error: error.message });
  }
};

module.exports = {
  getAllAdvances,
  createAdvance,
  deleteAdvance,
};
