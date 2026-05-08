import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, 
  Volume2, VolumeX, ListMusic, Music2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Player = ({ currentSong, isPlaying, setIsPlaying, onNext, onPrevious }) => {
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (currentSong) {
      setIsPlaying(true);
    }
  }, [currentSong]);

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setCurrentTime(current);
      if (total) setProgress((current / total) * 100);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newProgress);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentSong) return null;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-0 sm:px-4 pb-0 sm:pb-4 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto w-full pointer-events-auto">
        <div className="glass bg-black/80 backdrop-blur-3xl border-t sm:border border-white/5 sm:rounded-[32px] px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between shadow-2xl relative overflow-hidden group">
          
          {/* Progress Bar (Desktop: Fixed, Mobile: Absolute Top) */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden block sm:hidden">
            <div 
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <audio 
            ref={audioRef}
            src={currentSong.url}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onEnded={onNext}
          />

          {/* Song Info */}
          <div className="flex items-center space-x-3 sm:space-x-5 w-auto sm:w-1/4">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5 relative group/img cursor-pointer"
            >
              <Music2 size={24} className="sm:size-32" />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                 <div className="flex items-end space-x-0.5 h-3">
                    <motion.div animate={{ height: [4, 12, 6] }} transition={{ repeat: Infinity }} className="w-0.5 bg-primary rounded-full" />
                    <motion.div animate={{ height: [8, 4, 12] }} transition={{ repeat: Infinity }} className="w-0.5 bg-primary rounded-full" />
                    <motion.div animate={{ height: [6, 12, 4] }} transition={{ repeat: Infinity }} className="w-0.5 bg-primary rounded-full" />
                 </div>
              </div>
            </motion.div>
            <div className="flex flex-col truncate max-w-[120px] sm:max-w-none">
              <h4 className="text-sm font-bold text-white truncate mb-0.5 group-hover:text-primary transition-colors cursor-pointer">{currentSong.song_name}</h4>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black hidden sm:block">Sync Network</p>
              <p className="text-[10px] text-zinc-400 font-bold block sm:hidden">Track</p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center flex-1 px-4 sm:px-8">
            <div className="flex items-center space-x-4 sm:space-x-8 mb-0 sm:mb-3">
              <button className="text-zinc-600 hover:text-white transition-colors hidden sm:block">
                <Shuffle size={18} />
              </button>
              <button 
                onClick={onPrevious}
                className="text-zinc-400 hover:text-white transition-all transform active:scale-90"
              >
                <SkipBack size={22} fill="currentColor" />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all active:scale-95 shadow-xl shadow-white/10"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
              </button>
              <button 
                onClick={onNext}
                className="text-zinc-400 hover:text-white transition-all transform active:scale-90"
              >
                <SkipForward size={22} fill="currentColor" />
              </button>
              <button className="text-zinc-600 hover:text-white transition-colors hidden sm:block">
                <Repeat size={18} />
              </button>
            </div>
            
            <div className="hidden sm:flex items-center space-x-4 w-full">
              <span className="text-[10px] text-zinc-500 font-bold w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
              <div className="flex-1 h-1 relative group bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
                <input 
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={progress}
                  onChange={handleProgressChange}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                />
              </div>
              <span className="text-[10px] text-zinc-500 font-bold w-10 tabular-nums">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume & Actions */}
          <div className="flex items-center justify-end space-x-4 sm:space-x-6 w-auto sm:w-1/4">
            <button className="text-zinc-500 hover:text-white transition-colors hidden sm:block">
              <ListMusic size={20} />
            </button>
            <div className="hidden sm:flex items-center space-x-3 w-32 group">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="text-zinc-400 hover:text-white transition-colors flex-shrink-0"
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <div className="flex-1 h-1 relative bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-zinc-400 group-hover:bg-primary transition-all"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const newVol = parseFloat(e.target.value);
                    setVolume(newVol);
                    setIsMuted(newVol === 0);
                    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : newVol;
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                />
              </div>
            </div>
            {/* Mobile Expand Toggle - could be added for a full screen player */}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Player;
