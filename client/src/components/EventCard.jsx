import React from 'react';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventCard = ({ event, compact = false }) => {
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short' };
    return new Date(dateString).toLocaleDateString('en-US', options).toUpperCase();
  };

  const seatsRemaining = event.maxSeats - (event._count?.registrations || 0);
  const isFillingFast = seatsRemaining > 0 && seatsRemaining <= 10;
  const isHousefull = seatsRemaining <= 0;

  return (
    <div className={`group relative bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-red-600/30 hover:shadow-2xl hover:shadow-red-900/20 hover:-translate-y-2 ${compact ? 'w-full' : ''}`}>
      {/* Poster Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={event.poster || `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop`}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl">
            {event.category?.name || 'Event'}
          </span>
        </div>

        {/* Date Badge */}
        <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md border border-white/10 p-2 rounded-2xl flex flex-col items-center min-w-[50px]">
          <span className="text-red-500 text-xs font-black leading-none">{formatDate(event.date).split(' ')[0]}</span>
          <span className="text-white text-[8px] font-bold uppercase tracking-tighter mt-1">{formatDate(event.date).split(' ')[1]}</span>
        </div>

        {/* Seats Status */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md border ${isHousefull ? 'bg-slate-950/80 border-slate-700 text-slate-500' : isFillingFast ? 'bg-red-600/20 border-red-600/50 text-red-500 animate-pulse' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500'}`}>
            <Users size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">
              {isHousefull ? 'Housefull' : isFillingFast ? `${seatsRemaining} Seats Left` : 'Available'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight mb-2 group-hover:text-red-500 transition-colors line-clamp-1">
          {event.title}
        </h3>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <Calendar size={14} className="text-red-600" />
            <span>{new Date(event.date).toDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <MapPin size={14} className="text-red-600" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-red-600 text-white hover:text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border border-white/10 hover:border-red-600 shadow-xl"
        >
          View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
