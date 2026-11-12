
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'https://task-management-app-bams.onrender.com/api';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userToken, setUserToken] = useState(localStorage.getItem('token') || '');
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('username') || '');
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUserToken('');
    setLoggedInUser('');
    setEmail('');
    setPassword('');
    setUsername('');
  };
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/tasks`,
        { title: newTaskTitle, description: newTaskDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([...tasks, response.data]); // Keep only this line
      setNewTaskTitle('');
      setNewTaskDesc('');
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(task => task._id !== taskId && task.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
    }
  };



  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(response.data); // <-- Added this so tasks actually load into state!
      } catch (err) {
        if (err.response?.status === 401) {
          handleLogout();
        }
      }
    };

    if (userToken) {
      fetchDashboardData();
    }
  }, [userToken]);

 

    if (userToken) {
      fetchDashboardData();
    }
  }, [userToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: email.trim(),
          password
        });

        const { token, username: name } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('username', name || email.split('@')[0]);
        setUserToken(token);
        setLoggedInUser(name || email.split('@')[0]);
        setSuccessMessage('Login successful!');
      } else {
        await axios.post(`${API_BASE_URL}/auth/register`, {
          username: username.trim(),
          email: email.trim(),
          password
        });

        setSuccessMessage('Registration successful! Please sign in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Authentication failed. Please check your credentials.'
      );
    }
  };

  // Existing welcome card after login

 
if (userToken) {
    return (
      <div className="dashboard-welcome" style={{ flexDirection: 'column', padding: '40px 20px', alignItems: 'center', overflowY: 'auto' }}>
        <div className="dashboard-welcome-card" style={{ maxWidth: '600px', width: '100%', marginBottom: '20px' }}>
          <h1>Welcome back, {loggedInUser}!</h1>
          <p>Manage your tasks below.</p>
          <button onClick={handleLogout} className="dashboard-logout">
            Sign Out
          </button>
        </div>

        <div className="dashboard-welcome-card" style={{ maxWidth: '600px', width: '100%', textAlign: 'left' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Your Tasks</h2>
          
          <form onSubmit={handleCreateTask} style={{ marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Task Title</label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Description</label>
              <input
                type="text"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Add details"
              />
            </div>
            <button type="submit" className="login-button">Add Task</button>
          </form>

          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {tasks.length === 0 ? (
              <p style={{ color: '#b8c9bd', fontSize: '11px', textAlign: 'center' }}>No tasks found. Create your first task above!</p>
            ) : (
              tasks.map((task) => (
                <div key={task._id || task.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '6px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div>
                    <h4 style={{ fontSize: '13px', color: '#fff' }}>{task.title}</h4>
                    <p style={{ fontSize: '10px', color: '#b8c9bd', margin: '2px 0 0' }}>{task.description}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteTask(task._id || task.id)}
                    style={{ background: '#d9534f', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Login / Registration page

  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* LEFT SIDE - LEAF IMAGE */}

        <div className="auth-image-section">
          <div className="image-overlay"></div>
        </div>

        {/* RIGHT SIDE - LOGIN FORM */}

        <div className="auth-form-section">

          <div className="form-content">

            <div className="form-heading">
              <h1>
                {isLogin ? 'Welcome' : 'Create Account'}
              </h1>

              <p>
                {isLogin
                  ? 'Please enter your details to sign in'
                  : 'Please enter your details to register'}
              </p>
            </div>

            {/* ERROR MESSAGE */}

            {error && (
              <div className="message error-message">
                {error}
              </div>
            )}

            {/* SUCCESS MESSAGE */}

            {successMessage && (
              <div className="message success-message">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {!isLogin && (
                <div className="form-group">
                  <label>Username</label>

                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>
              )}

              <div className="form-group">
                <label>E-mail</label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your e-mail"
                />
              </div>

              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {/* REMEMBER ME */}

              {isLogin && (
                <div className="remember-row">
                  <label className="remember-label">
                    <input
                      type="checkbox"
                    />
                    <span>Remember me</span>
                  </label>
                </div>
              )}

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="login-button"
              >
                {isLogin ? 'Log in' : 'Register'}
              </button>

            </form>

            {/* REGISTER / LOGIN SWITCH */}

            <div className="register-text">

              {isLogin ? (
                <p>
                  Don't have an account?

                  <button
                    onClick={() => {
                      setIsLogin(false);
                      setError('');
                      setSuccessMessage('');
                    }}
                  >
                    Register
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?

                  <button
                    onClick={() => {
                      setIsLogin(true);
                      setError('');
                      setSuccessMessage('');
                    }}
                  >
                    Log in
                  </button>
                </p>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;
