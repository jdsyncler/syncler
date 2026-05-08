import React from 'react';
import { Home, Search, Library, Heart, ListMusic, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { icon: Home, label: 'Home', id: 'home' },
    { icon: Search, label: 'Search', id: 'search' },
    { icon: Library, label: 'Library', id: 'library' },
  ];

  const secondaryItems = [
    { icon: PlusCircle, label: 'Create Playlist', id: 'create' },
    { icon: Heart, label: 'Liked Songs', id: 'liked' },
  ];

  return (
    <div className="w-64 h-screen bg-black flex flex-col border-r border-white/5 fixed left-0 top-0 z-50 transition-all duration-300">
      <div className="p-6 mb-8">
        <h1 className="text-2xl font-bold tracking-tighter text-gradient">SYNCLER</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-white/10 text-primary' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={22} className={activeTab === item.id ? 'text-primary' : 'group-hover:text-white'} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        <div className="pt-8 pb-4">
          <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Your Collection</p>
          {secondaryItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-white/10 text-primary' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'text-primary' : 'group-hover:text-white'} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-white/5">
          <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Playlists</p>
          <div className="space-y-1 px-4">
            <button className="block w-full text-left text-zinc-400 hover:text-white text-sm py-2 transition-colors">Tamil Party Mix</button>
            <button className="block w-full text-left text-zinc-400 hover:text-white text-sm py-2 transition-colors">Lofi Beats</button>
            <button className="block w-full text-left text-zinc-400 hover:text-white text-sm py-2 transition-colors">Workout Vibes</button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
