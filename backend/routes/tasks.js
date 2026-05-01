const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Get tasks for a specific project
// Admin sees ALL tasks; Member sees ONLY tasks assigned to them
router.get('/project/:projectId', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Check if member belongs to project or is admin
    const memberIds = project.members.map(m => m.toString());
    if (req.user.role !== 'Admin' && !memberIds.includes(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let tasks;
    if (req.user.role === 'Admin') {
      // Admin sees ALL tasks in the project
      tasks = await Task.find({ projectId: req.params.projectId })
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Member sees ONLY tasks assigned to them
      tasks = await Task.find({ projectId: req.params.projectId, assignedTo: req.user.id })
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a task (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, status, dueDate } = req.body;
    const task = new Task({
      title,
      description,
      projectId,
      assignedTo: assignedTo || undefined,
      status,
      dueDate
    });
    await task.save();
    const populated = await task.populate('assignedTo', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task status — ANY authenticated member assigned to this task can update status
// Admin can update everything
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'Admin') {
      // Members can ONLY update status of tasks assigned to them
      const assignedId = task.assignedTo ? task.assignedTo.toString() : null;
      if (assignedId !== req.user.id) {
        return res.status(403).json({ error: 'You can only update tasks assigned to you' });
      }
      // Members can ONLY change the status field
      if (req.body.status) {
        task.status = req.body.status;
      }
    } else {
      // Admin can update everything
      if (req.body.title !== undefined) task.title = req.body.title;
      if (req.body.description !== undefined) task.description = req.body.description;
      if (req.body.status !== undefined) task.status = req.body.status;
      if (req.body.assignedTo !== undefined) task.assignedTo = req.body.assignedTo || undefined;
      if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;
    }

    await task.save();
    const populated = await task.populate('assignedTo', 'name email');
    res.json(populated);
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
