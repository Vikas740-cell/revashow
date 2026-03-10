import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import QRScanner from '../components/QRScanner';
import {
  Plus, LayoutDashboard, Calendar, Users,
  Send, FileDown, MoreVertical, Edit,
  Trash2, CheckCircle, Clock, XCircle,
  TrendingUp, Activity, MessageSquare, Save,
  X, AlertCircle, Loader2, Search, Scan
} from 'lucide-react';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 0, totalRegistrations: 0, activeEvents: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '', description: '', rules: '', categoryName: 'Workshops',
    date: '', time: '', venue: '', maxSeats: 100, poster: '',
    contactName: '', contactPhone: ''
  });

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const fetchOrganizerData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events/organizer');
      setEvents(res.data);

      const totalRegs = res.data.reduce((acc, ev) => acc + (ev._count?.registrations || 0), 0);
      setStats({
        totalEvents: res.data.length,
        totalRegistrations: totalRegs,
        activeEvents: res.data.filter(e => new Date(e.date) >= new Date()).length
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', formData);
      setShowCreateModal(false);
      fetchOrganizerData();
      // Reset form
      setFormData({
        title: '', description: '', rules: '', categoryName: 'Workshops',
        date: '', time: '', venue: '', maxSeats: 100, poster: '',
        contactName: '', contactPhone: ''
      });
    } catch (err) {
      alert("Failed to create event");
    }
  };

  const fetchParticipants = async (eventId) => {
    setSelectedEventId(eventId);
    setActiveTab('participants');
    try {
      const res = await api.get(`/events/${eventId}/participants`);
      setParticipants(res.data);
    } catch (err) {
      console.error("Error fetching participants:", err);
    }
  };

  const handleStatusUpdate = async (regId, newStatus) => {
    try {
      await api.patch(`/registrations/${regId}/status`, { status: newStatus });
      // Update local state
      setParticipants(prev => prev.map(p => p.id === regId ? { ...p, status: newStatus } : p));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const exportToCSV = (event) => {
    const headers = ['Name', 'Email', 'SRN', 'Department', 'Phone', 'Status', 'Registered At'];
    const rows = participants.map(p => [
      p.user?.name || 'Unknown',
      p.user?.email || 'N/A',
      p.user?.srn || 'N/A',
      p.user?.department || 'N/A',
      p.user?.phone || 'N/A',
      p.status,
      new Date(p.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `participants_${event.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-red-600/30">
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900/50 border-r border-white/5 min-h-[calc(100vh-64px)] hidden md:block">
          <div className="p-6">
            <h2 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-6 px-4">Management Console</h2>
            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'events', label: 'My Events', icon: Calendar },
                { id: 'scan', label: 'Scan Ticket', icon: Scan },
                { id: 'create', label: 'Create New', icon: Plus },
                { id: 'reports', label: 'Reports', icon: FileDown },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === item.id
                      ? 'bg-red-600/10 text-red-500 border border-red-600/20'
                      : 'hover:bg-white/5 text-slate-400'
                    }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-6 md:p-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
              <p className="text-xs uppercase font-black tracking-widest text-slate-600">Syncing Data...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                    {activeTab === 'overview' && 'Dashboard Overview'}
                    {activeTab === 'events' && 'Event Catalog'}
                    {activeTab === 'scan' && 'Pass Verification'}
                    {activeTab === 'create' && 'Launch New Event'}
                    {activeTab === 'participants' && 'Participant Roster'}
                    {activeTab === 'reports' && 'Insight Reports'}
                  </h1>
                  <p className="text-slate-500 text-sm font-medium">Empowering REVA University organizers.</p>
                </div>
                {activeTab !== 'create' && (
                  <button
                    onClick={() => setActiveTab('create')}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black py-3 px-6 rounded-xl transition-all uppercase tracking-widest text-xs italic shadow-lg shadow-red-900/40"
                  >
                    <Plus size={18} /> New Event
                  </button>
                )}
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Live Events', val: stats.activeEvents, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                      { label: 'Total Registrations', val: stats.totalRegistrations, icon: Users, color: 'text-red-500', bg: 'bg-red-500/10' },
                      { label: 'Success Rate', val: '94%', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    ].map((s, idx) => (
                      <div key={idx} className="bg-slate-900 border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
                            <s.icon size={24} />
                          </div>
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">MTD Analysis</span>
                        </div>
                        <p className="text-4xl font-black text-white italic tracking-tighter leading-none mb-1">{s.val}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                      <h3 className="font-black text-white uppercase italic tracking-tighter">Recent Event Performance</h3>
                      <button className="text-red-500 text-xs font-black uppercase tracking-widest hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-white/5">
                      {events.slice(0, 5).map((event) => (
                        <div key={event.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => fetchParticipants(event.id)}>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5 overflow-hidden">
                              {event.poster ? <img src={event.poster} className="w-full h-full object-cover" /> : <Calendar size={20} className="text-slate-600" />}
                            </div>
                            <div>
                              <p className="text-white font-bold">{event.title}</p>
                              <p className="text-xs text-slate-500 uppercase font-black tracking-widest leading-none mt-1">
                                {new Date(event.date).toLocaleDateString()} • {event.venue}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black text-red-500 italic leading-none">{event._count?.registrations || 0}</p>
                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-1">Registrations</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* My Events Tab */}
              {activeTab === 'events' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div key={event.id} className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden group hover:border-red-600/30 transition-all duration-300">
                      <div className="h-40 relative">
                        {event.poster ? (
                          <img src={event.poster} alt={event.title} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center"><Calendar size={48} className="text-slate-700" /></div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="bg-red-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest text-white italic">
                            {event.category?.name}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-4">{event.title}</h3>
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Calendar size={14} className="text-red-600" />
                            <span className="text-xs font-bold uppercase">{new Date(event.date).toDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin size={14} className="text-red-600" />
                            <span className="text-xs font-bold uppercase">{event.venue}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Users size={14} className="text-red-600" />
                            <span className="text-xs font-bold uppercase">{event._count?.registrations} / {event.maxSeats} Booked</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => fetchParticipants(event.id)} className="flex-grow bg-white/5 hover:bg-white/10 text-white font-black py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all">Manage</button>
                          <button className="p-2 bg-white/5 hover:bg-red-600/20 text-red-500 rounded-xl transition-all"><Edit size={16} /></button>
                          <button className="p-2 bg-white/5 hover:bg-red-600/20 text-red-500 rounded-xl transition-all"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create Event Tab */}
              {activeTab === 'create' && (
                <div className="max-w-4xl bg-slate-900 border border-white/5 rounded-3xl p-8 md:p-12">
                  <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-2">Event Poster URL</label>
                        <input
                          type="text"
                          placeholder="Direct image link"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none transition-all font-bold placeholder:text-slate-700"
                          value={formData.poster}
                          onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-2 font-bold italic underline">Event Identity</label>
                        <input
                          type="text"
                          placeholder="Event Title"
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xl font-black italic uppercase italic tracking-tighter focus:border-red-600 outline-none transition-all"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-2">Category</label>
                          <select
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none"
                            value={formData.categoryName}
                            onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                          >
                            <option>Workshops</option>
                            <option>Music/Arts</option>
                            <option>Sports</option>
                            <option>Hackathons</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-2">Max Capacity</label>
                          <input
                            type="number"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                            value={formData.maxSeats}
                            onChange={(e) => setFormData({ ...formData, maxSeats: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-2">Brief Description</label>
                        <textarea
                          rows="4"
                          placeholder="What's the buzz?"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium resize-none focus:border-red-600 outline-none transition-all"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-2">Date</label>
                          <input
                            type="date"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-2">Time Slot</label>
                          <input
                            type="text"
                            placeholder="e.g. 10:00 AM - 4:00 PM"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-2">Venue / Lab / Auditorium</label>
                        <input
                          type="text"
                          placeholder="REVA University Location"
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                          value={formData.venue}
                          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-2">Rules & Guidelines</label>
                        <textarea
                          rows="3"
                          placeholder="Eligibility, dress code, etc."
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium resize-none focus:border-red-600 outline-none transition-all"
                          value={formData.rules}
                          onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                        ></textarea>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-2">POC Name</label>
                          <input
                            type="text"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                            value={formData.contactName}
                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-2">POC Phone</label>
                          <input
                            type="text"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                            value={formData.contactPhone}
                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 pt-6">
                      <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-[0.2em] italic text-sm shadow-xl shadow-red-900/40">
                        Deploy Event to Campus
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Participants Tab */}
              {activeTab === 'participants' && (
                <div className="space-y-6">
                  {/* Participant Filter Bar */}
                  <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                    <div className="relative flex-grow max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        type="text"
                        placeholder="Search by name, SRN, or department..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white font-bold text-sm focus:border-red-600 outline-none transition-all"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => exportToCSV(events.find(e => e.id === selectedEventId))} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl transition-all">
                        <FileDown size={14} /> Export CSV
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Participant</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">SRN / Dept.</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {participants.length > 0 ? participants.map((p) => (
                          <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-red-500 border border-white/10 tracking-tighter">
                                  {p.user.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="text-white font-black uppercase italic tracking-tighter text-sm">{p.user.name}</p>
                                  <p className="text-xs text-slate-500 font-bold">{p.user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-6">
                              <p className="text-white font-mono text-xs mb-1 uppercase opacity-80">{p.user.srn || 'N/A'}</p>
                              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{p.user.department || 'GENERAL'}</p>
                            </td>
                            <td className="p-6">
                              <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest flex w-fit items-center gap-1.5 ${p.status === 'ATTENDED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                  p.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                    'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                }`}>
                                {p.status === 'ATTENDED' ? <CheckCircle size={10} /> : p.status === 'CANCELLED' ? <XCircle size={10} /> : <Clock size={10} />}
                                {p.status}
                              </span>
                            </td>
                            <td className="p-6">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleStatusUpdate(p.id, 'ATTENDED')}
                                  className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg transition-all border border-emerald-500/20"
                                  title="Mark as Attended"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(p.id, 'CANCELLED')}
                                  className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all border border-red-500/20"
                                  title="Cancel Registration"
                                >
                                  <XCircle size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="4" className="p-20 text-center">
                              <div className="flex flex-col items-center opacity-30">
                                <Users size={64} className="mb-4" />
                                <p className="text-xs uppercase font-black tracking-[0.2em]">No students signed up yet</p>
                              </div>
                            </td>
                          </tr>
                        )}
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

export default OrganizerDashboard;
