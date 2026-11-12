
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

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

  const [userToken, setUserToken] = useState(
    localStorage.getItem('token') || ''
  );

  const [loggedInUser, setLoggedInUser] = useState(
    localStorage.getItem('username') || ''
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccessMessage('');

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      if (isLogin) {
        const response = await axios.post(
          `${API_BASE_URL}/auth/login`,
          {
            email: email.trim(),
            password
          }
        );

        const { token, username: name } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('username', name);

        setUserToken(token);
        setLoggedInUser(name);

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
        'Authentication failed. Please try again.'
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');

    setUserToken('');
    setLoggedInUser('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const changeMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  // Dashboard
  if (userToken) {
    return (
      <div className="auth-page">
        <div className="auth-card dashboard-card">
          <h1>Welcome back, {loggedInUser}!</h1>
          <p>Your task manager dashboard is ready.</p>

          <button
            className="submit-btn"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* LEFT SECTION */}

        <div className="welcome-section">

          <div className="welcome-content">
            <h1>Let's Get Started</h1>

            <p>
              Lorem ipsum dolor sit amet, consectetur
              adipiscing elit. Maecenas placerat
              ultricies libero eu pharetra.
              Vestibulum a ultrices augue.
            </p>
          </div>

        </div>

        {/* RIGHT SECTION */}

        <div className="form-section">

          <div className="form-container">

            <h2>
              {isLogin ? 'Sign in' : 'Sign up'}
            </h2>

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
                    onChange={(e) =>
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
                  onChange={(e) =>
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
                  onChange={(e) =>
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
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Repeat password"
                  />
                </div>
              )}

              {isLogin && (
                <div className="login-options">
                  <label>
                    <input type="checkbox" />
                    Remember me
                  </label>

                  <span>Forgot password?</span>
                </div>
              )}

              <button
                type="submit"
                className="submit-btn"
              >
                {isLogin ? 'Sign in' : 'Sign up'}
              </button>

            </form>

            <div className="switch-text">

              {isLogin ? (
                <>
                  Don't have an account?
                  <button onClick={changeMode}>
                    Sign up here
                  </button>
                </>
              ) : (
                <>
                  Already a Member?
                  <button onClick={changeMode}>
                    Sign in here
                  </button>
                </>
              )}

            </div>

          </div>

          {/* SOCIAL LOGIN SECTION */}

          <div className="social-section">

            <div className="social-divider"></div>

            <span className="or-text">OR</span>

            <div className="social-divider"></div>

            <div className="social-icons">

              <button
                type="button"
                aria-label="Facebook"
                className="social-icon"
              >
                f
              </button>

              <button
                type="button"
                aria-label="Twitter"
                className="social-icon"
              >
                ♥
              </button>

              <button
                type="button"
                aria-label="Google"
                className="social-icon google-icon"
              >
                G
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;
