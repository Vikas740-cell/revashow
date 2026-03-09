import React from 'react';

const categories = [
  "All", "Music", "Engineering", "Clubs", "Festivals", "Workshops", "Sports", "Theatre", "Health"
];

const CategoryFilters = ({ activeCategory, setCategory }) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 py-3 overflow-x-auto scrollbar-hide">
      <div className="max-w-7xl mx-auto px-4 flex gap-4">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setCategory(cat)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat 
              ? "bg-red-600 text-white shadow-lg shadow-red-900/40" 
              : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilters;
