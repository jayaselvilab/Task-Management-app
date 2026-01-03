const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // The Security Guard
const { 
    getTasks, 
    createTask, 
    updateTask, 
    deleteTask, 
    getTaskSummary // 1. Added the summary controller function
} = require('../controllers/taskController');

// --- PROTECTED ROUTES (JWT Required) ---

// 2. Dashboard Summary Route 
// This must be defined before any routes with /:id parameters
router.get('/summary', auth, getTaskSummary);

// 3. Standard Task CRUD
router.get('/', auth, getTasks);
router.post('/', auth, createTask);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;