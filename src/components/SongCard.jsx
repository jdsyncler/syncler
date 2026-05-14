import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Music, Zap } from 'lucide-react';
import { cleanSongName } from '../lib/utils';

const SongCard = ({ song, onPlay, isActive, isPlaying }) => {
  if (!song) return null;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative glass-panel-premium overflow-hidden cursor-pointer h-full"
      onClick={() => onPlay?.(song)}
    >
      <div className="aspect-square relative overflow-hidden m-4 rounded-[24px] shadow-2xl bg-black/40">
        <img
          src="/logo.png"
          alt={song.song_name}
          className={`w-full h-full object-contain p-8 transition-all duration-700 group-hover:scale-110 ${isActive && isPlaying ? 'animate-rotate-slow' : 'opacity-40 group-hover:opacity-100'}`}
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            className="h-16 w-16 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            {isActive && isPlaying ? <Pause fill="black" size={24} /> : <Play fill="black" size={24} className="ml-1" />}
          </motion.div>
        </div>
        
        {isActive && (
          <div className="absolute top-4 right-4 h-3 w-3 bg-spotify-green rounded-full shadow-[0_0_15px_#00ff66] animate-pulse" />
        )}
      </div>
      
      <div className="p-6 pt-2">
        <div className="flex items-center space-x-2 mb-2">
          <Zap size={10} className="text-spotify-cyan" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">Premium Audio</span>
        </div>
        <h3 className="font-black text-white text-lg truncate italic tracking-tighter glow-text-green group-hover:text-spotify-green transition-colors">
          {cleanSongName(song.song_name)}
        </h3>
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Syncler Cloud Mix</p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-spotify-green via-spotify-cyan to-spotify-green animate-gradient-x opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

export default React.memo(SongCard);
