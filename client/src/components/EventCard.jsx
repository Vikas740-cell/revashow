import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventCard = ({ event, compact = false }) => {
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short' };
    return new Date(dateString).toLocaleDateString('en-US', options).toUpperCase();
  };

  const seatsRemaining = event.maxSeats - (event._count?.registrations || 0);
  const isFillingFast = seatsRemaining > 0 && seatsRemaining <= 10;

  return (
    <Link to={`/events/${event.id}`} className={`block group ${compact ? 'max-w-[180px]' : ''}`}>
      <div className="group cursor-pointer transform hover:-translate-y-1 transition-all duration-300">
        {/* Poster Image Container */}
        <div className={`relative overflow-hidden rounded-2xl bg-slate-800 shadow-xl group-hover:shadow-red-900/40 transition-all duration-300 ${compact ? 'aspect-[3/4]' : 'aspect-[2/3]'}`}>
          <img 
            src={event.poster || `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop`} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {/* Overlay for Date */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] uppercase font-black text-white border border-white/10 tracking-widest">
            {formatDate(event.date)}
          </div>

          {/* Seat Availability Overlay */}
          {isFillingFast && (
             <div className="absolute bottom-3 left-3 right-3 bg-red-600/90 backdrop-blur-md py-1.5 rounded-lg text-center shadow-xl border border-white/20 animate-pulse">
                <p className="text-[8px] font-black uppercase text-white tracking-widest">Last {seatsRemaining} Seats Left!</p>
             </div>
          )}
        </div>

        {/* Details */}
        <div className="mt-4">
          <h3 className={`text-white font-black uppercase italic tracking-tighter truncate group-hover:text-red-500 transition-colors ${compact ? 'text-sm' : 'text-lg'}`}>
            {event.title}
          </h3>
          {!compact && (
            <p className="text-slate-500 text-xs mt-1 flex items-center gap-1 group-hover:text-slate-400 transition-colors font-bold uppercase tracking-wider">
              <MapPin size={12} className="text-red-600" />
              {event.venue}
            </p>
          )}
          <div className="flex items-center justify-between mt-3">
             <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{event.category?.name || 'General'}</span>
             <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-widest ${!event.price || event.price === 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
               {!event.price || event.price === 0 ? 'FREE' : `₹${event.price}`}
             </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
