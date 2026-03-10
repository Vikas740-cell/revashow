import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CategoryFilters from '../components/CategoryFilters';
import EventCard from '../components/EventCard';
import { getEvents, getTrendingEvents, getRecommendations } from '../services/eventService';
import { ArrowRight, MapPin, Loader2, Sparkles, TrendingUp } from 'lucide-react';

const LandingPage = () => {
  const [events, setEvents] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allEvents, trendingData, recommendedData] = await Promise.all([
          getEvents(),
          getTrendingEvents(),
          getRecommendations()
        ]);
        setEvents(allEvents);
        setTrending(trendingData);
        setRecommendations(recommendedData);
      } catch (err) {
        console.error("Error fetching landing page data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEvents = events.filter(event => {
    const titleMatch = event.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const venueMatch = event.venue?.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = activeCategory === 'All' || event.category?.name === activeCategory;

    // Date match logic
    const eventDate = new Date(event.date).toISOString().split('T')[0];
    const dateMatch = !selectedDate || eventDate === selectedDate;

    return (titleMatch || venueMatch) && categoryMatch && dateMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-red-600 animate-spin" size={48} />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs animate-pulse">Syncing Campus Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-red-600/30">
      <Navbar searchTerm={searchTerm} onSearch={setSearchTerm} />
      <CategoryFilters
        activeCategory={activeCategory}
        setCategory={setActiveCategory}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* Banner Section */}
        <section className="mb-16 rounded-3xl overflow-hidden relative aspect-[21/9] sm:aspect-[21/6] group cursor-pointer shadow-2xl ring-1 ring-white/10">
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
            alt="Main Banner"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-8 md:p-12">
            <div className="flex items-center gap-2 mb-4 bg-red-600/90 text-white text-[10px] font-black w-fit px-3 py-1 rounded-full uppercase tracking-widest shadow-xl backdrop-blur-md">
              <Sparkles size={12} /> Live Event
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter uppercase mb-3 leading-none drop-shadow-2xl">
              Reva Show <span className="text-red-600">2024</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-xl max-w-2xl font-medium leading-tight opacity-80">
              The grandest celebration of talent, culture, and innovation at REVA University.
            </p>
          </div>
        </section>

        {/* Personalized Recommendations Section */}
        {recommendations.length > 0 && (
          <section className="mb-16 animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                <Sparkles className="text-red-600" size={28} />
                Picked For You
              </h2>
              <button className="text-slate-500 hover:text-white text-xs font-black flex items-center gap-1 transition-all uppercase tracking-widest">
                Explore <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {recommendations.map(event => (
                <EventCard key={event.id} event={event} compact />
              ))}
            </div>
          </section>
        )}

        {/* Trending Events Section */}
        {trending.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                <TrendingUp className="text-red-600" size={28} />
                Trending Now
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trending.slice(0, 3).map((event, idx) => (
                <div key={event.id} className="relative h-72 rounded-[2rem] overflow-hidden group cursor-pointer shadow-2xl border border-white/5 bg-slate-900">
                  <img
                    src={event.poster || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop"}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale-[0.5] group-hover:grayscale-0"
                    alt={event.title}
                  />
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    <span className="bg-white text-black text-[10px] font-black px-2 py-1 rounded italic uppercase tracking-widest shadow-xl">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 group-hover:text-red-500 transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <MapPin size={12} className="text-red-500" /> {event.venue}
                      </p>
                      <span className="text-red-500 text-[10px] font-black uppercase tracking-widest italic animate-pulse">
                        {event._count?.registrations} Booked
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Global Feed Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-10 bg-red-600 rounded-full"></span>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                All Campus Events
              </h2>
              <span className="bg-slate-800 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/5">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} FOUND
              </span>
            </div>

            {(searchTerm || activeCategory !== 'All' || selectedDate) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('All');
                  setSelectedDate('');
                }}
                className="text-[10px] font-black text-red-500 hover:text-white transition-colors uppercase tracking-[0.2em] italic border-b border-red-500/30 pb-0.5"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-slate-600 text-center py-24 bg-slate-950 rounded-[3rem] border border-dashed border-white/5 uppercase font-black tracking-[0.2em] text-sm animate-in fade-in duration-500">
              Zero matches for your search
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900/50 backdrop-blur-md border-t border-white/5 py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <span className="text-3xl font-black text-red-600 tracking-tighter uppercase italic mb-6 block drop-shadow-xl underline decoration-white/10 underline-offset-8">RevaShow</span>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">The official high-performance event discovery and booking portal for REVA University students, faculty, and visionaries.</p>
          </div>
          <div>
            <h4 className="text-white font-black mb-6 uppercase text-[10px] tracking-[0.3em] text-slate-400 border-b border-white/5 pb-2 w-fit">Operations</h4>
            <ul className="text-slate-500 text-xs font-bold space-y-3 uppercase tracking-widest">
              <li className="hover:text-red-500 cursor-pointer transition-colors flex items-center gap-2"><ArrowRight size={12} /> Support hub</li>
              <li className="hover:text-red-500 cursor-pointer transition-colors flex items-center gap-2"><ArrowRight size={12} /> Compliance</li>
              <li className="hover:text-red-500 cursor-pointer transition-colors flex items-center gap-2"><ArrowRight size={12} /> Campus Guidelines</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black mb-6 uppercase text-[10px] tracking-[0.3em] text-slate-400 border-b border-white/5 pb-2 w-fit">Ecosystem</h4>
            <ul className="text-slate-500 text-xs font-bold space-y-3 uppercase tracking-widest">
              <li className="hover:text-red-500 cursor-pointer transition-colors">Digital REVA</li>
              <li className="hover:text-red-500 cursor-pointer transition-colors">ACM REVA</li>
              <li className="hover:text-red-500 cursor-pointer transition-colors">Art Society</li>
            </ul>
          </div>
          <div>
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-600/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              <h4 className="text-white font-black mb-4 text-xs uppercase tracking-[0.2em] italic relative z-10">Broadcast List</h4>
              <input type="text" placeholder="REVA Mail ID" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs mb-4 focus:ring-1 focus:ring-red-600 text-white placeholder-slate-700 font-bold relative z-10" />
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl text-[10px] transition-all shadow-lg shadow-red-900/40 uppercase tracking-[0.2em] italic relative z-10">Authorize Access</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">© 2024 RevaShow • Engineered for Campus Excellence</p>
          <div className="flex gap-6">
            <span className="text-slate-700 hover:text-red-600 text-[10px] font-black uppercase cursor-pointer transition-all">Instagram</span>
            <span className="text-slate-700 hover:text-red-600 text-[10px] font-black uppercase cursor-pointer transition-all">X / Twitter</span>
            <span className="text-slate-700 hover:text-red-600 text-[10px] font-black uppercase cursor-pointer transition-all">LinkedIn</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
