import React from 'react';
import { Play, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cleanSongName } from '../lib/utils';

const SongCard = ({ song, onPlay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      className="bg-white/5 p-3 lg:p-4 rounded-[24px] lg:rounded-3xl group relative cursor-pointer hover:bg-white/10 active:scale-[0.97] transition-all duration-300 border border-white/5 select-none"
      onClick={() => onPlay({ song_name: song.song_name, url: song.url })}
    >
      <div className="relative aspect-square overflow-hidden mb-3 lg:mb-4 bg-transparent flex items-center justify-center transition-all duration-500">
        <img src="/logo.png" alt="cover" className="absolute inset-0 w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-all duration-700" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[1px]">
          <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-spotify-green text-black flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play fill="currentColor" size={20} lg:size={24} className="ml-1" />
          </div>
        </div>
      </div>
      
      <div className="space-y-0.5 px-1">
        <h3 className="font-bold text-white truncate text-xs lg:text-sm tracking-tight">{cleanSongName(song.song_name || "Untitled Track")}</h3>
        <p className="text-zinc-500 text-[9px] lg:text-[11px] font-bold uppercase tracking-widest">Premium Track</p>
      </div>
    </motion.div>
  );
};

export default React.memo(SongCard);
