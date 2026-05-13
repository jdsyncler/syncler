import React from 'react';
import { Play, Plus, ListPlus, Pause, Music, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { cleanSongName } from '../lib/utils';

const SongListItem = ({ song, index, isActive, isPlaying, onPlay, onAddToPlaylist, onAddToQueue }) => {
  // Removed per-item Audio objects for performance. 
  // Metadata should be pre-fetched or handled by the player service.
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
      className={`group flex items-center justify-between p-1.5 lg:p-4 rounded-lg lg:rounded-2xl transition-all duration-300 cursor-pointer border select-none active:scale-[0.98] min-w-0 gap-2 ${
        isActive 
          ? 'bg-white/10 border-white/10 shadow-glass-soft' 
          : 'bg-transparent border-transparent active:bg-white/5'
      }`}
      onClick={() => onPlay({ song_name: song.song_name, url: song.url })}
    >
      <div className="flex items-center space-x-2.5 lg:space-x-5 flex-1 min-w-0 overflow-hidden">
        {/* Index / Visualizer */}
        <div className="w-5 lg:w-10 flex justify-center shrink-0">
           {isActive && isPlaying ? (
             <div className="flex items-end space-x-0.5 lg:space-x-1 h-2.5 lg:h-5">
                <motion.div animate={{ height: [3, 10, 5, 10, 3] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-0.5 lg:w-1 bg-spotify-green rounded-full" />
                <motion.div animate={{ height: [8, 3, 10, 3, 8] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-0.5 lg:w-1 bg-spotify-green rounded-full" />
                <motion.div animate={{ height: [5, 10, 3, 10, 5] }} transition={{ duration: 1, repeat: Infinity }} className="w-0.5 lg:w-1 bg-spotify-green rounded-full" />
             </div>
           ) : (
             <span className={`text-[9px] lg:text-sm font-black ${isActive ? 'text-spotify-green' : 'text-zinc-700 lg:group-hover:hidden'}`}>
               {String(index + 1).padStart(2, '0')}
             </span>
           )}
           {!isActive && (
             <Play size={14} fill="white" className="hidden lg:group-hover:block text-white transition-all scale-110" />
           )}
        </div>

        {/* Artwork Module */}
        <div className="h-10 w-10 lg:h-14 lg:w-14 flex items-center justify-center shrink-0 overflow-hidden relative">
          <img src="/logo.png" alt="cover" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-all duration-500" />
          {isActive && isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Pause size={14} fill="white" className="text-white" />
            </div>
          )}
        </div>
        
        {/* Metadata */}
        <div className="min-w-0 flex-1 truncate pr-1">
          <h3 className={`font-bold text-[11px] lg:text-base truncate tracking-tight transition-colors duration-300 ${isActive ? 'text-spotify-green' : 'text-white'}`}>
            {cleanSongName(song.song_name || "Unknown Track")}
          </h3>
          <div className="flex items-center space-x-1 truncate">
            <span className="text-[5px] font-black text-zinc-700 uppercase tracking-widest shrink-0">Hifi</span>
            <p className="text-[8px] lg:text-xs font-bold text-zinc-600 truncate uppercase tracking-tighter">Premium Audio</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-0.5 lg:space-x-8 shrink-0 ml-auto">

        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onAddToQueue) onAddToQueue(song);
          }}
          className="p-1.5 text-zinc-700 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 rounded-lg active:bg-white/5"
        >
          <MoreHorizontal size={14} lg:size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default React.memo(SongListItem);
