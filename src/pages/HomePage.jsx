import React, { useState, useEffect, useMemo, useRef } from 'react';
import SongListItem from '../components/SongListItem';
import SongCard from '../components/SongCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, SearchX, Play, Zap, Clock, Sparkles } from 'lucide-react';

const HomePage = ({ songs, recentlyPlayed = [], loading, currentSong, isPlaying, onPlaySong, onAddToPlaylist, onAddToQueue, title }) => {
  const [greeting, setGreeting] = useState('');
  const [visibleCount, setVisibleCount] = useState(30);
  const observerTarget = useRef(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    setVisibleCount(30);
  }, [songs.length, title]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && visibleCount < songs.length) {
          setVisibleCount(prev => prev + 30);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [visibleCount, songs.length]);

  return (
    <div className="space-y-12 lg:space-y-20 py-8 lg:py-12">
      {/* Dynamic Greeting & Featured */}
      {!loading && title === 'Library' && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl lg:text-6xl font-black tracking-tighter italic">{greeting}</h1>
              <p className="text-zinc-500 text-xs lg:text-sm font-bold uppercase tracking-[0.3em] mt-2 flex items-center">
                <Sparkles size={14} className="text-spotify-green mr-2" />
                Curated for you
              </p>
            </div>
            <div className="hidden lg:flex space-x-4">
              <div className="h-14 w-14 rounded-2xl glass-panel-premium flex items-center justify-center text-spotify-green">
                <Zap size={24} />
              </div>
            </div>
          </div>

          {/* Recently Played - Horizontal Scroll */}
          {recentlyPlayed.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Clock size={18} className="text-zinc-500" />
                <h2 className="text-xl font-black tracking-tight uppercase">Recently Played</h2>
              </div>
              <div className="h-scroll-premium">
                {recentlyPlayed.slice(0, 10).map((song, i) => (
                  <div key={`${song.url}-${i}`} className="h-scroll-item w-48 lg:w-64">
                    <SongCard 
                      song={song} 
                      onPlay={onPlaySong} 
                      isActive={currentSong?.url === song.url}
                      isPlaying={isPlaying}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* Main Library Section */}
      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-white/5 pb-6">
          <div className="space-y-2">
            <h2 className="text-3xl lg:text-5xl font-black tracking-tighter italic">{title}</h2>
            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <div className="h-1.5 w-1.5 bg-spotify-green rounded-full shadow-[0_0_8px_#00ff66]" />
              <span>{songs.length} Tracks Syncronized</span>
            </div>
          </div>
          {songs.length > 0 && (
            <button 
              onClick={() => onPlaySong(songs[0])}
              className="h-14 w-14 lg:h-16 lg:w-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
            >
              <Play fill="black" size={24} className="ml-1" />
            </button>
          )}
        </div>

        {songs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">
            {songs.slice(0, visibleCount).map((song, index) => (
              <SongListItem 
                key={`${song.url}-${index}`} 
                index={index}
                song={song} 
                isActive={currentSong?.url === song.url}
                isPlaying={isPlaying}
                onPlay={onPlaySong} 
                onAddToPlaylist={onAddToPlaylist}
                onAddToQueue={onAddToQueue}
              />
            ))}
            {visibleCount < songs.length && <div ref={observerTarget} className="h-20" />}
          </div>
        ) : !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 text-center glass-panel-premium border-dashed"
          >
            <Music size={48} className="mx-auto mb-6 text-zinc-800" />
            <h3 className="text-xl font-black mb-2 tracking-tight">Your library is silent</h3>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto">Start by importing your favorite tracks to build your premium collection.</p>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default React.memo(HomePage);
