import React from 'react';
import { Home, Search, Library, Heart, Music } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileNav = ({ activeTab, setActiveTab, currentSong }) => {
  const tabs = [
    { id: 'library', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'nowplaying', label: 'Player', icon: Music, disabled: !currentSong },
    { id: 'liked', label: 'Liked', icon: Heart },
    { id: 'playlists', label: 'Library', icon: Library },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[80] bg-black/60 backdrop-blur-3xl border-t border-white/5 safe-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 ${
                isActive ? 'text-spotify-green' : tab.disabled ? 'text-zinc-800' : 'text-zinc-500'
              }`}
            >
              <div className="relative">
                <Icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
                />
                {isActive && (
                  <motion.div 
                    layoutId="mobile-nav-active"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-spotify-green rounded-full shadow-[0_0_8px_rgba(29,185,84,0.8)]"
                  />
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest mt-1 scale-[0.8] origin-top">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
