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
    const memberIds = project.members.map(m => m.toString());
    if (req.user.role !== 'Admin' && !memberIds.includes(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a task (Admin or Project Member)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, status, dueDate } = req.body;
    
    // Verify user is part of the project if they aren't admin
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const memberIds = project.members.map(m => m.toString());
    if (req.user.role !== 'Admin' && !memberIds.includes(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const task = new Task({ title, description, projectId, assignedTo: assignedTo || undefined, status, dueDate });
    await task.save();
    const populated = await task.populate('assignedTo', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a task — Members can update status of tasks assigned to them
// Admin can update anything
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'Admin') {
      // Members can only update the status of tasks assigned to them
      const assignedId = task.assignedTo ? task.assignedTo.toString() : null;
      if (assignedId !== req.user.id) {
        return res.status(403).json({ error: 'You can only update tasks assigned to you' });
      }
      // Members can only change status
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
