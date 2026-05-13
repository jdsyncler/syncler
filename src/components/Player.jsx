import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const progressInterval = useRef(null);

  // Sync MediaSession metadata for background control
  useEffect(() => {
    if (currentSong && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.song_name || 'Unknown',
        artist: 'SYNCLER Premium',
        album: 'My Collection',
        artwork: [
          { src: '/logo.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', onPrevious);
      navigator.mediaSession.setActionHandler('nexttrack', () => onNext());
    }
  }, [currentSong, setIsPlaying, onNext, onPrevious]);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      const playAudio = async () => {
        try {
          audioRef.current.src = currentSong.url;
          if (isPlaying) {
            await audioRef.current.play();
          }
        } catch (e) {
          console.error("Playback failed:", e);
          setIsPlaying(false);
        }
      };
      playAudio();
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isHovered) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      if (dur > 0) {
        setProgress((current / dur) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
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
    const val = parseFloat(e.target.value);
    const time = (val / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setProgress(val);
  };

  const formatTime = useCallback((time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);

  if (!currentSong) return null;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="auto"
      />

      {/* Floating Bottom Bar Player - Responsive & Optimized */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed bottom-[68px] lg:bottom-4 left-2.5 right-2.5 lg:left-1/2 lg:-translate-x-1/2 z-50 lg:w-[720px] h-[58px] lg:h-20 glass-panel px-2.5 lg:px-8 flex items-center justify-between shadow-glass-strong border-white/10 backdrop-blur-3xl rounded-xl lg:rounded-full overflow-hidden lg:overflow-visible group/dock select-none mb-[env(safe-area-inset-bottom)] transition-all duration-300"
            style={{ 
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(15, 15, 15, 0.75) 100%)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(29, 185, 84, 0.1)'
            }}
          >
            {/* Liquid Progress Track - Top attached */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
               <div 
                 className="h-full bg-spotify-green shadow-[0_0_10px_rgba(29,185,84,0.4)] transition-all duration-300"
                 style={{ width: `${progress}%` }}
               />
            </div>

            {/* Identity */}
            <div className="flex items-center space-x-2.5 w-[120px] lg:w-[200px] shrink-0">
              <div 
                className="relative cursor-pointer shrink-0" 
                onClick={() => setIsExpanded(true)}
              >
                <div className="h-9 w-9 lg:h-12 lg:w-12 rounded-lg lg:rounded-xl overflow-hidden bg-spotify-dark border border-white/10 flex items-center justify-center shadow-glass-soft relative group">
                  <img src="/logo.png" alt="artwork" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 lg:opacity-0 lg:group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm">
                    <Maximize2 size={12} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="truncate py-1 flex-1">
                <h4 className="font-bold text-white text-[10px] lg:text-sm truncate tracking-tight">{(currentSong.song_name || "Unknown Track")}</h4>
                <div className="flex lg:flex items-center space-x-1 mt-0.5">
                   <div className="w-0.5 h-0.5 bg-spotify-green rounded-full animate-pulse" />
                   <p className="text-zinc-500 text-[6px] font-black uppercase tracking-widest truncate">Live</p>
                </div>
              </div>
            </div>

            {/* Core Controls */}
            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 lg:space-x-6 flex-1 justify-center lg:px-4">
              <div className="flex items-center space-x-4 sm:space-x-6">
                <button 
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`hidden lg:block transition-all duration-300 hover:scale-110 ${isShuffle ? 'text-spotify-green drop-shadow-[0_0_8px_rgba(29,185,84,0.5)]' : 'text-zinc-500 hover:text-white'}`}
                >
                  <Shuffle size={14} />
                </button>
                
                <button onClick={onPrevious} className="hidden sm:block text-zinc-400 hover:text-white transition-all duration-300 hover:scale-110 active:scale-90">
                  <SkipBack size={20} fill="currentColor" />
                </button>
              </div>
              
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-9 w-9 lg:h-12 lg:w-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg relative shrink-0 mx-2"
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
              </button>

              <div className="flex items-center space-x-4 sm:space-x-6">
                <button onClick={onNext} className="text-zinc-400 hover:text-white transition-all duration-300 hover:scale-110 active:scale-90">
                  <SkipForward size={20} fill="currentColor" />
                </button>
                
                <button 
                  onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                  className={`hidden lg:block relative transition-all duration-300 hover:scale-110 ${repeatMode !== 'none' ? 'text-spotify-green drop-shadow-[0_0_8px_rgba(29,185,84,0.5)]' : 'text-zinc-500 hover:text-white'}`}
                >
                  <Repeat size={14} />
                  {repeatMode === 'one' && <span className="absolute -top-1.5 -right-1.5 text-[7px] font-black bg-spotify-green text-black rounded-full px-1 border border-black shadow-lg">1</span>}
                </button>
              </div>
            </div>

            {/* Utility */}
            <div className="flex items-center justify-end space-x-1 lg:space-x-4 w-[60px] lg:w-[200px] shrink-0">
              <div className="hidden lg:flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 transition-all duration-300">
                {volume === 0 ? <VolumeX size={14} className="text-zinc-500" /> : volume < 0.5 ? <Volume1 size={14} className="text-zinc-500" /> : <Volume2 size={14} className="text-zinc-400" />}
                <input
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    if (audioRef.current) audioRef.current.volume = val;
                  }}
                  className="w-12 lg:w-20 apple-range h-1"
                />
              </div>
              
              <button 
                onClick={() => onLike(currentSong.url)}
                className={`p-2 rounded-xl transition-all duration-300 ${isLiked ? 'text-spotify-green lg:bg-spotify-green/10' : 'text-zinc-500 hover:text-white'}`}
              >
                 <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              </button>

              <button 
                onClick={() => setShowQueue(!showQueue)}
                className={`hidden lg:block p-2 rounded-xl transition-all duration-300 ${showQueue ? 'bg-spotify-green/20 text-spotify-green' : 'text-zinc-500 hover:text-white lg:bg-white/5'}`}
              >
                <ListMusic size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Immersive Full-Screen Player - Mobile Optimized */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 35, stiffness: 250 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden"
          >
            {/* Liquid Mesh Background - Lightened for performance */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-liquid-mesh opacity-30" />
              <div className="absolute top-0 left-0 w-full h-full bg-black/60 backdrop-blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col h-full px-6 lg:px-12 pt-12 lg:pt-16 pb-8 lg:pb-16">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 lg:mb-12">
                <button 
                  onClick={() => setIsExpanded(false)} 
                  className="p-3 bg-white/5 border border-white/5 rounded-2xl active:scale-90 transition-all"
                >
                  <ChevronDown size={28} />
                </button>
                <div className="text-center">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-1">Lossless Audio</p>
                  <div className="flex items-center space-x-1.5 justify-center">
                     <div className="w-1.5 h-1.5 bg-spotify-green rounded-full animate-pulse shadow-[0_0_8px_rgba(29,185,84,1)]" />
                     <h3 className="font-black text-xs tracking-widest uppercase">SYNCLER</h3>
                  </div>
                </div>
                <div className="w-10 h-10 lg:hidden" /> {/* Spacer */}
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-32">
                {/* Artwork */}
                <div className="w-full max-w-[320px] lg:max-w-xl aspect-square relative group">
                  <motion.div 
                    layoutId="player-artwork"
                    className="w-full h-full rounded-[40px] overflow-hidden shadow-2xl border border-white/10 bg-spotify-dark flex items-center justify-center relative z-10"
                  >
                    <img src="/logo.png" alt="artwork" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-glass-shine opacity-20 pointer-events-none" />
                  </motion.div>
                  <div className="absolute -inset-4 bg-spotify-green/10 blur-3xl opacity-50 rounded-full -z-10" />
                </div>

                {/* Player Controls */}
                <div className="w-full max-w-2xl flex flex-col">
                  <div className="flex items-start justify-between mb-8 lg:mb-16">
                    <div className="truncate pr-4">
                      <motion.h1 
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="text-4xl lg:text-7xl font-black text-white mb-2 truncate tracking-tight leading-tight"
                      >
                        {(currentSong.song_name || "Unknown Track")}
                      </motion.h1>
                      <p className="text-lg lg:text-2xl text-zinc-400 font-bold tracking-tight">Premium High Fidelity</p>
                    </div>
                    <button 
                      onClick={() => onLike(currentSong.url)}
                      className={`p-4 lg:p-6 rounded-3xl transition-all ${
                        isLiked ? 'text-spotify-green bg-spotify-green/10 border border-spotify-green/20' : 'text-zinc-500 bg-white/5 border border-white/5'
                      }`}
                    >
                      <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {/* Progress */}
                  <div className="space-y-4 mb-10 relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleSeek}
                      className="w-full apple-range h-2 rounded-full"
                    />
                    <div className="flex justify-between text-xs lg:text-sm font-bold text-zinc-500 tabular-nums">
                      <span className="text-spotify-green">{formatTime(audioRef.current?.currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Playback Buttons */}
                  <div className="flex items-center justify-between lg:px-6">
                    <button 
                      onClick={() => setIsShuffle(!isShuffle)}
                      className={`p-4 rounded-2xl transition-all ${isShuffle ? 'text-spotify-green bg-white/10' : 'text-zinc-500 bg-white/5'}`}
                    >
                      <Shuffle size={24} />
                    </button>
                    
                    <div className="flex items-center space-x-8 lg:space-x-16">
                      <button onClick={onPrevious} className="text-zinc-400 hover:text-white transition-all transform active:scale-90">
                        <SkipBack size={48} fill="currentColor" />
                      </button>
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="h-24 w-24 lg:h-32 lg:w-32 rounded-[32px] lg:rounded-[48px] bg-white text-black flex items-center justify-center active:scale-95 transition-all shadow-xl relative overflow-hidden"
                      >
                        {isPlaying ? <Pause size={40} lg:size={56} fill="currentColor" /> : <Play size={40} lg:size={56} fill="currentColor" className="ml-2" />}
                      </button>
                      <button onClick={onNext} className="text-zinc-400 hover:text-white transition-all transform active:scale-90">
                        <SkipForward size={48} fill="currentColor" />
                      </button>
                    </div>

                    <button 
                      onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                      className={`p-4 rounded-2xl relative transition-all ${repeatMode !== 'none' ? 'text-spotify-green bg-white/10' : 'text-zinc-500 bg-white/5'}`}
                    >
                      <Repeat size={24} />
                      {repeatMode === 'one' && <span className="absolute top-2 right-2 text-[10px] font-black bg-spotify-green text-black rounded-full px-1 border border-black">1</span>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Volume */}
              <div className="mt-auto lg:mt-0 flex items-center justify-center py-8 lg:py-16">
                <div className="w-full max-w-3xl flex items-center space-x-4 lg:space-x-8 glass-panel p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] border-white/5 bg-white/5">
                  <Volume2 size={24} className="text-zinc-500" />
                  <input
                    type="range" min="0" max="1" step="0.01" value={volume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setVolume(val);
                      if (audioRef.current) audioRef.current.volume = val;
                    }}
                    className="flex-1 apple-range h-2"
                  />
                  <span className="text-sm lg:text-xl font-bold text-spotify-green w-12 text-right">{Math.round(volume * 100)}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue Drawer - Mobile Optimized */}
      <AnimatePresence>
        {showQueue && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-4 bottom-24 lg:inset-auto lg:bottom-28 lg:right-8 lg:w-[400px] glass-panel p-6 lg:p-8 z-[60] shadow-glass-strong border-white/10 backdrop-blur-3xl rounded-[32px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                 <div className="w-1.5 h-1.5 bg-spotify-green rounded-full shadow-[0_0_8px_rgba(29,185,84,1)]" />
                 <h3 className="text-lg font-bold">Queue</h3>
              </div>
              <button onClick={() => clearQueue()} className="text-[9px] font-black text-red-400 uppercase tracking-widest bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/10 active:scale-95 transition-all">Clear All</button>
            </div>
            <div className="space-y-2 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
              {queue.length > 0 ? (
                queue.map((song, i) => (
                  <div 
                    key={`${song.url}-${i}`} 
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center space-x-3 truncate">
                       <div className="h-10 w-10 rounded-xl bg-spotify-dark flex items-center justify-center shrink-0 overflow-hidden shadow-glass-soft">
                          <img src="/logo.png" alt="q" className="w-full h-full object-cover opacity-60" />
                       </div>
                       <p className="text-xs font-bold text-white truncate">{(song.song_name || "Unknown")}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeFromQueue(i); }} className="p-2 text-zinc-500 hover:text-red-400 rounded-xl active:scale-90 transition-all">
                      <X size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[24px]">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Empty Queue</p>
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
