import React from 'react';
import { Play, Heart, Plus, ListPlus, Pause, Music, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const SongListItem = ({ song, index, isActive, isPlaying, onPlay, onLike, onAddToPlaylist, onAddToQueue }) => {
  // Removed per-item Audio objects for performance. 
  // Metadata should be pre-fetched or handled by the player service.
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
      className={`group flex flex-wrap items-center justify-between p-2 lg:p-4 rounded-xl lg:rounded-2xl transition-all duration-300 cursor-pointer border select-none active:scale-[0.98] min-w-0 gap-2 ${
        isActive 
          ? 'bg-white/10 border-white/10 shadow-glass-soft' 
          : 'bg-transparent border-transparent active:bg-white/5'
      }`}
      onClick={() => onPlay({ song_name: song.song_name, url: song.url })}
    >
      <div className="flex items-center space-x-3 lg:space-x-5 flex-1 min-w-0 overflow-hidden">
        {/* Index / Visualizer */}
        <div className="w-6 lg:w-10 flex justify-center shrink-0">
           {isActive && isPlaying ? (
             <div className="flex items-end space-x-1 h-3 lg:h-5">
                <motion.div animate={{ height: [4, 12, 6, 12, 4] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-1 bg-spotify-green rounded-full" />
                <motion.div animate={{ height: [10, 4, 12, 4, 10] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-1 bg-spotify-green rounded-full" />
                <motion.div animate={{ height: [6, 12, 4, 12, 6] }} transition={{ duration: 1, repeat: Infinity }} className="w-1 bg-spotify-green rounded-full" />
             </div>
           ) : (
             <span className={`text-[10px] lg:text-sm font-black ${isActive ? 'text-spotify-green' : 'text-zinc-600 lg:group-hover:hidden'}`}>
               {String(index + 1).padStart(2, '0')}
             </span>
           )}
           {!isActive && (
             <Play size={16} fill="white" className="hidden lg:group-hover:block text-white transition-all scale-110" />
           )}
        </div>

        {/* Artwork Module */}
        <div className="h-10 w-10 lg:h-14 lg:w-14 rounded-lg lg:rounded-2xl overflow-hidden shrink-0 bg-spotify-dark border border-white/5 flex items-center justify-center relative shadow-glass-soft transition-transform duration-300">
           {isActive && isPlaying ? (
              <Pause size={16} fill="white" className="text-white z-10" />
           ) : (
              <Music size={16} className={`z-10 transition-colors duration-300 ${isActive ? 'text-spotify-green' : 'text-zinc-600 lg:group-hover:text-zinc-400'}`} />
           )}
           <img src="/logo.png" alt="logo" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        </div>
        
        {/* Metadata */}
        <div className="min-w-0 flex-1 truncate pr-2">
          <h3 className={`font-bold text-[12px] lg:text-base truncate tracking-tight transition-colors duration-300 ${isActive ? 'text-spotify-green' : 'text-white'}`}>
            {song.song_name || "Unknown Track"}
          </h3>
          <div className="flex items-center space-x-1.5 truncate">
            <span className="text-[6px] font-black text-zinc-600 uppercase tracking-widest shrink-0">Hifi</span>
            <p className="text-[9px] lg:text-xs font-bold text-zinc-500 truncate uppercase tracking-tight">Premium Audio</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1 lg:space-x-8 shrink-0 ml-auto">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onLike(song?.url);
          }}
          className={`p-2 lg:p-2.5 transition-all duration-300 active:scale-125 ${song?.liked ? 'text-spotify-green' : 'text-zinc-600'}`}
        >
          <Heart size={15} lg:size={20} fill={song?.liked ? "currentColor" : "none"} strokeWidth={song?.liked ? 0 : 2.5} />
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onAddToQueue) onAddToQueue(song);
          }}
          className="p-2 text-zinc-600 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 rounded-xl active:bg-white/5"
        >
          <MoreHorizontal size={16} lg:size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default React.memo(SongListItem);
