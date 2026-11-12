import React, { useState, useEffect, useCallback } from 'react';
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

  const fetchDashboardData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (userToken) {
      fetchDashboardData();
    }
  }, [userToken, fetchDashboardData]);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUserToken('');
    setLoggedInUser('');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  if (userToken) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2000&auto=format&fit=crop')` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="bg-black/40 backdrop-blur-md border border-white/20 p-10 rounded-2xl shadow-2xl w-full max-w-md text-center text-white relative z-10">
          <h1 className="text-3xl font-bold mb-3">Welcome back, {loggedInUser}!</h1>
          <p className="text-gray-300 mb-8 text-sm">Your task manager dashboard is ready.</p>
          <button
            onClick={handleLogout}
            className="w-full bg-black text-white font-semibold py-3 rounded-xl hover:bg-neutral-900 transition shadow-lg text-sm"
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
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2000&auto=format&fit=crop')` }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

      {/* Glassmorphic Card Container */}
      <div className="bg-[#111c16]/75 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-8 sm:p-10 text-white relative z-10">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {isLogin ? 'Welcome' : 'Create Account'}
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            {isLogin ? 'Please enter your details to sign in' : 'Set up your account to get started'}
          </p>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full bg-transparent border-b border-white/30 pb-2 text-white placeholder-gray-500 focus:outline-none focus:border-white text-sm transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your e-mail"
              className="w-full bg-transparent border-b border-white/30 pb-2 text-white placeholder-gray-500 focus:outline-none focus:border-white text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent border-b border-white/30 pb-2 text-white placeholder-gray-500 focus:outline-none focus:border-white text-sm transition"
            />
          </div>

          {isLogin && (
            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded bg-transparent border-white/30 text-emerald-600 focus:ring-0" />
                <span>Remember me</span>
              </label>
              <span className="hover:underline cursor-pointer">Forgot password?</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-black hover:bg-neutral-900 text-white font-semibold py-3.5 rounded-xl transition shadow-xl text-sm mt-4 border border-white/10"
          >
            {isLogin ? 'Log in' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-gray-400">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button 
                onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }} 
                className="text-white font-semibold hover:underline focus:outline-none ml-1"
              >
                Register
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }} 
                className="text-white font-semibold hover:underline focus:outline-none ml-1"
              >
                Log in
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
