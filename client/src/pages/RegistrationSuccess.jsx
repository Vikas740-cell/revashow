import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { 
  CheckCircle2, Calendar, MapPin, 
  Download, Share2, ArrowLeft, 
  Map, Ticket, ShieldCheck, Loader2
} from 'lucide-react';

const RegistrationSuccess = () => {
  const { id } = useParams();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const res = await api.get(`/events/registrations/${id}`);
        setRegistration(res.data);
      } catch (err) {
        console.error("Error fetching registration:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistration();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="text-red-600 animate-spin mb-4" size={48} />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Generating Your Ticket...</p>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
         <div className="bg-red-600/10 p-6 rounded-full mb-6">
            <Ticket size={64} className="text-red-500" />
         </div>
         <h2 className="text-2xl font-black text-white uppercase italic mb-4 tracking-tighter">Ticket Not Found</h2>
         <p className="text-slate-400 mb-8 max-w-sm">We couldn't find your registration. Please check your "My Registrations" page or contact support.</p>
         <Link to="/" className="bg-red-600 hover:bg-red-700 text-white font-black py-3 px-8 rounded-full transition-all uppercase tracking-widest text-sm italic shadow-lg shadow-red-900/40">
            Back to Discovery
         </Link>
      </div>
    );
  }

  const { event } = registration;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-20 overflow-x-hidden">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        
        {/* Success Header */}
        <div className="text-center mb-12">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 mb-6 relative">
              <CheckCircle2 size={48} className="text-green-500" />
              <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></div>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">
              You're Registered!
           </h1>
           <p className="text-slate-400 text-lg">Your ticket has been generated. See you at the event!</p>
        </div>

        {/* Ticket Card */}
        <div className="relative group">
           {/* Decorative elements */}
           <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
           
           <div className="relative bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
              
              {/* Left Side: Event Info */}
              <div className="flex-grow p-8 md:p-10 border-b md:border-b-0 md:border-r border-dashed border-white/10">
                 <div className="mb-8">
                    <span className="bg-red-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest text-white italic">
                       {event.category?.name || 'REGISTRATION CONFIRMED'}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mt-4 mb-2">
                       {event.title}
                    </h2>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-slate-800 rounded-xl text-red-500">
                          <Calendar size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Date & Time</p>
                          <p className="text-white font-bold">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-slate-400 text-xs">{event.time}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-slate-800 rounded-xl text-red-500">
                          <MapPin size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Venue</p>
                          <p className="text-white font-bold">{event.venue}</p>
                          <p className="text-slate-400 text-xs">REVA University Campus</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-slate-800 rounded-xl text-red-500">
                          <ShieldCheck size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Ticket ID</p>
                          <p className="text-white font-mono text-sm tracking-wider uppercase opacity-80">{id}</p>
                       </div>
                    </div>
                 </div>

                 <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Pass Holder</p>
                       <p className="text-white font-black italic uppercase text-lg tracking-tight">STUDENT PASS</p>
                    </div>
                    <img src="/reva-logo.png" alt="REVA" className="h-8 opacity-50 grayscale" />
                 </div>
              </div>

              {/* Right Side: QR Code Area */}
              <div className="w-full md:w-80 bg-white p-10 flex flex-col items-center justify-center relative">
                 {/* Stub effect holes */}
                 <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-slate-950 rounded-full"></div>
                 <div className="hidden md:block absolute -left-3 -top-3 w-6 h-6 bg-slate-950 rounded-full"></div>
                 <div className="hidden md:block absolute -left-3 -bottom-3 w-6 h-6 bg-slate-950 rounded-full"></div>

                 <div className="relative p-2 bg-white rounded-lg mb-6">
                    <QRCodeSVG 
                       value={id} 
                       size={180}
                       level="H"
                       includeMargin={false}
                       imageSettings={{
                          src: "https://www.reva.edu.in/assets/images/reva-logo.png",
                          x: undefined,
                          y: undefined,
                          height: 24,
                          width: 24,
                          excavate: true,
                       }}
                    />
                 </div>
                 <p className="text-slate-900 font-black text-xs uppercase tracking-[0.2em] text-center">Scan at Entrance</p>
                 <p className="text-slate-400 text-[8px] font-bold uppercase mt-2 text-center leading-tight">This ticket is valid for one-time <br/> entry at REVA University</p>
              </div>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
           <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-black py-4 px-8 rounded-2xl transition-all uppercase tracking-widest text-xs italic group">
              <Download size={18} className="text-red-600 group-hover:translate-y-0.5 transition-transform" /> 
              Download PDF
           </button>
           <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-black py-4 px-8 rounded-2xl transition-all uppercase tracking-widest text-xs italic group">
              <Share2 size={18} className="text-red-600 group-hover:scale-110 transition-transform" /> 
              Share Ticket
           </button>
        </div>

        <div className="mt-12 text-center">
           <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-red-500 font-bold uppercase tracking-widest text-xs transition-colors">
              <ArrowLeft size={16} /> Back to Event Discovery
           </Link>
        </div>

      </main>
    </div>
  );
};

export default RegistrationSuccess;
