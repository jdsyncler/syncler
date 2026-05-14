import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, 
  ListMusic, Maximize2, ChevronDown, X, Volume2, Music 
} from 'lucide-react';
import { cleanSongName } from '../lib/utils';

const Waveform = ({ isPlaying }) => (
  <div className="flex items-center space-x-1 h-6">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        animate={isPlaying ? { height: [4, 20, 8, 24, 6] } : { height: 4 }}
        transition={{ duration: 0.6 + (i * 0.1), repeat: Infinity, ease: "easeInOut" }}
        className="w-1 bg-spotify-green rounded-full shadow-[0_0_10px_#00ff66]"
      />
    ))}
  </div>
);

const Player = ({ 
  currentSong, isPlaying, setIsPlaying, onNext, onPrevious, 
  isExpanded, setIsExpanded, songs = [],
  isShuffle, setIsShuffle, repeatMode = 'none', setRepeatMode,
  queue = [], removeFromQueue, clearQueue
}) => {
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showQueue, setShowQueue] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const audioRef = useRef(null);
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (currentSong?.url && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: cleanSongName(currentSong.song_name || 'Unknown'),
          artist: 'SYNCLER By JD',
          artwork: [{ src: '/logo.png', sizes: '512x512', type: 'image/png' }]
        });
        navigator.mediaSession.setActionHandler('play', () => setIsPlaying?.(true));
        navigator.mediaSession.setActionHandler('pause', () => setIsPlaying?.(false));
        navigator.mediaSession.setActionHandler('previoustrack', () => onPrevious?.());
        navigator.mediaSession.setActionHandler('nexttrack', () => onNext?.());
      } catch (e) { console.error("MediaSession Error", e); }
    }
  }, [currentSong, setIsPlaying, onNext, onPrevious]);

  useEffect(() => {
    let isMounted = true;
    if (currentSong?.url && audioRef.current) {
      const playAudio = async () => {
        if (isTransitioning.current) return;
        isTransitioning.current = true;
        try {
          if (isMounted) { setProgress(0); setDuration(0); }
          audioRef.current.src = currentSong.url;
          audioRef.current.load();
          if (isPlaying) {
            const p = audioRef.current.play();
            if (p !== undefined) await p;
          }
        } catch (e) {
          console.error("Playback Error", e);
          if (isMounted) setIsPlaying?.(false);
        } finally { isTransitioning.current = false; }
      };
      playAudio();
    }
    return () => { isMounted = false; };
  }, [currentSong?.url]);

  useEffect(() => {
    if (!audioRef.current || !currentSong?.url || isTransitioning.current) return;
    const sync = async () => {
      try {
        if (isPlaying) {
          const p = audioRef.current.play();
          if (p !== undefined) await p;
        } else {
          audioRef.current.pause();
        }
      } catch (e) { console.error("Sync Error", e); if (isPlaying) setIsPlaying?.(false); }
    };
    sync();
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isHovered) {
      const c = audioRef.current.currentTime;
      const d = audioRef.current.duration;
      if (d > 0 && !isNaN(c) && !isNaN(d)) setProgress((c / d) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const d = audioRef.current.duration;
      if (!isNaN(d)) setDuration(d);
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    } else {
      onNext?.();
    }
  };

  const formatTime = useCallback((t) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }, []);

  if (!currentSong || !currentSong.url) return null;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => setIsPlaying?.(false)}
        preload="auto"
      />

      {/* Floating Premium Mini Player */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-[74px] lg:bottom-8 left-4 right-4 lg:left-1/2 lg:-translate-x-1/2 z-50 lg:w-[800px] glass-panel-premium p-3 lg:p-4 flex items-center justify-between group select-none"
          >
            {/* Dynamic Progress Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-spotify-green to-spotify-cyan shadow-[0_0_15px_rgba(0,255,102,0.6)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center space-x-4 flex-1 truncate cursor-pointer" onClick={() => setIsExpanded(true)}>
              <div className={`relative h-12 w-12 lg:h-16 lg:w-16 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/10 ${isPlaying ? 'animate-rotate-slow' : ''}`}>
                <img src="/logo.png" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="truncate pr-4">
                <h4 className="font-black text-white text-sm lg:text-lg truncate italic glow-text-green tracking-tight">{cleanSongName(currentSong.song_name)}</h4>
                <div className="flex items-center space-x-2">
                   <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">SYNCLER CORE</p>
                   {isPlaying && <Waveform isPlaying={true} />}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 lg:space-x-8">
              <div className="hidden lg:flex items-center space-x-6">
                <button onClick={() => onPrevious?.()} className="text-zinc-500 hover:text-white transition-all"><SkipBack size={24} fill="currentColor" /></button>
                <button onClick={() => setIsPlaying?.(!isPlaying)} className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all">
                  {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                </button>
                <button onClick={() => onNext?.()} className="text-zinc-500 hover:text-white transition-all"><SkipForward size={24} fill="currentColor" /></button>
              </div>
              
              <div className="flex lg:hidden">
                <button onClick={() => setIsPlaying?.(!isPlaying)} className="h-10 w-10 rounded-xl bg-white text-black flex items-center justify-center">
                  {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-0.5" />}
                </button>
              </div>

              <button onClick={() => setShowQueue(!showQueue)} className="text-zinc-500 hover:text-white hidden lg:block"><ListMusic size={24} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Immersive Full Player */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col p-6 lg:p-16 overflow-hidden"
          >
            {/* Immersive Ambient Glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-spotify-green/10 blur-[150px] rounded-full animate-pulse" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-spotify-cyan/5 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-12">
                <button onClick={() => setIsExpanded(false)} className="h-14 w-14 glass-panel-premium flex items-center justify-center hover:scale-110 active:scale-90 transition-all">
                  <ChevronDown size={32} />
                </button>
                <div className="text-center">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] mb-1">Master Audio Engine</p>
                  <h3 className="text-xl font-black italic tracking-tighter glow-text-green">SYNCLER</h3>
                </div>
                <button onClick={() => setShowQueue(!showQueue)} className="h-14 w-14 glass-panel-premium flex items-center justify-center hover:scale-110 active:scale-90 transition-all">
                  <ListMusic size={28} />
                </button>
              </div>

              <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-32">
                <motion.div 
                  layoutId="art"
                  className={`w-full max-w-[340px] lg:max-w-[550px] aspect-square rounded-[48px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/5 relative group overflow-hidden ${isPlaying ? 'animate-float' : ''}`}
                >
                  <img src="/logo.png" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute inset-0 border-[20px] border-white/5 rounded-[48px]" />
                </motion.div>

                <div className="w-full max-w-xl text-center lg:text-left space-y-12">
                  <div>
                    <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter italic leading-none mb-4 glow-text-green">{cleanSongName(currentSong.song_name)}</h1>
                    <div className="flex items-center justify-center lg:justify-start space-x-4">
                       <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-black text-spotify-cyan border border-white/10 uppercase tracking-widest">Premium Lossless</span>
                       <p className="text-xl lg:text-3xl font-bold text-zinc-500 tracking-tight">SYNCLER Original</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative group">
                      <input 
                        type="range" min="0" max="100" value={progress} 
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          if (audioRef.current) audioRef.current.currentTime = (v / 100) * duration;
                          setProgress(v);
                        }}
                        onMouseDown={() => setIsHovered(true)}
                        onMouseUp={() => setIsHovered(false)}
                        className="w-full syncler-range h-2 bg-white/5 rounded-full appearance-none cursor-pointer overflow-hidden" 
                      />
                      <div className="absolute top-1/2 -translate-y-1/2 left-0 h-2 bg-spotify-green rounded-full pointer-events-none shadow-[0_0_15px_#00ff66]" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-sm font-black text-zinc-500 tabular-nums tracking-widest">
                      <span>{formatTime(audioRef.current?.currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-start lg:space-x-20">
                    <button onClick={() => setIsShuffle?.(!isShuffle)} className={isShuffle ? "text-spotify-green glow-text-green scale-110" : "text-zinc-600"}><Shuffle size={32} /></button>
                    <div className="flex items-center space-x-12 lg:space-x-16">
                      <button onClick={() => onPrevious?.()} className="text-zinc-400 hover:text-white transform transition-all active:scale-90"><SkipBack size={56} fill="currentColor" /></button>
                      <button onClick={() => setIsPlaying?.(!isPlaying)} className="h-24 w-24 lg:h-32 lg:w-32 rounded-[32px] bg-white text-black flex items-center justify-center shadow-[0_20px_50px_rgba(255,255,255,0.2)] active:scale-90 transition-all">
                        {isPlaying ? <Pause size={48} lg:size={64} fill="black" /> : <Play size={48} lg:size={64} fill="black" className="ml-2" />}
                      </button>
                      <button onClick={() => onNext?.()} className="text-zinc-400 hover:text-white transform transition-all active:scale-90"><SkipForward size={56} fill="currentColor" /></button>
                    </div>
                    <button onClick={() => setRepeatMode?.(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')} className={repeatMode !== 'none' ? "text-spotify-cyan glow-text-cyan scale-110" : "text-zinc-600"}><Repeat size={32} /></button>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-center">
                <div className="w-full max-w-4xl glass-panel-premium px-8 py-6 flex items-center space-x-8">
                  <Volume2 size={24} className="text-zinc-500" />
                  <div className="flex-1 relative">
                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      if (audioRef.current) audioRef.current.volume = v;
                    }} className="w-full syncler-range" />
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-white/20 rounded-full pointer-events-none" style={{ width: `${volume * 100}%` }} />
                  </div>
                  <span className="text-lg font-black text-white w-12 text-right">{Math.round(volume * 100)}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Queue Drawer */}
      <AnimatePresence>
        {showQueue && (
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-full lg:w-[450px] z-[120] glass-panel-premium rounded-none border-l border-white/10 p-8 flex flex-col shadow-[-50px_0_100px_rgba(0,0,0,0.8)]"
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-black italic tracking-tighter">Queue</h2>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Up Next in Syncler</p>
              </div>
              <button onClick={() => setShowQueue(false)} className="h-12 w-12 glass-panel-premium flex items-center justify-center"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
              {queue.length > 0 ? queue.map((s, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  key={`${s.url}-${i}`} 
                  className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center space-x-4 truncate pr-4">
                    <img src="/logo.png" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                    <div className="truncate">
                      <p className="font-bold text-white truncate text-sm">{cleanSongName(s.song_name)}</p>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Next Track</p>
                    </div>
                  </div>
                  <button onClick={() => removeFromQueue?.(i)} className="p-2 text-zinc-500 hover:text-red-500"><X size={18} /></button>
                </motion.div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                  <Music size={64} />
                  <p className="text-xs font-black uppercase tracking-widest">Queue is clear</p>
                </div>
              )}
            </div>

            {queue.length > 0 && (
              <button onClick={() => clearQueue?.()} className="mt-8 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase tracking-widest text-xs">Clear Stream</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Player;
