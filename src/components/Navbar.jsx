import React, { useState, useEffect } from 'react';
import { Search, Upload, ChevronLeft, ChevronRight, X, Menu, Bell, Zap, Terminal } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onRefresh, searchQuery, setSearchQuery, onViewChange, onToggleMobileMenu }) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  return (
    <nav className="fixed top-4 left-0 right-0 z-[80] px-4 lg:px-12 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 pointer-events-auto">
        
        {/* Navigation / Mobile Menu Trigger */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={onToggleMobileMenu} 
            className="lg:hidden h-12 w-12 glass-panel-premium flex items-center justify-center text-zinc-400 active:text-white active:scale-95 transition-all"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden lg:flex items-center space-x-2">
            <button className="h-14 w-14 glass-panel-premium flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:scale-105 active:scale-95">
              <ChevronLeft size={24} />
            </button>
            <button className="h-14 w-14 glass-panel-premium flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:scale-105 active:scale-95">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* High-Fidelity Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-spotify-green transition-all duration-300">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search Syncler Database..."
              className="w-full bg-black/40 border border-white/5 focus:border-spotify-green/30 glass-panel-premium h-14 lg:h-16 pl-16 pr-14 text-sm font-black italic tracking-tight outline-none transition-all duration-300 placeholder:text-zinc-800 rounded-[20px]"
            />
            <AnimatePresence>
              {localSearch && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setLocalSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-zinc-500 hover:text-white bg-white/5 rounded-xl transition-all"
                >
                  <X size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Actions / Profile */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onViewChange?.('import')}
            className="hidden sm:flex h-14 lg:h-16 px-8 glass-panel-premium items-center space-x-3 text-white hover:text-spotify-green transition-all group"
          >
            <Terminal size={18} className="group-hover:drop-shadow-[0_0_8px_#00ff66]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Import</span>
          </button>

          <div className="h-12 w-12 lg:h-16 lg:w-16 glass-panel-premium flex items-center justify-center relative group cursor-pointer overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-spotify-green/20 to-spotify-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative z-10 flex flex-col items-center">
                <span className="text-[10px] lg:text-sm font-black text-white italic tracking-tighter">JD</span>
                <div className="h-0.5 w-4 bg-spotify-green rounded-full mt-0.5 shadow-[0_0_8px_#00ff66]" />
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default React.memo(Navbar);
