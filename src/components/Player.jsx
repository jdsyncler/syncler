import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  Repeat, Shuffle, Maximize2, Heart, 
  ChevronDown, ListMusic, X, Volume1, VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Player = ({ 
  currentSong, isPlaying, setIsPlaying, onNext, onPrevious, 
  onLike, isLiked, isExpanded, setIsExpanded, songs,
  isShuffle, setIsShuffle, repeatMode, setRepeatMode,
  queue, removeFromQueue, clearQueue
}) => {
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showQueue, setShowQueue] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const audioRef = useRef(null);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.url;
      if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      onNext();
    }
  };

  const handleSeek = (e) => {
    const time = (e.target.value / 100) * duration;
    if (audioRef.current) audioRef.current.currentTime = time;
    setProgress(e.target.value);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentSong) return null;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Floating Bottom Bar Player - Premium Cinematic Dock */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div 
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[700px] h-20 glass-panel px-8 flex items-center justify-between shadow-glass-strong border-white/10 backdrop-blur-3xl rounded-full overflow-visible group/dock"
            style={{ 
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(20, 20, 20, 0.4) 100%)',
              boxShadow: '0 20px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(29, 185, 84, 0.1)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Liquid Progress Track */}
            <div className="absolute -top-1.5 left-12 right-12 h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-gradient-to-r from-spotify-green to-accent-green shadow-[0_0_15px_rgba(29,185,84,0.6)]"
                 animate={{ width: `${progress}%` }}
                 transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
               />
            </div>

            {/* Side A: Identity (Fixed Width for Symmetry) */}
            <div className="flex items-center space-x-4 w-[200px] shrink-0">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: -2 }}
                className="relative cursor-pointer" 
                onClick={() => setIsExpanded(true)}
              >
                <div className="h-12 w-12 rounded-xl overflow-hidden bg-spotify-dark border border-white/10 flex items-center justify-center shadow-glass-soft relative group">
                  <img src="/logo.png" alt="artwork" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-500 backdrop-blur-sm">
                    <Maximize2 size={20} className="text-white" />
                  </div>
                </div>
              </motion.div>
              <div className="truncate py-1 flex-1">
                <h4 className="font-black text-white text-sm truncate tracking-tighter leading-tight">{(currentSong.song_name || "")}</h4>
                <div className="flex items-center space-x-2 mt-0.5">
                   <div className="w-1.5 h-1.5 bg-spotify-green rounded-full animate-pulse shadow-[0_0_8px_rgba(29,185,84,1)]" />
                   <p className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.2em] truncate">Playing</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onLike(currentSong.url); }}
                className={`p-1.5 transition-all duration-500 hover:scale-125 ${isLiked ? 'text-spotify-green drop-shadow-[0_0_10px_rgba(29,185,84,0.5)]' : 'text-zinc-600 hover:text-white'}`}
              >
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 2.5} />
              </button>
            </div>

            {/* Side B: Core Controls (Centered Focal Point) */}
            <div className="flex flex-col items-center flex-1 px-4">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`transition-all duration-500 hover:scale-125 ${isShuffle ? 'text-spotify-green drop-shadow-[0_0_12px_rgba(29,185,84,0.8)]' : 'text-zinc-600 hover:text-white'}`}
                >
                  <Shuffle size={16} strokeWidth={3} />
                </button>
                
                <button onClick={onPrevious} className="text-zinc-400 hover:text-white transition-all duration-500 hover:scale-125 active:scale-90">
                  <SkipBack size={24} fill="currentColor" />
                </button>
                
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-700 shadow-glass-strong group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>

                <button onClick={onNext} className="text-zinc-400 hover:text-white transition-all duration-500 hover:scale-125 active:scale-90">
                  <SkipForward size={24} fill="currentColor" />
                </button>
                
                <button 
                  onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                  className={`relative transition-all duration-500 hover:scale-125 ${repeatMode !== 'none' ? 'text-spotify-green drop-shadow-[0_0_12px_rgba(29,185,84,0.8)]' : 'text-zinc-600 hover:text-white'}`}
                >
                  <Repeat size={16} strokeWidth={3} />
                  {repeatMode === 'one' && <span className="absolute -top-2 -right-2 text-[8px] font-black bg-spotify-green text-black rounded-full px-1 border border-black shadow-lg">1</span>}
                </button>
              </div>
            </div>

            {/* Side C: Utility (Fixed Width for Symmetry) */}
            <div className="flex items-center justify-end space-x-6 w-[200px] shrink-0">
              <div className="flex items-center space-x-3 group bg-white/5 px-4 py-1.5 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-500 shadow-glass-soft">
                {volume === 0 ? <VolumeX size={16} className="text-zinc-500" /> : volume < 0.5 ? <Volume1 size={16} className="text-zinc-500" /> : <Volume2 size={16} className="text-zinc-400 group-hover:text-white transition-colors" />}
                <input
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (audioRef.current) audioRef.current.volume = parseFloat(e.target.value);
                  }}
                  className="w-16 apple-range h-1"
                />
              </div>
              
              <button 
                onClick={() => setShowQueue(!showQueue)}
                className={`p-2.5 rounded-xl transition-all duration-500 hover:scale-115 ${showQueue ? 'bg-spotify-green/20 text-spotify-green shadow-spotify-glow border border-spotify-green/20' : 'text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5'}`}
              >
                <ListMusic size={18} strokeWidth={3} />
              </button>
            </div>
          </motion.div>

        )}
      </AnimatePresence>


      {/* Immersive Full-Screen Player - Liquid Glass Canvas */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 35, stiffness: 250, restDelta: 0.001 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden"
          >
            {/* Liquid Mesh Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden scale-110">
              <div className="absolute top-0 left-0 w-full h-full bg-liquid-mesh opacity-40 animate-liquid-slow" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-spotify-green/10 blur-[180px] rounded-full animate-pulse-soft" />
              <div className="absolute top-0 left-0 w-full h-full bg-black/60 backdrop-blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col h-full px-12 py-16">
              {/* Header */}
              <div className="flex items-center justify-between mb-12">
                <button 
                  onClick={() => setIsExpanded(false)} 
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-3xl transition-all duration-500 hover:scale-110 active:scale-95 shadow-glass-soft"
                >
                  <ChevronDown size={32} strokeWidth={3} />
                </button>
                <div className="text-center">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] mb-2">Streaming High Fidelity</p>
                  <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 bg-spotify-green rounded-full animate-pulse shadow-[0_0_8px_rgba(29,185,84,1)]" />
                     <h3 className="font-black text-sm tracking-tighter">SYNCLER PREMIUM</h3>
                  </div>
                </div>
                <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-3xl transition-all opacity-0 pointer-events-none">
                  <X size={24} />
                </button>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-20 lg:gap-32">
                {/* Immersive Artwork */}
                <div className="w-full max-w-md lg:max-w-xl aspect-square relative group">
                  <motion.div 
                    layoutId="player-artwork"
                    className="w-full h-full rounded-[48px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 bg-spotify-dark flex items-center justify-center relative z-10"
                  >
                    <motion.img 
                      animate={{ 
                        scale: isPlaying ? [1, 1.05, 1] : 1,
                        rotate: isPlaying ? [0, 1, -1, 0] : 0
                      }}
                      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                      src="/logo.png" 
                      alt="artwork" 
                      className="w-full h-full object-cover opacity-80" 
                    />
                    {/* Inner Glass Shine */}
                    <div className="absolute inset-0 bg-glass-shine opacity-30 pointer-events-none" />
                  </motion.div>
                  {/* Dynamic Glow Background */}
                  <div className="absolute -inset-10 bg-spotify-green/20 blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-full -z-10" />
                  <div className="absolute -inset-1 bg-gradient-to-tr from-spotify-green/40 to-transparent blur-2xl opacity-40 rounded-[50px] -z-10" />
                </div>

                {/* Player Controls Canvas */}
                <div className="w-full max-w-2xl flex flex-col">
                  <div className="flex items-end justify-between mb-16">
                    <div className="truncate pr-12">
                      <motion.h1 
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="text-6xl lg:text-8xl font-black text-white mb-4 truncate tracking-tighter leading-none"
                      >
                        {(currentSong.song_name || "")}
                      </motion.h1>
                      <div className="flex items-center space-x-3">
                         <span className="px-3 py-1 bg-spotify-green/10 text-spotify-green text-[10px] font-black rounded-lg border border-spotify-green/20 tracking-widest uppercase">Lossless</span>
                         <p className="text-2xl text-zinc-400 font-bold tracking-tight">Premium Streaming</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onLike(currentSong.url)}
                      className={`p-6 rounded-[32px] transition-all duration-500 hover:scale-110 shadow-glass-soft ${
                        isLiked ? 'text-spotify-green bg-spotify-green/10 border border-spotify-green/20' : 'text-zinc-500 hover:text-white bg-white/5 border border-white/5'
                      }`}
                    >
                      <Heart size={40} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 2} />
                    </button>
                  </div>

                  {/* Progress Canvas */}
                  <div className="space-y-6 mb-20 relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleSeek}
                      className="w-full apple-range h-3 rounded-full"
                    />
                    {/* Animated Progress Glow */}
                    <div className="flex justify-between text-base font-black text-zinc-500 tabular-nums tracking-widest">
                      <span className="liquid-text">{formatTime(audioRef.current?.currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Playback Button Canvas */}
                  <div className="flex items-center justify-between px-6">
                    <button 
                      onClick={() => setIsShuffle(!isShuffle)}
                      className={`p-5 rounded-3xl transition-all duration-500 hover:scale-110 ${isShuffle ? 'text-spotify-green bg-white/10 shadow-glass-soft' : 'text-zinc-500 hover:text-white bg-white/5'}`}
                    >
                      <Shuffle size={32} strokeWidth={2.5} />
                    </button>
                    
                    <div className="flex items-center space-x-16">
                      <button onClick={onPrevious} className="text-zinc-400 hover:text-white transition-all duration-500 transform hover:scale-125 active:scale-90">
                        <SkipBack size={64} fill="currentColor" />
                      </button>
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="h-32 w-32 rounded-[48px] bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-700 shadow-[0_0_60px_rgba(255,255,255,0.4)] group overflow-hidden relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        {isPlaying ? <Pause size={56} fill="currentColor" /> : <Play size={56} fill="currentColor" className="ml-3" />}
                      </button>
                      <button onClick={onNext} className="text-zinc-400 hover:text-white transition-all duration-500 transform hover:scale-125 active:scale-90">
                        <SkipForward size={64} fill="currentColor" />
                      </button>
                    </div>

                    <button 
                      onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                      className={`p-5 rounded-3xl relative transition-all duration-500 hover:scale-110 ${repeatMode !== 'none' ? 'text-spotify-green bg-white/10 shadow-glass-soft' : 'text-zinc-500 hover:text-white bg-white/5'}`}
                    >
                      <Repeat size={32} strokeWidth={2.5} />
                      {repeatMode === 'one' && <span className="absolute top-3 right-3 text-xs font-black bg-spotify-green text-black rounded-full px-2 py-0.5 border-2 border-black shadow-lg">1</span>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Volume Canvas */}
              <div className="mt-auto flex items-center justify-center py-16">
                <div className="w-full max-w-3xl flex items-center space-x-8 glass-panel p-8 rounded-[40px] border-white/5 bg-white/5 shadow-glass-strong">
                  <Volume2 size={32} className="text-zinc-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      if (audioRef.current) audioRef.current.volume = parseFloat(e.target.value);
                    }}
                    className="flex-1 apple-range h-3"
                  />
                  <div className="w-20 text-right">
                    <span className="text-2xl font-black text-spotify-green">{Math.round(volume * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue Drawer - Liquid Glass Panel */}
      <AnimatePresence>
        {showQueue && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-36 right-8 w-[420px] glass-panel p-8 z-[60] shadow-glass-strong border-white/10 backdrop-blur-3xl rounded-[32px]"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                 <div className="w-2 h-2 bg-spotify-green rounded-full shadow-[0_0_8px_rgba(29,185,84,1)]" />
                 <h3 className="text-xl font-black tracking-tight">Up Next</h3>
              </div>
              <button onClick={() => clearQueue()} className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] hover:text-red-300 transition-colors bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20">Clear All</button>
            </div>
            <div className="space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar pr-3">
              {queue.length > 0 ? (
                queue.map((song, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={`${song.url}-${i}`} 
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-500 group"
                  >
                    <div className="flex items-center space-x-4 truncate">
                       <div className="h-12 w-12 rounded-xl bg-spotify-dark flex items-center justify-center shrink-0 overflow-hidden shadow-glass-soft border border-white/5">
                          <img src="/logo.png" alt="q" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                       </div>
                       <p className="text-sm font-bold text-white truncate tracking-tight">{(song.song_name || "")}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeFromQueue(i); }} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-500">
                      <X size={18} strokeWidth={2.5} />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="py-16 text-center glass-panel border-dashed border-white/5">
                  <ListMusic size={40} className="text-zinc-800 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Queue is empty</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Player;
