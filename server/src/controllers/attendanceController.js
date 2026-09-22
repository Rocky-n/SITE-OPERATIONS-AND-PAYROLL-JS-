const Attendance = require('../models/Attendance');
const Worker = require('../models/Worker');

// Get attendance for all active workers on a specific date
const getAttendanceByDate = async (req, res) => {
  try {
    const { date, projectId } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date (YYYY-MM-DD) is required' });
    }

    // Build worker filter
    const workerFilter = { status: 'Active' };
    if (projectId) {
      workerFilter.assignedProject = projectId;
    }

    const workers = await Worker.find(workerFilter).populate('assignedProject', 'name location');

    // Fetch attendance records for the given date
    const attendanceRecords = await Attendance.find({ date });
    const attendanceMap = new Map();
    attendanceRecords.forEach((record) => {
      attendanceMap.set(record.workerId.toString(), record);
    });

    // Merge workers with their attendance on that date
    const result = workers.map((worker) => {
      const record = attendanceMap.get(worker._id.toString());
      return {
        worker: worker,
        attendanceId: record ? record._id : null,
        date,
        status: record ? record.status : 'Unmarked',
        notes: record ? record.notes : '',
      };
    });

    res.status(200).json({ success: true, date, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance', error: error.message });
  }
};

// Mark single worker attendance
const markAttendance = async (req, res) => {
  try {
    const { workerId, projectId, date, status, notes } = req.body;

    if (!workerId || !date || !status) {
      return res.status(400).json({ success: false, message: 'workerId, date, and status are required' });
    }

    const validStatuses = ['1 Day', 'Present', 'Absent', 'Half-day', '1.5 Days'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { workerId, date },
      { workerId, projectId, date, status, notes: notes || '' },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: attendance, message: 'Attendance recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record attendance', error: error.message });
  }
};

// Bulk mark attendance for a list of workers
const bulkMarkAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;

    if (!date || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'date and records array are required' });
    }

    const operations = records.map((rec) => ({
      updateOne: {
        filter: { workerId: rec.workerId, date },
        update: {
          $set: {
            workerId: rec.workerId,
            projectId: rec.projectId,
            date,
            status: rec.status,
            notes: rec.notes || '',
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await Attendance.bulkWrite(operations);
    }

    res.status(200).json({ success: true, message: `Successfully updated attendance for ${records.length} workers` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to bulk mark attendance', error: error.message });
  }
};

// Get history for a specific worker
const getWorkerAttendanceHistory = async (req, res) => {
  try {
    const { workerId } = req.params;
    const records = await Attendance.find({ workerId }).sort({ date: -1 });

    const summary = {
      present: 0,
      halfDay: 0,
      onePointFive: 0,
      absent: 0,
      totalRecorded: records.length,
    };

    records.forEach((r) => {
      if (r.status === '1 Day' || r.status === 'Present') summary.present += 1;
      else if (r.status === 'Half-day') summary.halfDay += 1;
      else if (r.status === '1.5 Days') summary.onePointFive += 1;
      else if (r.status === 'Absent') summary.absent += 1;
    });

    res.status(200).json({ success: true, summary, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance history', error: error.message });
  }
};

// Get attendance trends for the last N days (default: 7)
const getAttendanceTrends = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const dateList = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateList.push(d.toISOString().split('T')[0]);
    }

    const startDate = dateList[0];
    const endDate = dateList[dateList.length - 1];

    const records = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
      status: { $in: ['1 Day', 'Present', '1.5 Days'] },
    });

    const dateCounts = {};
    dateList.forEach((dt) => {
      dateCounts[dt] = 0;
    });

    records.forEach((r) => {
      if (dateCounts[r.date] !== undefined) {
        dateCounts[r.date] += 1;
      }
    });

    const trendData = dateList.map((dt) => {
      const [year, month, day] = dt.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return {
        date: dt,
        label: dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        workers: dateCounts[dt] || 0,
      };
    });

    res.status(200).json({ success: true, data: trendData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance trends', error: error.message });
  }
};

module.exports = {
  getAttendanceByDate,
  markAttendance,
  bulkMarkAttendance,
  getWorkerAttendanceHistory,
  getAttendanceTrends,
};
