const Project = require('../models/Project');
const Worker = require('../models/Worker');

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });

    // Aggregate worker counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (p) => {
        const workerCount = await Worker.countDocuments({ assignedProject: p._id, status: 'Active' });
        return {
          ...p.toObject(),
          workerCount,
        };
      })
    );

    res.status(200).json({ success: true, count: projectsWithCounts.length, data: projectsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects', error: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    const workers = await Worker.find({ assignedProject: project._id });
    res.status(200).json({ success: true, data: { ...project.toObject(), workers } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch project', error: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, location, startDate, status, description } = req.body;
    if (!name || !location || !startDate) {
      return res.status(400).json({ success: false, message: 'Name, location, and start date are required' });
    }

    const project = await Project.create({
      name,
      location,
      startDate,
      status: status || 'Active',
      description: description || '',
    });

    res.status(201).json({ success: true, data: project, message: 'Project created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create project', error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { name, location, startDate, status, description } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, location, startDate, status, description },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.status(200).json({ success: true, data: project, message: 'Project updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update project', error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if there are workers assigned
    const assignedWorkers = await Worker.countDocuments({ assignedProject: project._id });
    if (assignedWorkers > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete project with ${assignedWorkers} assigned workers. Reassign or remove workers first.`,
      });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete project', error: error.message });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
