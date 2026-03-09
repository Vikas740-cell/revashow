import React from 'react';
import { Search, MapPin, ChevronDown, User, Menu } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <span className="text-2xl font-black text-red-600 tracking-tighter uppercase italic">
              RevaShow
            </span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-grow max-w-2xl relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-red-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              className="block w-full bg-slate-800 border-none rounded-sm py-2 pl-10 pr-3 text-slate-300 placeholder-slate-500 focus:ring-1 focus:ring-red-600 focus:bg-slate-700 transition-all text-sm"
              placeholder="Search for Events, Clubs, Activities..."
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer transition-colors text-sm">
              <span className="font-medium">REVA Main Campus</span>
              <ChevronDown size={14} />
            </div>

            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-xs font-semibold transition-all shadow-lg shadow-red-900/20">
              Sign In
            </button>

            <div className="md:hidden text-slate-300">
              <Menu size={24} />
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
