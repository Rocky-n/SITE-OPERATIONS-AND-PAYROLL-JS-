const Worker = require('../models/Worker');
const Project = require('../models/Project');

const getAllWorkers = async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const filter = {};

    if (projectId) filter.assignedProject = projectId;
    if (status) filter.status = status;

    const workers = await Worker.find(filter)
      .populate('assignedProject', 'name location status')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: workers.length, data: workers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch workers', error: error.message });
  }
};

const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('assignedProject', 'name location status');
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    res.status(200).json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch worker', error: error.message });
  }
};

const createWorker = async (req, res) => {
  try {
    const { name, phone, dailyWageRate, assignedProject, role, status } = req.body;

    if (!name || !phone || dailyWageRate === undefined || !assignedProject) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, daily wage rate, and assigned project are required',
      });
    }

    // Verify project exists
    const project = await Project.findById(assignedProject);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Assigned project does not exist' });
    }

    const worker = await Worker.create({
      name,
      phone,
      dailyWageRate: Number(dailyWageRate),
      assignedProject,
      role: role || 'General Worker',
      status: status || 'Active',
    });

    const populated = await Worker.findById(worker._id).populate('assignedProject', 'name location');
    res.status(201).json({ success: true, data: populated, message: 'Worker registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create worker', error: error.message });
  }
};

const updateWorker = async (req, res) => {
  try {
    const { name, phone, dailyWageRate, assignedProject, role, status } = req.body;

    if (assignedProject) {
      const project = await Project.findById(assignedProject);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Assigned project does not exist' });
      }
    }

    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      {
        name,
        phone,
        dailyWageRate: dailyWageRate !== undefined ? Number(dailyWageRate) : undefined,
        assignedProject,
        role,
        status,
      },
      { new: true, runValidators: true }
    ).populate('assignedProject', 'name location');

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    res.status(200).json({ success: true, data: worker, message: 'Worker updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update worker', error: error.message });
  }
};

const deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    res.status(200).json({ success: true, message: 'Worker deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete worker', error: error.message });
  }
};

module.exports = {
  getAllWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
};
