import React from 'react';
import { Play, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SongCard = ({ song, onPlay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="bg-[#161616] p-4 rounded-3xl group relative cursor-pointer hover:bg-[#1a1a1a] transition-spotify border border-white/5"
      onClick={() => onPlay({ song_name: song.song_name, url: song.url })}
    >
      <div className="relative aspect-square overflow-hidden rounded-[24px] mb-4 shadow-xl bg-neon-gradient flex items-center justify-center">
        <Music2 size={40} className="text-black group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <button className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play fill="currentColor" size={24} className="ml-1" />
          </button>
        </div>
      </div>
      
      <div className="space-y-0.5 px-1">
        <h3 className="font-bold text-white truncate text-sm">{song.song_name || "Untitled Track"}</h3>
        <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider">Track</p>
      </div>
    </motion.div>
  );
};

export default SongCard;
