import React from 'react';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

const SongCard = ({ song, onPlay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="glass-card p-4 rounded-2xl group relative cursor-pointer"
      onClick={() => onPlay(song)}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl mb-4 shadow-xl">
        <img 
          src={song.cover} 
          alt={song.title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-end p-4">
          <button className="h-12 w-12 rounded-full bg-primary text-black flex items-center justify-center shadow-2xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Play fill="currentColor" size={24} className="ml-1" />
          </button>
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="font-bold text-white truncate text-base">{song.title}</h3>
        <p className="text-zinc-400 text-sm truncate font-medium">{song.artist}</p>
      </div>

      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
         <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      </div>
    </motion.div>
  );
};

export default SongCard;
