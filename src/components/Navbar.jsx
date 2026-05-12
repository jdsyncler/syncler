import React, { useState } from 'react';
import { Search, Upload, ChevronLeft, ChevronRight, X, RefreshCw, Menu, Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onRefresh, searchQuery, setSearchQuery, onCleanLibrary, onViewChange, onToggleMobileMenu, existingSongs = [] }) => {
  const [isCleaning, setIsCleaning] = useState(false);
  const { user } = useAuth();

  const handleClean = async () => {
    setIsCleaning(true);
    if (onCleanLibrary) await onCleanLibrary();
    setIsCleaning(false);
  };

  return (
    <nav className="sticky top-0 z-40 px-4 py-6 transition-all duration-500">
      <div className="glass-panel px-8 py-4 flex items-center justify-between shadow-glass-strong border-white/10 backdrop-blur-3xl rounded-[32px]">
        {/* Navigation Controls */}
        <div className="flex items-center space-x-6">
          <button 
            onClick={onToggleMobileMenu} 
            className="lg:hidden p-3 text-zinc-400 hover:text-white bg-white/5 rounded-2xl transition-all"
          >
            <Menu size={22} />
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

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative group">
            <motion.div 
              initial={false}
              animate={{ 
                scale: searchQuery ? 1 : 0.98,
                opacity: searchQuery ? 1 : 0.8
              }}
              className="absolute inset-0 bg-spotify-green/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" 
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-spotify-green transition-all duration-500">
              <Search size={20} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library..."
              className="w-full bg-white/5 border border-white/5 focus:border-spotify-green/30 rounded-2xl pl-14 pr-12 py-3.5 text-sm font-bold outline-none transition-all duration-500 focus:bg-white/10 focus:shadow-glass-soft placeholder:text-zinc-600 focus:placeholder:text-zinc-500"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 10 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-white bg-white/5 rounded-xl transition-all"
                >
                  <X size={16} strokeWidth={3} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleClean} 
            disabled={isCleaning} 
            className="p-3.5 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:rotate-12"
            title="Clean Library"
          >
            <RefreshCw size={20} className={isCleaning ? 'animate-spin' : ''} strokeWidth={2.5} />
          </button>
          
          <button className="hidden sm:flex p-3.5 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:scale-105">
            <Bell size={20} strokeWidth={2.5} />
          </button>

          <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block" />

          <button 
            onClick={() => onViewChange && onViewChange('import')}
            className="btn-spotify px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-glass-soft"
          >
            <Upload size={16} strokeWidth={3} />
            <span className="hidden xl:inline ml-2">Import</span>
          </button>

          <div className="group relative ml-2">
            <div className="absolute -inset-1 bg-white/10 opacity-0 group-hover:opacity-40 blur-lg rounded-full transition-all duration-500" />
            <div className="relative h-12 w-12 rounded-2xl flex items-center justify-center border-2 border-white/10 bg-white/5 shadow-glass-soft group-hover:scale-105 transition-all duration-500 cursor-pointer">
              <span className="text-sm font-black text-white">JD</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
