import React, { useState, useEffect } from 'react';
import { Search, MapPin, ChevronDown, User, Menu, LogOut, Bell, Clock, Info, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ onSearch, searchTerm = '' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <span className="text-2xl font-black text-red-600 tracking-tighter uppercase italic">
              RevaShow
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-grow max-w-2xl relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-red-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchTerm}
              className="block w-full bg-slate-800 border-none rounded-sm py-2 pl-10 pr-3 text-slate-300 placeholder-slate-500 focus:ring-1 focus:ring-red-600 focus:bg-slate-700 transition-all text-sm"
              placeholder="Search for Events, Clubs, Activities..."
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer transition-colors text-sm">
              <span className="font-medium">REVA Main Campus</span>
              <ChevronDown size={14} />
            </div>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-[10px] font-black flex items-center justify-center rounded-full border-2 border-slate-900 animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-80 bg-slate-900 border border-white/5 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-widest text-white italic">Campus Alerts</h4>
                      <button className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-widest">Mark All Read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
                      {notifications.length > 0 ? notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-4 hover:bg-white/5 transition-colors cursor-pointer group ${!n.isRead ? 'bg-red-600/5' : ''}`}
                          onClick={() => markRead(n.id)}
                        >
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-lg h-fit ${n.type === 'ALERT' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                              {n.type === 'ALERT' ? <AlertTriangle size={14} /> : n.type === 'REMINDER' ? <Clock size={14} /> : <Info size={14} />}
                            </div>
                            <div>
                              <p className={`text-xs font-black uppercase italic tracking-tighter ${!n.isRead ? 'text-white' : 'text-slate-400'}`}>{n.title}</p>
                              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                              <p className="text-[8px] text-slate-600 mt-2 font-bold uppercase">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="p-10 text-center opacity-30 flex flex-col items-center">
                          <Bell size={32} className="mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Quiet on campus</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="relative">
                <div
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:block text-xs font-bold text-slate-300 group-hover:text-white transition-colors uppercase tracking-wider">
                    Hi, {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown size={14} className="text-slate-500" />
                </div>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2 z-50 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-2 border-b border-slate-700">
                      <p className="text-xs font-bold text-white uppercase tracking-widest">{user.role}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    {user.role === 'ORGANIZER' && <Link to="/organizer" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">Dashboard</Link>}
                    {user.role === 'ADMIN' && <Link to="/admin" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">Admin Panel</Link>}
                    <button
                      onClick={() => { logout(); navigate('/'); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-slate-700 flex items-center gap-2"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-6 py-1.5 rounded text-xs font-bold transition-all shadow-lg shadow-red-900/20 uppercase tracking-widest">
                Sign In
              </Link>
            )}

            <div className="md:hidden text-slate-300">
              <Menu size={24} />
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
