import React, { useState, useEffect, useCallback } from 'react';
import { Search, Upload, ChevronLeft, ChevronRight, X, RefreshCw, Menu, Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onRefresh, searchQuery, setSearchQuery, onCleanLibrary, onViewChange, onToggleMobileMenu, existingSongs = [] }) => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const { user } = useAuth();

  // Debounce search update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  // Sync local search with prop if it changes externally
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleClean = async () => {
    setIsCleaning(true);
    if (onCleanLibrary) await onCleanLibrary();
    setIsCleaning(false);
  };

  return (
    <nav className="fixed top-4 left-0 right-0 mx-auto w-[92%] max-w-md lg:max-w-7xl z-50 transition-all duration-500">
      <div className="glass-panel px-3 lg:px-8 py-2 lg:py-4 flex items-center justify-between shadow-glass-strong border-white/5 backdrop-blur-xl rounded-2xl lg:rounded-[32px]">
        {/* Navigation Controls */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={onToggleMobileMenu} 
            className="lg:hidden p-2 text-zinc-400 active:text-white bg-white/5 rounded-xl active:scale-95 transition-all"
          >
            <Menu size={18} />
          </button>
          
          <div className="hidden lg:flex items-center space-x-3">
            <button className="p-3 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:scale-105 active:scale-95">
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <button className="p-3 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:scale-105 active:scale-95">
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Search Bar - More responsive width */}
        <div className="flex-1 max-w-2xl mx-2 lg:mx-8">
          <div className="relative group">
            <div className="absolute left-3 lg:left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-spotify-green transition-all duration-300">
              <Search size={16} lg:size={20} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/5 focus:border-spotify-green/20 rounded-xl lg:rounded-2xl pl-10 lg:pl-14 pr-9 py-2 lg:py-3.5 text-[11px] lg:text-sm font-bold outline-none transition-all duration-300 focus:bg-white/10 placeholder:text-zinc-600"
            />
            <AnimatePresence>
              {localSearch && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setLocalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white bg-white/5 rounded-lg transition-all"
                >
                  <X size={12} strokeWidth={3} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          <button 
            onClick={() => onViewChange && onViewChange('import')}
            className="btn-spotify px-3 lg:px-8 py-2 lg:py-3.5 text-[8px] lg:text-[10px] font-black uppercase tracking-widest shadow-lg"
          >
            <Upload size={13} lg:size={16} strokeWidth={3} />
            <span className="hidden sm:inline ml-1.5 lg:ml-2">Import</span>
          </button>

          <div className="group relative">
            <div className="relative h-9 w-9 lg:h-12 lg:w-12 rounded-xl lg:rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 active:scale-95 transition-all cursor-pointer">
              <span className="text-[10px] lg:text-sm font-black text-white">JD</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default React.memo(Navbar);
