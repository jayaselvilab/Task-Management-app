import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // This links your CSS

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');

  // 1. Load tasks from your Node.js backend
  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. Function to add a task
  const addTask = async () => {
    if (!title) return;
    await axios.post('http://localhost:5000/api/tasks', { title });
    setTitle('');
    fetchTasks();
  };

  // 3. Function to delete a task
  const deleteTask = async (id) => {
    await axios.delete(`http://localhost:5000/api/tasks/${id}`);
    fetchTasks();
  };

  // THIS IS THE RETURN BLOCK YOU WERE LOOKING FOR
  return (
    <div className="app-container">
      <div className="card">
        <h1>Task Manager</h1>
        
        <div className="input-group">
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="What is your next task?" 
          />
          <button className="add-btn" onClick={addTask}>Add</button>
        </div>
        {/* 2. ADD THIS LINE HERE (Before the UL) */}
<p className="task-count">
  You have {tasks.filter(t => !t.completed).length} tasks remaining
</p>

        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} className="task-item">
              <span>{task.title}</span>
              <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;