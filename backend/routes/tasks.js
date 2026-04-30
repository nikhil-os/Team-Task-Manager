const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Get tasks for a specific project
router.get('/project/:projectId', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Check if member belongs to project or is admin
    if (req.user.role !== 'Admin' && !project.members.includes(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tasks = await Task.find({ projectId: req.params.projectId }).populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a task (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, status, dueDate } = req.body;
    const task = new Task({ title, description, projectId, assignedTo, status, dueDate });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a task (Members can update status of assigned tasks, Admin can update anything)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'Admin') {
      if (!task.assignedTo || task.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this task' });
      }
      // Members can only update status
      task.status = req.body.status || task.status;
    } else {
      Object.assign(task, req.body);
    }

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a task (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
