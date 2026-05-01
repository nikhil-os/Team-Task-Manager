const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    let projects, allTasks;

    if (req.user.role === 'Admin') {
      projects = await Project.find().populate('members', 'name email');
      allTasks = await Task.find().populate('assignedTo', 'name email').populate('projectId', 'name');
    } else {
      projects = await Project.find({ members: req.user.id }).populate('members', 'name email');
      const projectIds = projects.map(p => p._id);
      allTasks = await Task.find({
        assignedTo: req.user.id,
        projectId: { $in: projectIds }
      }).populate('assignedTo', 'name email').populate('projectId', 'name');
    }

    const tasksByStatus = { 'To Do': 0, 'In Progress': 0, 'Done': 0 };
    let overdueCount = 0;
    const overdueTasks = [];
    const completedTasks = [];

    allTasks.forEach(task => {
      if (tasksByStatus[task.status] !== undefined) tasksByStatus[task.status]++;
      if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'Done') {
        overdueCount++;
        overdueTasks.push({
          _id: task._id, title: task.title, status: task.status,
          projectName: task.projectId?.name || 'Unknown',
          projectId: task.projectId?._id,
          assignedTo: task.assignedTo?.name || 'Unassigned',
          dueDate: task.dueDate
        });
      }
      if (task.status === 'Done') {
        completedTasks.push({
          _id: task._id, title: task.title,
          projectName: task.projectId?.name || 'Unknown',
          projectId: task.projectId?._id,
          assignedTo: task.assignedTo?.name || 'Unassigned',
          updatedAt: task.updatedAt
        });
      }
    });

    // Build project summaries for the "Projects" card drill-down
    const projectSummaries = projects.map(p => {
      const pTasks = allTasks.filter(t => t.projectId?._id?.toString() === p._id.toString());
      return {
        _id: p._id, name: p.name,
        memberCount: p.members?.length || 0,
        taskCount: pTasks.length,
        doneCount: pTasks.filter(t => t.status === 'Done').length
      };
    });

    // Build tasks-by-status detail for the "Total Tasks" card
    const tasksByStatusDetail = {};
    ['To Do', 'In Progress', 'Done'].forEach(status => {
      tasksByStatusDetail[status] = allTasks
        .filter(t => t.status === status)
        .map(t => ({
          _id: t._id, title: t.title,
          projectName: t.projectId?.name || 'Unknown',
          projectId: t.projectId?._id,
          assignedTo: t.assignedTo?.name || 'Unassigned',
          dueDate: t.dueDate
        }));
    });

    const recentTasks = [...allTasks]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 8)
      .map(t => ({
        _id: t._id, title: t.title, status: t.status,
        projectName: t.projectId?.name || 'Unknown',
        projectId: t.projectId?._id,
        assignedTo: t.assignedTo?.name || 'Unassigned',
        dueDate: t.dueDate, updatedAt: t.updatedAt
      }));

    res.json({
      projectsCount: projects.length,
      tasksCount: allTasks.length,
      tasksByStatus,
      overdueCount,
      recentTasks,
      projectSummaries,
      tasksByStatusDetail,
      overdueTasks,
      completedTasks,
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
