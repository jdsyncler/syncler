import React from 'react';
import { Home, Search, Music, Library, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileNav = ({ activeTab, setActiveTab, currentSong }) => {
  const tabs = [
    { id: 'library', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'nowplaying', label: 'Playing', icon: Music, disabled: !currentSong },
    { id: 'playlists', label: 'Vault', icon: Library },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] px-4 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 pointer-events-none">
      <div className="max-w-md mx-auto glass-panel-premium h-16 flex items-center justify-around px-2 pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
                isActive ? 'text-spotify-green' : tab.disabled ? 'text-zinc-800' : 'text-zinc-500'
              }`}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-x-2 inset-y-1 bg-white/5 rounded-xl border border-white/5"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </AnimatePresence>
              
              <div className="relative z-10 flex flex-col items-center">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-[0_0_8px_#00ff66]' : ''} />
                <span className={`text-[9px] mt-1 font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                  {tab.label}
                </span>
              </div>

              {tab.id === 'library' && !isActive && (
                 <div className="absolute top-2 right-4">
                    <Sparkles size={8} className="text-spotify-cyan animate-pulse" />
                 </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
