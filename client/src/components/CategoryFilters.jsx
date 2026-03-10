import { Calendar, X } from 'lucide-react';

const categories = [
  "All", "Technical", "Cultural", "Sports", "Academic", "Workshop", "Seminar"
];

const CategoryFilters = ({ activeCategory, setCategory, selectedDate, setSelectedDate }) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 sticky top-16 z-40 backdrop-blur-md bg-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/40"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-white/5"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all cursor-pointer ${selectedDate
                ? "bg-red-600/10 border-red-500 text-red-500 shadow-lg shadow-red-900/20"
                : "bg-slate-800 border-white/5 text-slate-400 hover:text-white"
              }`}>
              <Calendar size={14} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black uppercase tracking-widest cursor-pointer w-[100px]"
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="hover:scale-125 transition-transform"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {selectedDate && (
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic animate-in fade-in slide-in-from-right-2">
              Viewing: {new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilters;
