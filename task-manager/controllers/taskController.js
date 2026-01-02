const Task = require('../models/Task');

// This function creates a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, UserId } = req.body;

    const newTask = await Task.create({
      title,
      description,
      UserId // We link it to the user who created it
    });

    res.status(201).json({
      message: "Task created successfully!",
      task: newTask
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// This function gets all tasks from the database
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// This function deletes a specific task by its ID
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL
    await Task.destroy({ where: { id } });
    res.status(200).json({ message: "Task deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// This function updates a task (e.g., marking it as completed)
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update the fields
    task.title = title || task.title;
    task.description = description || task.description;
    task.completed = completed !== undefined ? completed : task.completed;

    await task.save();
    res.status(200).json({ message: "Task updated successfully!", task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};