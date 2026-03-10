import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
  Shield, Users, Calendar, BarChart3,
  Trash2, Check, X, ShieldAlert,
  Search, ExternalLink, Mail, Phone,
  TrendingUp, ListOrdered, CheckCircle,
  Clock, AlertCircle, Loader2
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'events') {
        const res = await api.get('/admin/events');
        setEvents(res.data);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerateEvent = async (id, status) => {
    try {
      await api.patch(`/admin/events/${id}/status`, { status });
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    } catch (err) {
      alert("Moderation failed");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This is irreversible.")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleRoleUpdate = async (id, newRole) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const filteredUsers = users.filter(u =>
    (u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (u.srn && u.srn.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900/50 border-r border-white/5 min-h-[calc(100vh-64px)] hidden md:block">
          <div className="p-6">
            <h2 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-6 px-4 italic underline">REVA Audit Hub</h2>
            <nav className="space-y-1">
              {[
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'events', label: 'Moderation', icon: Calendar },
                { id: 'users', label: 'User Hub', icon: Users },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === item.id
                      ? 'bg-red-600/10 text-red-500 border border-red-600/20 shadow-lg shadow-red-900/10'
                      : 'hover:bg-white/5 text-slate-400'
                    }`}
                >
                  <item.icon size={18} />
                  {item.label}
                  {item.id === 'events' && events.filter(e => e.status === 'PENDING').length > 0 && (
                    <span className="ml-auto bg-red-600 text-[10px] text-white font-black px-1.5 py-0.5 rounded-full ring-2 ring-slate-950">
                      {events.filter(e => e.status === 'PENDING').length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-6 md:p-10">
          <div className="mb-10 flex flex-col md:items-center md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 select-none">University Oversight</h1>
              <p className="text-slate-500 text-sm font-medium">Control panel for REVA Show administrators.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                <Shield size={16} className="text-red-500" />
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Restricted Access</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
              <p className="text-xs uppercase font-black tracking-widest text-slate-600">Syncing with Campus Database...</p>
            </div>
          ) : (
            <>
              {/* Analytics Tab */}
              {activeTab === 'analytics' && stats && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Users', val: stats.totalUsers, icon: Users, color: 'text-blue-500' },
                      { label: 'Campus Events', val: stats.totalEvents, icon: Calendar, color: 'text-purple-500' },
                      { label: 'Total Tickets', val: stats.totalRegistrations, icon: TrendingUp, color: 'text-red-500' },
                      { label: 'Admin Logs', val: 'Active', icon: Shield, color: 'text-emerald-500' },
                    ].map((s, idx) => (
                      <div key={idx} className="bg-slate-900 border border-white/5 p-6 rounded-3xl hover:border-red-600/20 transition-all group">
                        <div className="flex items-center justify-between mb-2">
                          <s.icon className={`${s.color} opacity-80 group-hover:scale-110 transition-transform`} size={24} />
                          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Global</span>
                        </div>
                        <p className="text-3xl font-black text-white italic tracking-tighter leading-none mb-1">{s.val}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem]">
                      <h3 className="font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-2">
                        <BarChart3 className="text-red-500" size={20} /> Role Distribution
                      </h3>
                      <div className="space-y-4">
                        {stats.roleDistribution?.map((r, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-1">
                              <span className="text-slate-400 italic">{r.role}s</span>
                              <span className="text-white">{r._count}</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-600 rounded-full"
                                style={{ width: `${(r._count / stats.totalUsers) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center">
                      <ShieldAlert className="text-red-600/20 mb-4" size={64} />
                      <h3 className="text-xl font-black text-slate-400 uppercase italic tracking-tight mb-2 leading-none">System Integrity</h3>
                      <p className="text-xs text-slate-600 font-bold uppercase tracking-widest max-w-[200px]">All infrastructure metrics are within normal parameters</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Moderation Tab */}
              {activeTab === 'events' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 gap-4">
                    {events.length > 0 ? events.map((event) => (
                      <div key={event.id} className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                          <div className="w-20 h-20 rounded-2xl bg-slate-800 flex-shrink-0 overflow-hidden border border-white/5">
                            {event.poster ? <img src={event.poster} className="w-full h-full object-cover" /> : <Calendar size={32} className="text-slate-700 m-auto mt-6" />}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ring-1 ring-inset ${event.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20' :
                                  event.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 ring-red-500/20' :
                                    'bg-amber-500/10 text-amber-500 ring-amber-500/20 animate-pulse'
                                }`}>
                                {event.status}
                              </span>
                              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{event.category?.name}</span>
                            </div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1 leading-none">{event.title}</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase flex items-center gap-1">
                              <Users size={12} className="text-red-600" /> {event.organizer?.name || 'Unknown'} • <Mail size={12} /> {event.organizer?.email || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                          {event.status !== 'PUBLISHED' && (
                            <button
                              onClick={() => handleModerateEvent(event.id, 'PUBLISHED')}
                              className="flex-grow md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-6 rounded-xl transition-all uppercase tracking-widest text-[10px] italic"
                            >
                              <Check size={16} /> Approve
                            </button>
                          )}
                          {event.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleModerateEvent(event.id, 'REJECTED')}
                              className="flex-grow md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-950 text-red-500 font-black py-3 px-6 rounded-xl transition-all uppercase tracking-widest text-[10px] italic border border-white/10"
                            >
                              <X size={16} /> Reject
                            </button>
                          )}
                          <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"><ExternalLink size={16} /></button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-24 opacity-30">
                        <ShieldAlert size={64} className="mx-auto mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest italic">No events requiring attention</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* User Management Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Audit scan: Search by name, SRN, or email..."
                      className="w-full bg-slate-900 border border-white/5 rounded-[2rem] pl-16 pr-8 py-5 text-white font-bold focus:border-red-600 outline-none transition-all shadow-xl"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Identifier</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Role</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Stats</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-8">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-red-500 border border-white/10 font-black tracking-tighter">
                                  {u.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="text-white font-black uppercase italic tracking-tighter text-base">{u.name}</p>
                                  <p className="text-xs text-slate-500 font-bold">{u.email}</p>
                                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-0.5">{u.srn || 'GENERAL'} • {u.department || 'REVA'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-8">
                              <select
                                className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white outline-none cursor-pointer hover:border-red-600/50 transition-colors"
                                value={u.role}
                                onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                              >
                                <option value="STUDENT">STUDENT</option>
                                <option value="ORGANIZER">ORGANIZER</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            </td>
                            <td className="p-8">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <p className="text-sm font-black text-white italic leading-none">{u._count?.registrations || 0}</p>
                                  <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Bookings</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-black text-white italic leading-none">{u._count?.events || 0}</p>
                                  <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Events</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-8 text-right">
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all border border-red-600/20"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
