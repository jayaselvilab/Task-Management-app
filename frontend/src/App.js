
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUserToken('');
    setLoggedInUser('');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.get(`${API_BASE_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
      <div className="dashboard-welcome">

        <div className="dashboard-welcome-card">
          <h1>Welcome back, {loggedInUser}!</h1>

          <p>
            Your task manager dashboard is ready.
          </p>

          <button
            onClick={handleLogout}
            className="dashboard-logout"
          >
            Sign Out
          </button>
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
