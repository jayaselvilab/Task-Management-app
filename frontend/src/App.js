
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const API_BASE_URL =
  'https://task-management-app-bams.onrender.com/api';

function App() {
  const [isLogin, setIsLogin] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [userToken, setUserToken] = useState(
    localStorage.getItem('token') || ''
  );

  const [loggedInUser, setLoggedInUser] = useState(
    localStorage.getItem('username') || ''
  );

  // Dashboard states
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState([]);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');

  const [editingTask, setEditingTask] = useState(null);
  const [dashboardError, setDashboardError] = useState('');
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // AUTHENTICATION

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccessMessage('');

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const response = await axios.post(
          `${API_BASE_URL}/auth/login`,
          {
            email: email.trim(),
            password
          }
        );

        // Your backend returns token and username directly
        const { token, username: name } = response.data;

        if (!token) {
          throw new Error('Login token was not received.');
        }

        localStorage.setItem('token', token);
        localStorage.setItem('username', name || 'User');

        setUserToken(token);
        setLoggedInUser(name || 'User');

        setSuccessMessage('Login successful!');
      } else {
        await axios.post(
          `${API_BASE_URL}/auth/register`,
          {
            username: username.trim(),
            email: email.trim(),
            password
          }
        );

        setSuccessMessage(
          'Registration successful! Please sign in.'
        );

        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Authentication failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  // FETCH TASKS AND CHART DATA

  const fetchDashboardData = async () => {
    if (!userToken) return;

    setDashboardLoading(true);
    setDashboardError('');

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      };

      const [taskResponse, summaryResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/tasks`, config),
        axios.get(`${API_BASE_URL}/tasks/summary`, config)
      ]);

      setTasks(Array.isArray(taskResponse.data)
        ? taskResponse.data
        : []);

      setSummary(Array.isArray(summaryResponse.data)
        ? summaryResponse.data
        : []);

    } catch (err) {
      console.error('Dashboard API error:', err);

      if (err.response?.status === 401) {
        handleLogout();
        return;
      }

      setDashboardError(
        err.response?.data?.error ||
        'Unable to load dashboard data. Please try again.'
      );
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchDashboardData();
    }
  }, [userToken]);

  // CREATE TASK

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!taskTitle.trim()) return;

    try {
      await axios.post(
        `${API_BASE_URL}/tasks`,
        {
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
          status: 'Pending'
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        }
      );

      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('Medium');

      fetchDashboardData();

    } catch (err) {
      alert(
        err.response?.data?.error ||
        'Unable to create task.'
      );
    }
  };

  // UPDATE TASK

  const handleUpdateTask = async (task, newStatus) => {
    try {
      await axios.put(
        `${API_BASE_URL}/tasks/${task.id}`,
        {
          title: task.title,
          description: task.description,
          status: newStatus,
          priority: task.priority
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        }
      );

      fetchDashboardData();

    } catch (err) {
      alert('Unable to update task.');
    }
  };

  // DELETE TASK

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_BASE_URL}/tasks/${id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        }
      );

      fetchDashboardData();

    } catch (err) {
      alert('Unable to delete task.');
    }
  };

  // EDIT TASK

  const handleEditTask = async (e) => {
    e.preventDefault();

    if (!editingTask) return;

    try {
      await axios.put(
        `${API_BASE_URL}/tasks/${editingTask.id}`,
        {
          title: editingTask.title,
          description: editingTask.description,
          priority: editingTask.priority,
          status: editingTask.status
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        }
      );

      setEditingTask(null);
      fetchDashboardData();

    } catch (err) {
      alert('Unable to edit task.');
    }
  };

  // LOGOUT

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');

    setUserToken('');
    setLoggedInUser('');

    setTasks([]);
    setSummary([]);

    setEmail('');
    setPassword('');
    setUsername('');
    setConfirmPassword('');
  };

  const changeMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  // TASK STATISTICS

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    task => task.status === 'Completed'
  ).length;

  const pendingTasks = tasks.filter(
    task => task.status === 'Pending'
  ).length;

  const inProgressTasks = tasks.filter(
    task => task.status === 'In Progress'
  ).length;

  // CHART DATA FROM BACKEND

  const chartData = {
    labels: summary.map(item => item.status),
    datasets: [
      {
        data: summary.map(item => Number(item.count)),
        backgroundColor: [
          '#00a86b',
          '#eab308',
          '#3b82f6'
        ],
        borderColor: '#10241b',
        borderWidth: 3,
        hoverOffset: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#d1d5db',
          padding: 20,
          usePointStyle: true
        }
      }
    }
  };

  // DASHBOARD

  if (userToken) {
    return (
      <div className="dashboard-page">

        <aside className="sidebar">

          <div className="brand">
            <span className="brand-icon">✓</span>
            <h2>TaskFlow</h2>
          </div>

          <nav>
            <div className="nav-item active">
              <span>▦</span> Dashboard
            </div>
            <div className="nav-item">
              <span>☑</span> My Tasks
            </div>
            <div className="nav-item">
              <span>◷</span> Reports
            </div>
          </nav>

          <div className="sidebar-bottom">
            <div className="user-info">
              <div className="avatar">
                {loggedInUser.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{loggedInUser}</strong>
                <small>Member</small>
              </div>
            </div>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              ↪ Sign Out
            </button>
          </div>

        </aside>

        <main className="dashboard-main">

          <header className="dashboard-header">
            <div>
              <p className="welcome-label">WELCOME BACK</p>
              <h1>Hello, {loggedInUser}!</h1>
              <p className="header-description">
                Here's your task management overview.
              </p>
            </div>

            <button
              className="refresh-btn"
              onClick={fetchDashboardData}
              disabled={dashboardLoading}
            >
              ↻ Refresh
            </button>
          </header>

          {dashboardError && (
            <div className="dashboard-error">
              {dashboardError}
            </div>
          )}

          {dashboardLoading && tasks.length === 0 ? (
            <div className="loading-message">
              Loading your dashboard...
            </div>
          ) : (
            <>
              {/* STATISTICS */}

              <section className="stats-grid">

                <div className="stat-card">
                  <div className="stat-icon green-icon">▦</div>
                  <p>Total Tasks</p>
                  <h2>{totalTasks}</h2>
                  <small>All your tasks</small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue-icon">◷</div>
                  <p>In Progress</p>
                  <h2>{inProgressTasks}</h2>
                  <small>Currently working</small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon yellow-icon">◉</div>
                  <p>Pending</p>
                  <h2>{pendingTasks}</h2>
                  <small>Waiting to start</small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon purple-icon">✓</div>
                  <p>Completed</p>
                  <h2>{completedTasks}</h2>
                  <small>Successfully completed</small>
                </div>

              </section>

              {/* CHART AND CREATE TASK */}

              <section className="dashboard-grid">

                <div className="panel chart-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Task Overview</h2>
                      <p>Task status distribution</p>
                    </div>
                  </div>

                  <div className="chart-container">
                    {summary.length > 0 ? (
                      <Doughnut
                        data={chartData}
                        options={chartOptions}
                      />
                    ) : (
                      <div className="empty-chart">
                        No chart data available yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="panel create-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Create New Task</h2>
                      <p>Add a task to your list</p>
                    </div>
                  </div>

                  <form
                    className="task-form"
                    onSubmit={handleCreateTask}
                  >
                    <label>Task Title</label>

                    <input
                      type="text"
                      placeholder="Enter task title"
                      value={taskTitle}
                      onChange={e =>
                        setTaskTitle(e.target.value)
                      }
                      required
                    />

                    <label>Description</label>

                    <textarea
                      placeholder="Enter task description"
                      value={taskDescription}
                      onChange={e =>
                        setTaskDescription(e.target.value)
                      }
                    />

                    <label>Priority</label>

                    <select
                      value={taskPriority}
                      onChange={e =>
                        setTaskPriority(e.target.value)
                      }
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>

                    <button className="add-task-btn">
                      + Add Task
                    </button>
                  </form>
                </div>

              </section>

              {/* TASK RECORDS */}

              <section className="panel tasks-panel">

                <div className="panel-heading">
                  <div>
                    <h2>My Task Records</h2>
                    <p>Manage your personal tasks</p>
                  </div>

                  <span className="task-count">
                    {totalTasks} Tasks
                  </span>
                </div>

                {tasks.length === 0 ? (
                  <div className="empty-tasks">
                    <div>☑</div>
                    <h3>No tasks found</h3>
                    <p>Create your first task above.</p>
                  </div>
                ) : (
                  <div className="task-table-wrapper">
                    <table className="task-table">
                      <thead>
                        <tr>
                          <th>Task</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {tasks.map(task => (
                          <tr key={task.id}>
                            <td>
                              <strong>{task.title}</strong>
                              <small className="task-description">
                                {task.description || 'No description'}
                              </small>
                            </td>

                            <td>
                              <span className={`priority ${task.priority?.toLowerCase()}`}>
                                {task.priority}
                              </span>
                            </td>

                            <td>
                              <select
                                className="status-select"
                                value={task.status}
                                onChange={e =>
                                  handleUpdateTask(task, e.target.value)
                                }
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </td>

                            <td>
                              {task.createdAt
                                ? new Date(task.createdAt).toLocaleDateString()
                                : '-'}
                            </td>

                            <td>
                              <div className="action-buttons">
                                <button
                                  className="edit-btn"
                                  title="Edit task"
                                  onClick={() =>
                                    setEditingTask({ ...task })
                                  }
                                >
                                  ✎
                                </button>

                                <button
                                  className="delete-btn"
                                  title="Delete task"
                                  onClick={() =>
                                    handleDeleteTask(task.id)
                                  }
                                >
                                  ×
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </section>

            </>
          )}

        </main>

        {/* EDIT TASK MODAL */}

        {editingTask && (
          <div className="modal-overlay">
            <form
              className="edit-modal"
              onSubmit={handleEditTask}
            >
              <h2>Edit Task</h2>

              <label>Task Title</label>
              <input
                value={editingTask.title}
                onChange={e =>
                  setEditingTask({
                    ...editingTask,
                    title: e.target.value
                  })
                }
                required
              />

              <label>Description</label>
              <textarea
                value={editingTask.description || ''}
                onChange={e =>
                  setEditingTask({
                    ...editingTask,
                    description: e.target.value
                  })
                }
              />

              <label>Priority</label>
              <select
                value={editingTask.priority}
                onChange={e =>
                  setEditingTask({
                    ...editingTask,
                    priority: e.target.value
                  })
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>

              <label>Status</label>
              <select
                value={editingTask.status}
                onChange={e =>
                  setEditingTask({
                    ...editingTask,
                    status: e.target.value
                  })
                }
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <div className="modal-actions">
                <button type="submit" className="add-task-btn">
                  Save Changes
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingTask(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    );
  }

  // LOGIN AND SIGNUP PAGE

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="welcome-section">
          <div className="welcome-content">
            <h1>Let's Get Started</h1>

            <p>
              Manage your tasks, track your progress,
              and achieve your goals. Stay organized
              and make every day productive.
            </p>
          </div>
        </div>

        <div className="form-section">

          <div className="form-container">

            <h2>{isLogin ? 'Sign in' : 'Sign up'}</h2>

            {error && (
              <div className="message error-message">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="message success-message">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {!isLogin && (
                <div className="input-group">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e =>
                      setUsername(e.target.value)
                    }
                    placeholder="Your name"
                  />
                </div>
              )}

              <div className="input-group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e =>
                    setEmail(e.target.value)
                  }
                  placeholder="Your Email"
                />
              </div>

              <div className="input-group">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e =>
                    setPassword(e.target.value)
                  }
                  placeholder="Create Password"
                />
              </div>

              {!isLogin && (
                <div className="input-group">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Repeat password"
                  />
                </div>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading
                  ? 'Please wait...'
                  : isLogin
                    ? 'Sign in'
                    : 'Sign up'}
              </button>

            </form>

            <div className="switch-text">

              {isLogin ? (
                <>
                  Don't have an account?
                  <button type="button" onClick={changeMode}>
                    Sign up here
                  </button>
                </>
              ) : (
                <>
                  Already a Member?
                  <button type="button" onClick={changeMode}>
                    Sign in here
                  </button>
                </>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;
