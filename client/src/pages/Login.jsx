import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'STUDENT') navigate('/');
      else if (user.role === 'ORGANIZER') navigate('/organizer');
      else if (user.role === 'ADMIN') navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-red-600 italic uppercase tracking-tighter">RevaShow</h2>
          <p className="text-slate-400 mt-2 text-sm">Welcome back! Please login to your account.</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <Mail className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
            <input
              type="email"
              placeholder="REVA Email"
              className="w-full bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-600 transition-all font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-600 transition-all font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
          >
            <LogIn size={20} /> Login
          </button>
        </form>

        <p className="text-center text-slate-500 mt-8 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-red-500 hover:underline font-bold">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
