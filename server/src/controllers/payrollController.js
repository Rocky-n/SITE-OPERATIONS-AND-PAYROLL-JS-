const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');
const Advance = require('../models/Advance');
const PaymentTransaction = require('../models/PaymentTransaction');

// Dynamically compute payroll report with Paid, Unpaid, and Pending states
const getPayrollReport = async (req, res) => {
  try {
    const { projectId, startDate, endDate } = req.query;

    const workerFilter = { status: 'Active' };
    if (projectId) {
      workerFilter.assignedProject = projectId;
    }

    const workers = await Worker.find(workerFilter).populate('assignedProject', 'name location');

    // Build attendance date filter if specified
    const attendanceFilter = {};
    if (startDate && endDate) {
      attendanceFilter.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      attendanceFilter.date = { $gte: startDate };
    } else if (endDate) {
      attendanceFilter.date = { $lte: endDate };
    }

    const payrollList = await Promise.all(
      workers.map(async (worker) => {
        // 1. Attendance calculation
        const workerAttendanceFilter = { workerId: worker._id, ...attendanceFilter };
        const attendanceRecords = await Attendance.find(workerAttendanceFilter);

        let daysPresent = 0;
        let daysHalfDay = 0;
        let daysAbsent = 0;

        attendanceRecords.forEach((att) => {
          if (att.status === 'Present') daysPresent += 1;
          else if (att.status === 'Half-day') daysHalfDay += 1;
          else if (att.status === 'Absent') daysAbsent += 1;
        });

        // Total Earned = (Days Present * Daily Wage Rate) + (Half-days * 0.5 * Daily Wage Rate)
        const totalEarned = Math.round(
          (daysPresent * worker.dailyWageRate) + (daysHalfDay * 0.5 * worker.dailyWageRate)
        );

        // 2. Total Advances
        const advances = await Advance.find({ workerId: worker._id });
        const totalAdvances = advances.reduce((sum, item) => sum + item.amount, 0);

        // 3. Fetch all payment transactions for this worker
        const payments = await PaymentTransaction.find({ workerId: worker._id }).sort({ date: -1 });

        // Sum confirmed paid transactions (status "Paid" or legacy "Success")
        const confirmedPayments = payments.filter(
          (p) => p.status === 'Paid' || p.status === 'Success'
        );
        const totalPaid = confirmedPayments.reduce((sum, item) => sum + item.amount, 0);

        // Check if there is a pending payment transaction
        const pendingTx = payments.find((p) => p.status === 'Pending');

        // 4. Net Payable calculation
        const rawNet = totalEarned - totalAdvances - totalPaid;
        const netPayable = Math.max(0, rawNet);

        // 5. Determine Payment Status: "Paid", "Pending", or "Unpaid"
        let paymentStatus = 'Unpaid';
        if (pendingTx) {
          paymentStatus = 'Pending';
        } else if (netPayable === 0 && (totalEarned > 0 || totalAdvances > 0 || totalPaid > 0)) {
          paymentStatus = 'Paid';
        } else {
          paymentStatus = 'Unpaid';
        }

        return {
          worker: {
            _id: worker._id,
            name: worker.name,
            phone: worker.phone,
            dailyWageRate: worker.dailyWageRate,
            role: worker.role,
            assignedProject: worker.assignedProject,
          },
          daysPresent,
          daysHalfDay,
          daysAbsent,
          totalEarned,
          totalAdvances,
          totalPaid,
          netPayable,
          paymentStatus, // 'Paid' | 'Pending' | 'Unpaid'
          pendingTransactionId: pendingTx ? pendingTx._id : null,
          pendingTransactionRef: pendingTx ? pendingTx.transactionReference : null,
          pendingAmount: pendingTx ? pendingTx.amount : null,
          lastPaymentDate: payments.length > 0 ? payments[0].date : null,
        };
      })
    );

    // Summary totals
    const summary = payrollList.reduce(
      (acc, item) => {
        acc.totalEarned += item.totalEarned;
        acc.totalAdvances += item.totalAdvances;
        acc.totalPaid += item.totalPaid;
        acc.totalNetPayable += item.netPayable;
        if (item.paymentStatus === 'Paid') acc.paidWorkersCount += 1;
        else if (item.paymentStatus === 'Pending') acc.pendingWorkersCount += 1;
        else acc.unpaidWorkersCount += 1;
        return acc;
      },
      {
        totalEarned: 0,
        totalAdvances: 0,
        totalPaid: 0,
        totalNetPayable: 0,
        paidWorkersCount: 0,
        pendingWorkersCount: 0,
        unpaidWorkersCount: 0,
        totalWorkers: payrollList.length,
      }
    );

    res.status(200).json({
      success: true,
      summary,
      data: payrollList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to compute payroll', error: error.message });
  }
};

module.exports = {
  getPayrollReport,
};
