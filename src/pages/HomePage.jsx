import React from 'react';
import SongListItem from '../components/SongListItem';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Music, SearchX, Heart, Play, Clock, BarChart3, Shield, Star, Zap, TrendingUp } from 'lucide-react';

const HomePage = ({ songs, isSearching, loading, error, currentSong, isPlaying, onPlaySong, onLike, onAddToPlaylist, onAddToQueue, title }) => {
  const safeSongs = Array.isArray(songs) ? songs : [];
  const [visibleCount, setVisibleCount] = React.useState(50);
  const observerTarget = React.useRef(null);

  React.useEffect(() => {
    setVisibleCount(50);
  }, [safeSongs.length, title]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && visibleCount < safeSongs.length) {
          setVisibleCount(prev => prev + 50);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, safeSongs.length]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-spotify-green/20 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="animate-spin text-spotify-green relative z-10" size={48} strokeWidth={3} />
          </div>
          <p className="text-zinc-500 font-black uppercase tracking-[0.4em] animate-pulse">Loading Library</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  return (
    <div className="pt-12 pb-48 px-4 lg:px-8">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-16"
      >
        {/* Immersive Hero Section */}
        <motion.section variants={itemVariants} className="relative overflow-hidden rounded-[48px] aspect-[21/9] min-h-[400px] shadow-glass-strong border border-white/10 group">
          {/* Background Canvas */}
          <div className="absolute inset-0 bg-spotify-dark" />
          <div className="absolute inset-0 bg-gradient-to-br from-spotify-green/20 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-1000" />
          <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-spotify-green/10 blur-[120px] rounded-full animate-liquid-slow" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />

          {/* Content Overlay */}
          <div className="relative h-full flex flex-col justify-end p-10 lg:p-20 z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-4 mb-6"
            >
               <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 flex items-center space-x-2">
                 <div className="w-1.5 h-1.5 bg-spotify-green rounded-full animate-pulse shadow-[0_0_8px_rgba(29,185,84,1)]" />
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Syncler Premium</span>
               </div>
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">v4.0 Liquid Glass</span>
            </motion.div>

            <h1 className="text-6xl lg:text-9xl font-black text-white mb-10 tracking-tighter leading-none">
              {title === 'All Songs' ? 'Your Library' : title}
            </h1>

            <div className="flex items-center space-x-8">
              <button 
                onClick={() => safeSongs.length > 0 && onPlaySong(safeSongs[0])}
                className="btn-spotify px-12 py-5 flex items-center space-x-4 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <Play size={28} fill="currentColor" />
                <span className="font-black text-lg tracking-tight">Play Everything</span>
              </button>

              <div className="hidden md:flex items-center space-x-12">
                 <div className="text-left">
                    <p className="text-3xl font-black text-white tracking-tighter">{safeSongs.length}</p>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Tracks</p>
                 </div>
                 <div className="w-px h-10 bg-white/10" />
                 <div className="text-left">
                    <p className="text-3xl font-black text-white tracking-tighter">4.2 Hrs</p>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Runtime</p>
                 </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Track List Canvas */}

        {/* Track List Canvas */}
        <motion.section variants={itemVariants} className="space-y-10">
          <div className="flex items-end justify-between px-4">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tighter">Library Tracks</h2>
              <div className="h-1 w-20 bg-spotify-green rounded-full" />
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Sort:</span>
                <button className="text-[10px] font-black text-white uppercase tracking-[0.3em] hover:text-spotify-green transition-colors pb-1 border-b-2 border-spotify-green">Date Added</button>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-xl border border-white/5">
                <button className="p-2 bg-white/10 rounded-lg text-white shadow-glass-soft transition-all"><Zap size={14} /></button>
                <button className="p-2 text-zinc-500 hover:text-white transition-all"><Star size={14} /></button>
              </div>
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {safeSongs.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 gap-2">
                {safeSongs.slice(0, visibleCount).map((song, index) => (
                  <SongListItem 
                    key={song.url} 
                    index={index + 1}
                    song={song} 
                    isActive={currentSong?.url === song.url}
                    isPlaying={isPlaying}
                    onPlay={onPlaySong} 
                    onLike={onLike}
                    onAddToPlaylist={onAddToPlaylist}
                    onAddToQueue={onAddToQueue}
                  />
                ))}
                
                {visibleCount < safeSongs.length && (
                  <div ref={observerTarget} className="h-48 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-4">
                       <Loader2 className="animate-spin text-spotify-green/40" size={32} />
                       <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Syncing more tracks</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-[400px] flex flex-col items-center justify-center text-center p-20 glass-panel border-dashed border-white/10"
              >
                <div className="mb-10 relative">
                  <div className="absolute inset-0 bg-zinc-800/20 blur-3xl rounded-full scale-150" />
                  <div className="p-10 bg-white/5 rounded-[40px] relative z-10 border border-white/5">
                    {title.includes('Liked') ? (
                      <Heart size={64} className="text-zinc-800" strokeWidth={1} />
                    ) : isSearching ? (
                      <SearchX size={64} className="text-zinc-800" strokeWidth={1} />
                    ) : (
                      <Music size={64} className="text-zinc-800" strokeWidth={1} />
                    )}
                  </div>
                </div>
                <h3 className="text-3xl font-black mb-4 text-white tracking-tighter">
                  {title.includes('Liked') ? 'Empty Favorites' : isSearching ? 'Zero Results' : 'Library Offline'}
                </h3>
                <p className="text-zinc-500 text-sm max-w-sm mx-auto font-bold tracking-tight">
                  {title.includes('Liked') 
                    ? 'Heart your favorite tracks to build your premium collection.' 
                    : isSearching 
                      ? 'The search query returned no matches in the local database.' 
                      : 'Connect your cloud accounts or import files to start streaming.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default HomePage;
