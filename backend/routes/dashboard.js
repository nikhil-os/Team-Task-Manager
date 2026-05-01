const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    let projects, allTasks, recentTasks;

    if (req.user.role === 'Admin') {
      projects = await Project.find().populate('members', 'name email');
      allTasks = await Task.find().populate('assignedTo', 'name email').populate('projectId', 'name');
    } else {
      projects = await Project.find({ members: req.user.id }).populate('members', 'name email');
      const projectIds = projects.map(p => p._id);
      allTasks = await Task.find({
        $or: [
          { assignedTo: req.user.id },
          { projectId: { $in: projectIds } }
        ]
      }).populate('assignedTo', 'name email').populate('projectId', 'name');
    }

    const tasksByStatus = { 'To Do': 0, 'In Progress': 0, 'Done': 0 };
    let overdueCount = 0;

    allTasks.forEach(task => {
      if (tasksByStatus[task.status] !== undefined) {
        tasksByStatus[task.status]++;
      }
      if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'Done') {
        overdueCount++;
      }
    });

    // Get the 8 most recent tasks
    recentTasks = [...allTasks]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 8)
      .map(t => ({
        _id: t._id,
        title: t.title,
        status: t.status,
        projectName: t.projectId?.name || 'Unknown',
        assignedTo: t.assignedTo?.name || 'Unassigned',
        dueDate: t.dueDate,
        updatedAt: t.updatedAt
      }));

    res.json({
      projectsCount: projects.length,
      tasksCount: allTasks.length,
      tasksByStatus,
      overdueCount,
      recentTasks,
      memberCount: req.user.role === 'Admin'
        ? [...new Set(projects.flatMap(p => p.members.map(m => m._id.toString())))].length
        : 0
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
