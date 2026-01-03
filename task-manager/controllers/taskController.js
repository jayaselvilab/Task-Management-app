const Task = require('../models/Task');
const { Sequelize } = require('sequelize');

// 1. Create a task (Linked to the logged-in user)
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;

    const newTask = await Task.create({
      title,
      description,
      status: status || 'Pending',
      priority: priority || 'Medium',
      UserId: req.user.id // Taken from the Auth Middleware
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 2. Get ONLY the tasks for the logged-in user
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({ 
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']] // Newest tasks first
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Update task status or priority
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    const task = await Task.findOne({ where: { id, UserId: req.user.id } });

    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    // Update fields
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Delete a specific task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Task.destroy({ where: { id, UserId: req.user.id } });

    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. GET CHART DATA (New method for Pie Chart)
// This groups tasks by status and returns the count for each
exports.getTaskSummary = async (req, res) => {
  try {
    const summary = await Task.findAll({
      where: { UserId: req.user.id },
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};