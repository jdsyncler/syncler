import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, MoreHorizontal, Plus, ListMusic, Music2 } from 'lucide-react';
import { cleanSongName } from '../lib/utils';

const SongListItem = ({ song, index, isActive, isPlaying, onPlay, onAddToPlaylist, onAddToQueue }) => {
  if (!song) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
        isActive ? 'bg-white/10 border-white/10 shadow-glass-soft' : 'hover:bg-white/5 border-transparent'
      } border cursor-pointer`}
      onClick={() => onPlay?.(song)}
    >
      <div className="flex items-center space-x-5 flex-1 truncate pr-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-white/5">
          <img
            src="/logo.png"
            className={`w-full h-full object-contain p-2 transition-all ${isActive && isPlaying ? 'animate-rotate-slow' : 'opacity-40 group-hover:opacity-100'}`}
          />
          {isActive && isPlaying && (
            <div className="absolute inset-0 bg-spotify-green/20 flex items-center justify-center">
              <div className="flex items-center space-x-0.5">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 12, 6, 16, 4] }}
                    transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                    className="w-1 bg-white rounded-full"
                  />
                ))}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {isActive && isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-0.5" />}
          </div>
        </div>

        <div className="truncate">
          <p className={`font-black text-sm lg:text-base truncate italic tracking-tight ${isActive ? 'text-spotify-green' : 'text-white'}`}>
            {cleanSongName(song.song_name)}
          </p>
          <div className="flex items-center space-x-3 mt-0.5">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Master Audio</span>
            <div className="h-1 w-1 bg-zinc-800 rounded-full" />
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Syncler Digital</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 lg:space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onAddToQueue?.(song); }}
          className="p-3 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all"
        >
          <ListMusic size={18} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onAddToPlaylist?.(song); }}
          className="p-3 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all"
        >
          <Plus size={18} />
        </button>
        <button className="p-3 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all">
          <MoreHorizontal size={18} />
        </button>
      </div>
      
      {isActive && !isPlaying && (
        <div className="text-[9px] font-black text-spotify-green uppercase tracking-widest px-3 py-1 bg-spotify-green/10 rounded-full border border-spotify-green/20">Paused</div>
      )}
    </motion.div>
  );
};

export default React.memo(SongListItem);
