import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Hash, Building2, Phone } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', srn: '', department: '', phone: ''
  });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-red-600 italic uppercase tracking-tighter">RevaShow</h2>
          <p className="text-slate-400 mt-2 text-sm">Join the campus ecosystem. Register now!</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <User className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
            <input
              name="name"
              placeholder="Full Name"
              className="w-full bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-600"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative group">
            <Mail className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
            <input
              name="email"
              type="email"
              placeholder="REVA Email"
              className="w-full bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-600"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="relative group">
                <Hash className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input
                  name="srn"
                  placeholder="SRN"
                  className="w-full bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-600"
                  value={formData.srn}
                  onChange={handleChange}
                  required
                />
             </div>
             <div className="relative group">
                <Building2 className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input
                  name="department"
                  placeholder="Dept."
                  className="w-full bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-600"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
             </div>
          </div>

          <div className="relative group">
            <Phone className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
            <input
              name="phone"
              placeholder="Phone Number"
              className="w-full bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-600"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
            <input
              name="password"
              type="password"
              placeholder="Create Password"
              className="w-full bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-600"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-900/20 mt-4"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-slate-500 mt-8 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-red-500 hover:underline font-bold">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
