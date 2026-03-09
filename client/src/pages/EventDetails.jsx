import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getEventById, registerForEvent } from '../services/eventService';
import { 
  Calendar, MapPin, Users, Phone, User, 
  ChevronLeft, AlertCircle, CheckCircle2, Loader2,
  Info, ShieldCheck, CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventById(id);
        setEvent(data);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setMessage({ type: 'error', text: 'Failed to load event details.' });
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Please login to register for events.' });
      return;
    }

    if (user.role !== 'STUDENT') {
      setMessage({ type: 'error', text: 'Only students can register for events.' });
      return;
    }

    setRegistering(true);
    setMessage({ type: '', text: '' });

    try {
      const registration = await registerForEvent(id);
      setMessage({ type: 'success', text: 'Successfully registered for the event!' });
      
      // Redirect to success page after a short delay
      setTimeout(() => {
        navigate(`/registration-success/${registration.id}`);
      }, 1500);

    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="text-red-600 animate-spin mb-4" size={48} />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Loading Event Details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <AlertCircle className="text-red-600 mb-4" size={64} />
          <h2 className="text-2xl font-black text-white uppercase italic mb-2 tracking-tighter">Event Not Found</h2>
          <p className="text-slate-400 mb-6 text-center max-w-md">The event you are looking for might have been removed or is no longer available.</p>
          <Link to="/" className="bg-red-600 hover:bg-red-700 text-white font-black py-3 px-8 rounded-full transition-all uppercase tracking-widest text-sm italic shadow-lg shadow-red-900/40">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const seatsRemaining = event.maxSeats - (event._count?.registrations || 0);
  const isHousefull = seatsRemaining <= 0;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-20">
      <Navbar />
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-4 pt-8">
        <Link to="/" className="text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors group text-sm font-bold uppercase tracking-widest">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Discovery
        </Link>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Poster and Mobile Quick Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 mb-8">
                <img 
                  src={event.poster || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Quick Contact (Desktop) */}
              <div className="hidden lg:block bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
                <h4 className="text-white font-black uppercase italic tracking-tighter mb-4 flex items-center gap-2">
                  <Phone size={16} className="text-red-600" />
                  Organizer Contact
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-red-500">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Coordinator</p>
                      <p className="text-white font-bold">{event.contactName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-red-500">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Phone Number</p>
                      <p className="text-white font-bold">{event.contactPhone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Content and Registration */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Header Section */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-red-600 text-[10px] font-black px-2 py-1 rounded shadow-lg shadow-red-900/20 uppercase tracking-widest text-white italic">
                  {event.category?.name || 'General'}
                </span>
                <span className="bg-slate-800 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest text-slate-300">
                  REVA Approved
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-6 leading-none">
                {event.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-red-600/10 rounded-lg">
                    <Calendar className="text-red-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">When</h3>
                    <p className="text-white font-bold">{formatDate(event.date)}</p>
                    <p className="text-slate-400 text-sm font-medium">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-red-600/10 rounded-lg">
                    <MapPin className="text-red-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Where</h3>
                    <p className="text-white font-bold">{event.venue}</p>
                    <p className="text-slate-400 text-sm font-medium">REVA University Campus</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <section>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-2 mb-6">
                <span className="w-1 h-8 bg-red-600"></span>
                About the Event
              </h2>
              <div className="text-slate-300 leading-relaxed text-lg font-light whitespace-pre-line">
                {event.description}
              </div>
            </section>

            {/* Rules Section */}
            {event.rules && (
              <section className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-slate-800 flex flex-col items-end opacity-20">
                    <ShieldCheck size={120} />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-2 mb-6 relative z-10">
                  <span className="w-1 h-8 bg-red-600"></span>
                  Rules & Guidelines
                </h2>
                <div className="text-slate-400 text-base leading-relaxed relative z-10 whitespace-pre-line bg-slate-950/40 p-6 rounded-xl border border-slate-800">
                  {event.rules}
                </div>
              </section>
            )}

            {/* Floating/Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 p-4 z-50">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
                <div className="hidden sm:flex items-center gap-8">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Seats Remaining</span>
                    <span className={`text-xl font-black italic tracking-tighter ${isHousefull ? 'text-red-500' : 'text-white'}`}>
                      {isHousefull ? 'HOUSEFULL' : `${seatsRemaining} AVAILABLE`}
                    </span>
                  </div>
                  <div className="h-10 w-[1px] bg-slate-800"></div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Ticket Price</span>
                    <span className="text-xl font-black italic tracking-tighter text-green-500">
                      {event.price > 0 ? `₹${event.price}` : 'FREE'}
                    </span>
                  </div>
                </div>

                <div className="flex-grow sm:flex-grow-0 flex items-center gap-4">
                   {message.text && (
                    <div className={`hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                      {message.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                      {message.text}
                    </div>
                  )}

                  <button 
                    onClick={handleRegister}
                    disabled={isHousefull || registering}
                    className={`flex-grow sm:flex-none flex items-center justify-center gap-2 px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm italic transition-all shadow-2xl ${
                      isHousefull 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/40'
                    }`}
                  >
                    {registering ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Processing...
                      </>
                    ) : isHousefull ? (
                      'Housefull'
                    ) : (
                      <>
                        <CreditCard size={18} />
                        Register Now
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Mobile Message display */}
              {message.text && (
                <div className={`md:hidden mt-2 text-center text-[10px] font-bold uppercase tracking-widest ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                   {message.text}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetails;
