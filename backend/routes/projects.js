const express = require('express');
const Project = require('../models/Project');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.find().populate('members', 'name email');
    } else {
      projects = await Project.find({ members: req.user.id }).populate('members', 'name email');
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = new Project({
      name,
      description,
      createdBy: req.user.id,
      members: members || [req.user.id]
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
