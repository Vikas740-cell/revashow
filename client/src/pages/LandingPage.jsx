import React from 'react';
import Navbar from '../components/Navbar';
import CategoryFilters from '../components/CategoryFilters';
import EventCard from '../components/EventCard';
import { ArrowRight } from 'lucide-react';

const dummyEvents = [
  { id: 1, title: "REVAMP 2024: Annual Fest", venue: "Open Air Theatre", date: "MAR 15", category: "Festival", isFree: false, poster: "https://images.unsplash.com/photo-1540575861501-7ad0582381f2?q=80&w=2070&auto=format&fit=crop" },
  { id: 2, title: "AI/ML Workshop by GDSC", venue: "Kula Hall", date: "MAR 18", category: "Workshop", isFree: true, poster: "https://images.unsplash.com/photo-1591115765373-520b7a217217?q=80&w=2070&auto=format&fit=crop" },
  { id: 3, title: "Pratibha: Cultural Show", venue: "Auditorium", date: "MAR 20", category: "Music", isFree: false, poster: "https://images.unsplash.com/photo-1514525253344-99a4249a2213?q=80&w=2070&auto=format&fit=crop" },
  { id: 4, title: "IPL Screening: RCB vs CSK", venue: "Football Ground", date: "MAR 22", category: "Sports", isFree: true, poster: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop" },
  { id: 5, title: "Tech Hunt: Coding Challenge", venue: "Block 4 - Lab 302", date: "MAR 25", category: "Engineering", isFree: true, poster: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop" },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <CategoryFilters />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Banner Section */}
        <section className="mb-12 rounded-2xl overflow-hidden relative aspect-[21/9] sm:aspect-[21/6] group cursor-pointer shadow-2xl">
           <img 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop" 
            alt="Main Banner"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-8">
              <span className="bg-red-600 text-[10px] font-black w-fit px-2 py-1 rounded mb-4 tracking-widest uppercase">Now Trending</span>
              <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-2">Reva Mahotsav 2024</h1>
              <p className="text-slate-300 text-sm md:text-lg max-w-2xl font-light">Experience the grandest cultural celebration of REVA University. Book your tickets now for the star-studded night!</p>
           </div>
        </section>

        {/* Recommended Events Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-2">
              <span className="w-1 h-8 bg-red-600"></span>
              Recommended Events
            </h2>
            <button className="text-red-500 hover:text-red-400 text-sm font-bold flex items-center gap-1 transition-colors group">
              See All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {dummyEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* Categories Section (Visual Grid) */}
        <section className="mb-12">
           <h2 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-2 mb-6">
              <span className="w-1 h-8 bg-red-600"></span>
              Explore by Space
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {['Indoor', 'Outdoor', 'Labs', 'Grounds'].map((place, idx) => (
                 <div key={idx} className="h-32 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 hover:border-red-600/50 transition-all group overflow-hidden relative">
                    <span className="text-white font-bold text-lg relative z-10">{place}</span>
                    <span className="text-[10px] text-red-500 font-bold tracking-widest uppercase relative z-10 transition-transform group-hover:scale-110">Find Venue</span>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                 </div>
               ))}
            </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-4 mt-20">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
               <span className="text-2xl font-black text-red-600 tracking-tighter uppercase italic mb-4 block">RevaShow</span>
               <p className="text-slate-400 text-sm leading-relaxed">The official event discovery and booking platform for REVA University students and faculty.</p>
            </div>
            <div>
               <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-widest">Support</h4>
               <ul className="text-slate-500 text-sm space-y-2">
                  <li className="hover:text-red-500 cursor-pointer transition-colors">Help Center</li>
                  <li className="hover:text-red-500 cursor-pointer transition-colors">Terms of Service</li>
                  <li className="hover:text-red-500 cursor-pointer transition-colors">Privacy Policy</li>
               </ul>
            </div>
            <div>
               <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-widest">Connect</h4>
               <ul className="text-slate-500 text-sm space-y-2">
                  <li className="hover:text-red-500 cursor-pointer transition-colors">GDSC REVA</li>
                  <li className="hover:text-red-500 cursor-pointer transition-colors">IEEE Student Branch</li>
                  <li className="hover:text-red-500 cursor-pointer transition-colors">D-Sense Club</li>
               </ul>
            </div>
            <div>
               <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <h4 className="text-white font-bold mb-2 text-xs uppercase tracking-widest">Get Updates</h4>
                  <input type="text" placeholder="REVA Email" className="w-full bg-slate-950 border-none rounded py-2 px-3 text-xs mb-3 focus:ring-1 focus:ring-red-600" />
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-xs transition-colors">Subscribe</button>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
