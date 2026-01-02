const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// This creates the URL: POST /api/tasks
router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
// This creates the URL: DELETE /api/tasks/:id
router.delete('/:id', taskController.deleteTask);
router.put('/:id', taskController.updateTask);

module.exports = router;