import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

const EventCard = ({ event }) => {
  return (
    <div className="group cursor-pointer">
      {/* Poster Image Container */}
      <div className="relative overflow-hidden rounded-xl aspect-[2/3] bg-slate-800 shadow-xl group-hover:shadow-red-900/20 transition-all duration-300">
        <img 
          src={event.poster || `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop`} 
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Overlay for Date */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] uppercase font-bold text-white border border-white/10">
          {event.date}
        </div>
      </div>

      {/* Details */}
      <div className="mt-3">
        <h3 className="text-white font-bold text-base truncate group-hover:text-red-500 transition-colors">
          {event.title}
        </h3>
        <p className="text-slate-400 text-xs mt-1 flex items-center gap-1 group-hover:text-slate-300 transition-colors">
          <MapPin size={12} className="text-red-600" />
          {event.venue}
        </p>
        <div className="flex items-center justify-between mt-2">
           <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{event.category}</span>
           <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${event.isFree ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
             {event.isFree ? 'FREE' : 'PAID'}
           </span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
