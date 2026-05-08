import React from 'react';
import SongListItem from '../components/SongListItem';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Music, ListMusic, SearchX } from 'lucide-react';

const HomePage = ({ songs, isSearching, loading, error, currentSong, isPlaying, onPlaySong }) => {
  if (loading) {
    return (
      <div className="h-[calc(100vh-160px)] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-160px)] flex items-center justify-center">
        <div className="text-center space-y-4 glass p-8 rounded-[40px] border-red-500/20 max-w-sm">
          <p className="text-red-400 font-bold uppercase tracking-widest text-xs">System Error</p>
          <p className="text-zinc-300 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-sm transition-colors border border-white/10 font-bold uppercase tracking-widest"
          >
            Reconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 px-8 pt-8">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        {!isSearching && (
          <div className="relative h-56 rounded-[40px] overflow-hidden group mb-12 glass border border-white/5 flex items-center px-12 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-green-900/20" />
            <div className="relative z-10 flex items-center space-x-10">
              <div className="h-28 w-28 rounded-3xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-2xl shadow-primary/20 transform group-hover:scale-105 transition-transform duration-500">
                <ListMusic size={56} className="text-primary" />
              </div>
              <div>
                <span className="text-primary text-xs font-black uppercase tracking-[0.3em] mb-3 block">Private Network</span>
                <h1 className="text-5xl font-black text-white tracking-tighter mb-2 uppercase">Main Vault</h1>
                <p className="text-zinc-500 font-bold tracking-wide uppercase text-[10px]">{songs.length} Tracks Ready</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-12">
          <div className="flex items-center justify-between mb-10 px-4">
            <h2 className="text-sm font-black tracking-[0.4em] text-zinc-600 flex items-center space-x-4 uppercase">
              <span>{isSearching ? 'Search Results' : 'System Library'}</span>
            </h2>
            <div className="h-px flex-1 bg-white/5 mx-10" />
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{songs.length} Items</span>
          </div>

          <AnimatePresence mode="popLayout">
            {songs.length > 0 ? (
              <motion.div 
                layout
                className="space-y-4"
              >
                {songs.map((song, index) => (
                  <SongListItem 
                    key={song.url} 
                    song={song} 
                    isActive={currentSong?.url === song.url}
                    isPlaying={isPlaying}
                    onPlay={onPlaySong} 
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-80 glass rounded-[48px] flex flex-col items-center justify-center text-center p-12 border-dashed border-white/10"
              >
                <div className="h-20 w-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8">
                  {isSearching ? <SearchX size={40} className="text-zinc-600" /> : <Music size={40} className="text-zinc-600" />}
                </div>
                <h3 className="text-2xl font-black mb-3 text-white uppercase tracking-tighter">
                  {isSearching ? 'No Matches Found' : 'Empty Vault'}
                </h3>
                <p className="text-zinc-500 font-bold tracking-wide max-w-xs uppercase text-[10px]">
                  {isSearching 
                    ? 'Adjust your query to locate the desired track module.' 
                    : 'Initialize your network by uploading track modules using the sync button.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
