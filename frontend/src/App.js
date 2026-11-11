import React, { useState } from 'react';
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
        localStorage.setItem('username', name);
        setUserToken(token);
        setLoggedInUser(name);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUserToken('');
    setLoggedInUser('');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  // Logged-in dashboard view
  if (userToken) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop')` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="bg-black/40 backdrop-blur-md border border-white/20 p-10 rounded-2xl shadow-2xl w-full max-w-md text-center text-white relative z-10">
          <h1 className="text-3xl font-bold mb-3">Welcome back, {loggedInUser}!</h1>
          <p className="text-gray-300 mb-8 text-sm">Your task manager dashboard is ready.</p>
          <button
            onClick={handleLogout}
            className="w-full bg-white text-slate-900 font-semibold py-3 rounded-xl hover:bg-gray-100 transition shadow-lg text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop')` }}
    >
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

      {/* Glassmorphic Card */}
      <div className="bg-black/35 backdrop-blur-md border border-white/20 p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md text-white relative z-10">
        
        <h2 className="text-3xl font-semibold text-center mb-8 tracking-wide">
          {isLogin ? 'Login' : 'Create Account'}
        </h2>

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-200 text-xs rounded-lg">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs rounded-lg">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full bg-transparent border-b border-white/40 pb-2 text-white placeholder-white/60 focus:outline-none focus:border-white text-sm transition"
              />
            </div>
          )}

          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-transparent border-b border-white/40 pb-2 text-white placeholder-white/60 focus:outline-none focus:border-white text-sm transition"
            />
          </div>

          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-transparent border-b border-white/40 pb-2 text-white placeholder-white/60 focus:outline-none focus:border-white text-sm transition"
            />
          </div>

          {isLogin && (
            <div className="flex items-center justify-between text-xs text-gray-300 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded bg-transparent border-white/40 text-indigo-600 focus:ring-0" />
                <span>Remember me</span>
              </label>
              <span className="hover:underline cursor-pointer">Forgot password?</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-white text-slate-900 font-semibold py-3 rounded-lg hover:bg-gray-100 transition shadow-lg text-sm mt-2"
          >
            {isLogin ? 'Log In' : 'Register'}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="text-center mt-6 text-xs text-gray-300">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button 
                onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }} 
                className="text-white font-medium hover:underline focus:outline-none"
              >
                Register
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }} 
                className="text-white font-medium hover:underline focus:outline-none"
              >
                Login
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
