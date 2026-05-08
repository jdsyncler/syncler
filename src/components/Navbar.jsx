import React, { useState } from 'react';
import { Search, Upload, Bell, User, ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UploadModal from './UploadModal';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onRefresh, searchQuery, setSearchQuery }) => {
  const { user, signOut } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <>
      <nav className="h-20 flex items-center justify-between px-8 sticky top-0 bg-black/60 backdrop-blur-xl z-40 border-b border-white/5">
        <div className="flex items-center space-x-6 flex-1">
          <div className="hidden sm:flex items-center space-x-2">
            <button className="p-2 rounded-full bg-black/40 text-zinc-400 hover:text-white transition-colors border border-white/5">
              <ChevronLeft size={20} />
            </button>
            <button className="p-2 rounded-full bg-black/40 text-zinc-400 hover:text-white transition-colors border border-white/5">
              <ChevronRight size={20} />
            </button>
          </div>

          <motion.div 
            initial={{ width: '40%' }}
            whileFocus={{ width: '50%' }}
            className="relative max-w-md w-full group"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracks by name..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-zinc-600 font-medium"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-5">
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl border border-primary/20 transition-all text-sm font-black uppercase tracking-widest group"
          >
            <Upload size={18} className="group-hover:-translate-y-0.5 transition-transform" />
            <span className="hidden sm:inline">Sync</span>
          </button>
          
          <button 
            onClick={signOut}
            className="p-2.5 text-zinc-500 hover:text-red-400 transition-colors bg-white/5 rounded-xl border border-white/5"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>

          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center cursor-pointer border border-white/10 hover:scale-105 transition-transform overflow-hidden relative shadow-lg shadow-primary/10">
             <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
              alt="Profile" 
              className="w-full h-full object-cover"
             />
          </div>
        </div>
      </nav>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadSuccess={onRefresh}
      />
    </>
  );
};

export default Navbar;
