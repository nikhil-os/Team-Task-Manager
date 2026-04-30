const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    let projectsCount = 0;
    let tasksCount = 0;
    let tasksByStatus = { 'To Do': 0, 'In Progress': 0, 'Done': 0 };
    let overdueCount = 0;

    const now = new Date();

    if (req.user.role === 'Admin') {
      projectsCount = await Project.countDocuments();
      tasksCount = await Task.countDocuments();
      
      const allTasks = await Task.find();
      allTasks.forEach(task => {
        if (tasksByStatus[task.status] !== undefined) {
          tasksByStatus[task.status]++;
        }
        if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'Done') {
          overdueCount++;
        }
      });
    } else {
      projectsCount = await Project.countDocuments({ members: req.user.id });
      const userProjects = await Project.find({ members: req.user.id }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      
      const myTasks = await Task.find({ assignedTo: req.user.id });
      tasksCount = myTasks.length;
      
      myTasks.forEach(task => {
        if (tasksByStatus[task.status] !== undefined) {
          tasksByStatus[task.status]++;
        }
        if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'Done') {
          overdueCount++;
        }
      });
    }

    res.json({
      projectsCount,
      tasksCount,
      tasksByStatus,
      overdueCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
