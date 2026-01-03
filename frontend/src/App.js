import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

// 1. IMPORT CHART.JS COMPONENTS
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// 2. REGISTER CHART.JS COMPONENTS
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium'); // New state for priority
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');

  // 3. INITIAL TOKEN CHECK
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && token !== "undefined") {
      setIsLoggedIn(true);
    }
  }, []);

  // 4. FETCH TASKS
  const fetchTasks = useCallback(async (tokenOverride) => {
    const token = tokenOverride || localStorage.getItem('token');
    if (!token || token === "undefined") return;

    try {
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (err) {
      console.error("Fetch Tasks Error:", err);
      if (err.response?.status === 401) handleLogout();
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks();
    }
  }, [isLoggedIn, fetchTasks]);

  // 5. CHART DATA PROCESSING
  const getChartData = () => {
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const completed = tasks.filter(t => t.status === 'Completed').length;

    return {
      labels: ['Pending', 'In Progress', 'Completed'],
      datasets: [
        {
          label: 'Tasks',
          data: [pending, inProgress, completed],
          backgroundColor: [
            '#FFCE56', // Yellow
            '#36A2EB', // Blue
            '#4BC0C0', // Green
          ],
          hoverOffset: 4
        },
      ],
    };
  };

  // 6. AUTH LOGIC
  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? 'register' : 'login';
    const payload = isRegistering ? { username, email, password } : { email, password };

    try {
      const res = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, payload);
      
      if (isRegistering) {
        alert("Registration Successful! Please log in.");
        setIsRegistering(false); 
        setPassword(''); 
      } else {
        const token = res.data.token;
        localStorage.setItem('token', token); 
        setIsLoggedIn(true); 
        fetchTasks(token); 
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "Auth failed"));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setTasks([]);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/tasks', 
        { title, status: 'Pending', priority }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setTitle('');
      setPriority('Medium');
      fetchTasks();
    } catch (err) {
      console.error("Add Task Error", err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/tasks/${id}`, 
        { status: newStatus }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (err) {
      console.error("Update Error", err);
    }
  };

  const deleteTask = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      console.error("Delete Error", err);
    }
  };

  // --- RENDER LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="app-container">
        <div className="card">
          <h1>{isRegistering ? "Create Account" : "Login"}</h1>
          <form onSubmit={handleAuth}>
            {isRegistering && (
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            )}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="add-btn">{isRegistering ? "Register" : "Sign In"}</button>
          </form>
          <p onClick={() => setIsRegistering(!isRegistering)} style={{ marginTop: '15px', cursor: 'pointer', color: '#007bff' }}>
            {isRegistering ? "Back to Login" : "Need an account? Register"}
          </p>
        </div>
      </div>
    );
  }

  // --- RENDER TASK MANAGER ---
  return (
    <div className="app-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Dashboard</h2>
          <button onClick={handleLogout} className="delete-btn" style={{padding: '5px 10px'}}>Logout</button>
        </div>

        {/* 7. DASHBOARD SECTION */}
        <div style={{ margin: '20px 0', height: '220px', display: 'flex', justifyContent: 'center' }}>
          {tasks.length > 0 ? (
            <Pie 
              data={getChartData()} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } } 
              }} 
            />
          ) : (
            <p style={{ color: '#888', alignSelf: 'center' }}>No tasks found to chart.</p>
          )}
        </div>

        <hr style={{ border: '0.5px solid #eee', margin: '20px 0' }} />

        <form className="input-group" onSubmit={addTask} style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <input 
            style={{ flex: 2, minWidth: '150px' }}
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="New task..." 
          />
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px' }}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button type="submit" className="add-btn" style={{ flex: 1 }}>Add</button>
        </form>

        <ul className="task-list" style={{ marginTop: '20px' }}>
          {tasks.map(task => (
            <li key={task.id} className="task-item" style={{ borderLeft: `5px solid ${task.priority === 'High' ? '#ff4d4d' : task.priority === 'Medium' ? '#ffa500' : '#4caf50'}` }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ 
                  textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                  fontWeight: 'bold'
                }}>
                  {task.title}
                </span>
                <small style={{ color: '#666' }}>Priority: {task.priority}</small>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select 
                  value={task.status} 
                  onChange={(e) => updateStatus(task.id, e.target.value)}
                  style={{ fontSize: '12px', padding: '4px' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <button className="delete-btn" onClick={() => deleteTask(task.id)} style={{ padding: '5px' }}>✕</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;