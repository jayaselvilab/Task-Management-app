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
        
        setSuccessMessage('Registration successful! Please log in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Authentication failed. Please check your details.'
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-lg text-center border border-stone-200">
          <h1 className="text-3xl font-bold text-stone-800 mb-3">
            Welcome back, {loggedInUser}!
          </h1>
          <p className="text-stone-500 mb-8 text-base">Your task manager dashboard is ready to go.</p>
          <button
            onClick={handleLogout}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 rounded-xl transition duration-200 shadow-md shadow-rose-500/20 text-base"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl border border-stone-200/80 p-10 rounded-3xl shadow-2xl w-full max-w-lg">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-950 tracking-tight">Task Manager</h1>
          <p className="text-stone-500 text-sm mt-1">Organize your daily workflow seamlessly</p>
        </div>

        <div className="flex bg-stone-100 p-1.5 rounded-2xl mb-8 border border-stone-200/60">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
              isLogin ? 'bg-indigo-600 text-white shadow-md' : 'text-stone-600 hover:text-indigo-950'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
              !isLogin ? 'bg-indigo-600 text-white shadow-md' : 'text-stone-600 hover:text-indigo-950'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl font-medium">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl font-medium">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!
