import React from 'react';
import { Play, Heart, Plus, ListPlus, Pause, Music, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const SongListItem = ({ song, index, isActive, isPlaying, onPlay, onLike, onAddToPlaylist, onAddToQueue }) => {
  const [duration, setDuration] = React.useState(null);

  React.useEffect(() => {
    const url = song?.url;
    if (!url) return;
    
    try {
      const audio = new Audio();
      audio.src = url;
      const handleMetadata = () => {
        if (isFinite(audio.duration)) {
          const mins = Math.floor(audio.duration / 60);
          const secs = Math.floor(audio.duration % 60);
          setDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
        }
      };
      audio.addEventListener('loadedmetadata', handleMetadata);
      return () => audio.removeEventListener('loadedmetadata', handleMetadata);
    } catch (e) {
      console.warn('Metadata capture failed for track:', song?.url);
    }
  }, [song?.url]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01, x: 5 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`group flex items-center justify-between p-4 rounded-2xl transition-all duration-500 cursor-pointer border ${
        isActive 
          ? 'bg-white/10 border-white/10 shadow-glass-soft' 
          : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
      }`}
      onClick={() => onPlay({ song_name: song.song_name, url: song.url })}
    >
      <div className="flex items-center space-x-5 flex-1 truncate">
        {/* Index / Visualizer */}
        <div className="w-10 flex justify-center shrink-0">
           {isActive && isPlaying ? (
             <div className="flex items-end space-x-1.5 h-5">
                <motion.div animate={{ height: [4, 16, 8, 16, 4] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-1.5 bg-spotify-green rounded-full shadow-[0_0_8px_rgba(29,185,84,0.6)]" />
                <motion.div animate={{ height: [12, 6, 16, 6, 12] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-1.5 bg-spotify-green rounded-full shadow-[0_0_8px_rgba(29,185,84,0.6)]" />
                <motion.div animate={{ height: [8, 16, 6, 16, 8] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 bg-spotify-green rounded-full shadow-[0_0_8px_rgba(29,185,84,0.6)]" />
             </div>
           ) : (
             <span className={`text-sm font-black ${isActive ? 'text-spotify-green' : 'text-zinc-600 group-hover:hidden tracking-tighter'}`}>
               {String(index).padStart(2, '0')}
             </span>
           )}
           {!isActive && (
             <Play size={20} fill="white" className="hidden group-hover:block text-white transition-all scale-110" />
           )}
        </div>

        {/* Artwork Module */}
        <div className="h-14 w-14 rounded-2xl overflow-hidden shrink-0 bg-spotify-dark border border-white/5 flex items-center justify-center relative shadow-glass-soft group-hover:scale-110 transition-transform duration-500">
           {isActive && isPlaying ? (
              <Pause size={24} fill="white" className="text-white z-10" />
           ) : (
              <Music size={24} className={`z-10 transition-colors duration-500 ${isActive ? 'text-spotify-green' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
           )}
           <img src="/logo.png" alt="logo" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity" />
        </div>
        
        {/* Metadata */}
        <div className="flex-1 truncate">
          <h3 className={`font-black text-base truncate tracking-tight transition-colors duration-500 ${isActive ? 'text-spotify-green' : 'text-white'}`}>
            {song.song_name || "Unknown Track"}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Hifi</span>
            <p className="text-xs font-bold text-zinc-500 group-hover:text-zinc-400 transition-colors">
              Premium Stream
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-8 shrink-0 ml-6">
        <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
           <button 
             onClick={(e) => { e.stopPropagation(); onAddToPlaylist && onAddToPlaylist(song); }}
             className="p-2.5 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
             title="Add to Playlist"
           >
             <Plus size={20} strokeWidth={2.5} />
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); onAddToQueue && onAddToQueue(song); }}
             className="p-2.5 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
             title="Add to Queue"
           >
             <ListPlus size={20} strokeWidth={2.5} />
           </button>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onLike(song?.url);
          }}
          className={`p-2.5 transition-all duration-500 hover:scale-125 ${song?.liked ? 'text-spotify-green' : 'text-zinc-500 hover:text-white'}`}
        >
          <Heart size={20} fill={song?.liked ? "currentColor" : "none"} strokeWidth={song?.liked ? 0 : 2.5} />
        </button>

        <span className="text-[11px] font-black text-zinc-500 tabular-nums w-14 text-right tracking-widest">
          {duration || "0:00"}
        </span>

        <button className="p-2.5 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl hover:bg-white/5">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default SongListItem;
