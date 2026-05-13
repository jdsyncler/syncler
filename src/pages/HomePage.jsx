import React from 'react';
import SongListItem from '../components/SongListItem';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Music, SearchX, Heart, Play, Zap, Star } from 'lucide-react';

const HomePage = ({ songs, isSearching, loading, error, currentSong, isPlaying, onPlaySong, onLike, onAddToPlaylist, onAddToQueue, title }) => {
  const safeSongs = Array.isArray(songs) ? songs : [];
  const [visibleCount, setVisibleCount] = React.useState(30);
  const observerTarget = React.useRef(null);

  React.useEffect(() => {
    setVisibleCount(30);
  }, [safeSongs.length, title]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && visibleCount < safeSongs.length) {
          setVisibleCount(prev => prev + 30);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, safeSongs.length]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <Loader2 className="animate-spin text-spotify-green" size={40} strokeWidth={3} />
          <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Library</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 lg:pt-12 pb-32">
      <div className="max-w-7xl mx-auto space-y-8 lg:space-y-16">
        {/* Hero Section - More compact on mobile */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[24px] lg:rounded-[48px] aspect-[16/11] sm:aspect-[21/9] min-h-[260px] lg:min-h-[400px] shadow-glass-strong border border-white/5 group"
        >
          {/* Background Canvas */}
          <div className="absolute inset-0 bg-spotify-dark" />
          <div className="absolute inset-0 bg-gradient-to-br from-spotify-green/20 via-transparent to-transparent opacity-60" />
          <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-spotify-green/10 blur-[100px] rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />

          {/* Content Overlay */}
          <div className="relative h-full flex flex-col justify-end p-5 lg:p-20 z-10">
            <div className="flex items-center space-x-3 mb-3 lg:mb-6">
               <div className="px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 flex items-center space-x-2">
                 <div className="w-1 h-1 bg-spotify-green rounded-full animate-pulse shadow-[0_0_8px_rgba(29,185,84,1)]" />
                 <span className="text-[7px] lg:text-[10px] font-black text-white uppercase tracking-widest">Premium Collection</span>
               </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-9xl font-black text-white mb-6 lg:mb-10 tracking-tighter leading-[0.95]">
              {title === 'All Songs' ? 'Library' : title}
            </h1>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-8">
              <button 
                onClick={() => safeSongs.length > 0 && onPlaySong(safeSongs[0])}
                className="btn-spotify px-6 sm:px-8 lg:px-12 py-3 lg:py-5 flex items-center justify-center space-x-2.5 lg:space-x-4 active:scale-95 transition-all w-full sm:w-auto"
              >
                <Play size={18} lg:size={28} fill="currentColor" />
                <span className="font-black text-xs sm:text-sm lg:text-lg tracking-tight">Play Mix</span>
              </button>

              <div className="flex items-center space-x-6 lg:space-x-12 px-2 sm:px-0">
                 <div className="text-left">
                    <p className="text-lg lg:text-3xl font-black text-white tracking-tighter leading-none">{safeSongs.length}</p>
                    <p className="text-[7px] lg:text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-0.5 lg:mt-1">Tracks</p>
                 </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Track List Canvas */}
        <section className="space-y-6 lg:space-y-10">
          <div className="flex items-end justify-between px-2 lg:px-4">
            <div className="space-y-1 lg:space-y-2">
              <h2 className="text-2xl lg:text-4xl font-black text-white tracking-tighter">Tracks</h2>
              <div className="h-1 w-12 lg:w-20 bg-spotify-green rounded-full" />
            </div>
            <div className="flex items-center space-x-4 lg:space-x-6">
              <div className="hidden sm:flex items-center space-x-3">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Sort:</span>
                <button className="text-[9px] font-black text-white uppercase tracking-widest pb-1 border-b-2 border-spotify-green">Recent</button>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-xl">
                <button className="p-2 bg-white/10 rounded-lg text-white shadow-lg transition-all"><Zap size={14} /></button>
                <button className="p-2 text-zinc-500 hover:text-white transition-all"><Star size={14} /></button>
              </div>
            </div>
          </div>

          {safeSongs.length > 0 ? (
            <div className="grid grid-cols-1 gap-1 lg:gap-2">
              {safeSongs.slice(0, visibleCount).map((song, index) => (
                <SongListItem 
                  key={song.url} 
                  index={index}
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
                <div ref={observerTarget} className="h-32 flex items-center justify-center">
                  <Loader2 className="animate-spin text-spotify-green/20" size={24} />
                </div>
              )}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-[300px] lg:h-[400px] flex flex-col items-center justify-center text-center p-8 lg:p-20 glass-panel border-dashed border-white/10"
            >
              <div className="mb-6 lg:mb-10 p-6 lg:p-10 bg-white/5 rounded-3xl lg:rounded-[40px] border border-white/5">
                {title.includes('Liked') ? (
                  <Heart size={48} lg:size={64} className="text-zinc-800" />
                ) : isSearching ? (
                  <SearchX size={48} lg:size={64} className="text-zinc-800" />
                ) : (
                  <Music size={48} lg:size={64} className="text-zinc-800" />
                )}
              </div>
              <h3 className="text-2xl lg:text-3xl font-black mb-2 lg:mb-4 text-white tracking-tighter">
                {title.includes('Liked') ? 'Empty Favorites' : isSearching ? 'Zero Results' : 'Library Offline'}
              </h3>
              <p className="text-zinc-500 text-xs lg:text-sm max-w-sm mx-auto font-bold tracking-tight">
                {title.includes('Liked') 
                  ? 'Heart your favorite tracks to build your collection.' 
                  : isSearching 
                    ? 'No matches found in your collection.' 
                    : 'Connect your cloud account to start streaming.'}
              </p>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
};

export default React.memo(HomePage);
