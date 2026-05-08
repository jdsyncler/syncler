import React from 'react';
import { Play, Volume2, Music } from 'lucide-react';
import { motion } from 'framer-motion';

const SongListItem = ({ song, isActive, isPlaying, onPlay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
        isActive 
          ? 'bg-primary/10 border border-primary/20' 
          : 'bg-white/5 hover:bg-white/10 border border-white/5'
      }`}
      onClick={() => onPlay(song)}
    >
      <div className="flex items-center space-x-4 flex-1">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
          isActive ? 'bg-primary text-black' : 'bg-white/5 text-zinc-400 group-hover:text-white'
        }`}>
          {isActive && isPlaying ? (
             <div className="flex items-end space-x-1 h-4">
                <motion.div animate={{ height: [4, 16, 8, 12] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-current rounded-full" />
                <motion.div animate={{ height: [8, 4, 16, 10] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-current rounded-full" />
                <motion.div animate={{ height: [12, 16, 4, 14] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-current rounded-full" />
             </div>
          ) : (
            <Music size={20} />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className={`font-bold transition-colors ${isActive ? 'text-primary' : 'text-white'}`}>
            {song.song_name}
          </h3>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Track</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {isActive ? (
          <div className="text-primary">
            <Volume2 size={20} />
          </div>
        ) : (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-primary hover:text-black transition-all">
              <Play fill="currentColor" size={18} className="ml-0.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SongListItem;
