import React, { useState, useMemo, useCallback, lazy, Suspense, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Player from './components/Player';
import MobileNav from './components/MobileNav';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { useSongs } from './hooks/useSongs';
import { useAppCore } from './hooks/useAppCore';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, ListMusic, X, Sparkles, Loader2, Zap } from 'lucide-react';

// Lazy Load Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const PlaylistsPage = lazy(() => import('./pages/PlaylistsPage'));
const BulkImportPage = lazy(() => import('./pages/BulkImportPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,102,0.15),transparent_70%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.08, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="h-32 w-32 lg:h-56 lg:w-56 mb-12"
        >
          <img src="/logo.png" alt="SYNCLER" className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(0,255,102,0.5)]" />
        </motion.div>
        <div className="relative">
          <h1 className="text-6xl lg:text-9xl font-black tracking-[ -0.05em] text-white italic glow-text-green">SYNCLER</h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute -bottom-4 left-0 h-1 bg-gradient-to-r from-spotify-green to-spotify-cyan rounded-full shadow-[0_0_15px_#00ff66]"
          />
        </div>
        <div className="mt-12 flex items-center space-x-4">
          <Zap size={14} className="text-spotify-green animate-pulse" />
          <span className="text-[12px] font-black uppercase tracking-[0.8em] text-zinc-500">Master Core V2</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SkeletonLoader = () => (
  <div className="space-y-8 py-8 px-4">
    <div className="h-48 w-full skeleton" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-20 w-full skeleton" />
      ))}
    </div>
  </div>
);

const MainApp = () => {
  const { songs, loading: songsLoading, error: songsError, refreshSongs, runCleanup } = useSongs();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeView, setActiveView] = useState('library');
  const [currentSong, setCurrentSong] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  const { 
    playlists, createPlaylist, deletePlaylist, renamePlaylist, 
    addSongToPlaylist, removeSongFromPlaylist, 
    isShuffle, setIsShuffle, repeatMode, setRepeatMode,
    queue, addToQueue, removeFromQueue, clearQueue,
    recentlyPlayed, addRecentlyPlayed
  } = useAppCore(songs, isPlaying, setIsPlaying);

  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const mainContentRef = React.useRef(null);

  // Scroll to top on view change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeView]);

  const displaySongs = useMemo(() => {
    const safeSongs = Array.isArray(songs) ? songs : [];
    let filtered = [...safeSongs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(song => {
        if (!song) return false;
        return (song.song_name || "").toLowerCase().includes(query);
      });
    }

    if (activeView === 'history') {
      return Array.isArray(recentlyPlayed) ? recentlyPlayed : [];
    }

    return filtered;
  }, [songs, activeView, searchQuery, recentlyPlayed]);

  const handlePlaySong = useCallback((song) => {
    if (!song) return;
    if (currentSong?.url === song.url) {
      setIsPlaying(prev => !prev);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      if (typeof addRecentlyPlayed === 'function') addRecentlyPlayed(song);
    }
  }, [currentSong, addRecentlyPlayed]);

  const handleNext = useCallback((nextSong) => {
    const safeSongs = Array.isArray(songs) ? songs : [];
    if (safeSongs.length === 0) return;
    
    if (nextSong && nextSong.url) {
      setCurrentSong(nextSong);
      if (typeof addRecentlyPlayed === 'function') addRecentlyPlayed(nextSong);
      setIsPlaying(true);
      return;
    }

    const safeQueue = Array.isArray(queue) ? queue : [];
    if (safeQueue.length > 0) {
      const nextFromQueue = safeQueue[0];
      if (typeof removeFromQueue === 'function') removeFromQueue(0);
      setCurrentSong(nextFromQueue);
      if (typeof addRecentlyPlayed === 'function') addRecentlyPlayed(nextFromQueue);
      setIsPlaying(true);
      return;
    }

    const currentIndex = safeSongs.findIndex(s => s?.url === currentSong?.url);
    const nextIndex = (currentIndex + 1) % safeSongs.length;
    const nextTrack = safeSongs[nextIndex];
    if (nextTrack) {
      setCurrentSong(nextTrack);
      if (typeof addRecentlyPlayed === 'function') addRecentlyPlayed(nextTrack);
      setIsPlaying(true);
    }
  }, [songs, queue, currentSong, addRecentlyPlayed, removeFromQueue]);

  const handlePrevious = useCallback(() => {
    const safeSongs = Array.isArray(songs) ? songs : [];
    if (safeSongs.length === 0) return;
    const currentIndex = safeSongs.findIndex(s => s?.url === currentSong?.url);
    const prevIndex = (currentIndex - 1 + safeSongs.length) % safeSongs.length;
    const prevTrack = safeSongs[prevIndex];
    if (prevTrack) {
      setCurrentSong(prevTrack);
      setIsPlaying(true);
    }
  }, [songs, currentSong]);

  const handleViewChange = useCallback((viewId) => {
    if (viewId === 'nowplaying') {
      if (currentSong) setIsPlayerExpanded(true);
    } else {
      setActiveView(viewId);
    }
    setIsMobileMenuOpen(false);
  }, [currentSong]);

  const openPlaylistModal = useCallback((song) => {
    setSongToAddToPlaylist(song);
    setIsPlaylistModalOpen(true);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-black text-white relative font-sans overflow-hidden">
      <AnimatePresence>
        {!isSplashComplete && <SplashScreen onComplete={() => setIsSplashComplete(true)} />}
      </AnimatePresence>

      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,255,102,0.05)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(0,242,255,0.05)_0%,transparent_70%)]" />
      </div>

      <div className="hidden lg:block w-72 flex-shrink-0 z-20">
        <Sidebar activeTab={activeView} setActiveTab={handleViewChange} playlists={playlists} createPlaylist={createPlaylist} />
      </div>

      <main ref={mainContentRef} className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative z-10 safe-pb">
        <Navbar 
          onRefresh={refreshSongs} 
          searchQuery={searchQuery} 
          setSearchQuery={(val) => {
            setSearchQuery(val);
            if (val) setActiveView('search');
            else if (!val && activeView === 'search') setActiveView('library');
          }} 
          onCleanLibrary={runCleanup}
          onViewChange={handleViewChange}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          existingSongs={songs}
        />
        
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 mt-8 pb-40 overflow-x-hidden">
          <Suspense fallback={<SkeletonLoader />}>
            <AnimatePresence mode="wait">
              {activeView === 'playlists' ? (
                <motion.div key="playlists" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <PlaylistsPage 
                    songs={songs}
                    playlists={playlists}
                    createPlaylist={createPlaylist}
                    deletePlaylist={deletePlaylist}
                    renamePlaylist={renamePlaylist}
                    removeSongFromPlaylist={removeSongFromPlaylist}
                    onPlaySong={handlePlaySong}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                  />
                </motion.div>
              ) : activeView === 'import' ? (
                <motion.div key="import" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <BulkImportPage 
                    onRefresh={refreshSongs}
                    existingSongs={songs}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <HomePage 
                    songs={displaySongs} 
                    recentlyPlayed={recentlyPlayed}
                    isSearching={searchQuery.length > 0}
                    loading={songsLoading} 
                    error={songsError} 
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    onPlaySong={handlePlaySong} 
                    onAddToPlaylist={openPlaylistModal}
                    onAddToQueue={addToQueue}
                    title={activeView === 'search' ? 'Search Results' : activeView === 'history' ? 'Recently Played' : 'Library'}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Suspense>
        </div>
      </main>

      {/* Premium Playlist Selection Modal */}
      <AnimatePresence>
        {isPlaylistModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-md w-full glass-panel-premium p-8 lg:p-12 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black italic tracking-tighter">Save to Vault</h2>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Select target collection</p>
                </div>
                <button 
                  onClick={() => setIsPlaylistModalOpen(false)}
                  className="h-12 w-12 glass-panel-premium flex items-center justify-center hover:scale-110 active:scale-90 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                {playlists.length > 0 ? playlists.map((p) => (
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    key={p.id}
                    onClick={() => {
                      addSongToPlaylist(p.id, songToAddToPlaylist);
                      setIsPlaylistModalOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-spotify-green transition-colors">
                        <ListMusic size={24} />
                      </div>
                      <span className="font-black text-lg italic tracking-tight">{p.name}</span>
                    </div>
                    <Plus size={20} className="text-zinc-600 group-hover:text-white" />
                  </motion.button>
                )) : (
                  <div className="py-12 text-center opacity-20 flex flex-col items-center">
                    <ListMusic size={64} className="mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">No vaults found</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  const name = prompt('Vault Designation:');
                  if (name) createPlaylist(name);
                }}
                className="w-full mt-8 py-5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/5 transition-all"
              >
                Establish New Vault
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Player 
        currentSong={currentSong} 
        isPlaying={isPlaying} 
        setIsPlaying={setIsPlaying} 
        onNext={handleNext}
        onPrevious={handlePrevious}
        isExpanded={isPlayerExpanded}
        setIsExpanded={setIsPlayerExpanded}
        songs={songs}
        isShuffle={isShuffle}
        setIsShuffle={setIsShuffle}
        repeatMode={repeatMode}
        setRepeatMode={setRepeatMode}
        queue={queue}
        removeFromQueue={removeFromQueue}
        clearQueue={clearQueue}
      />

      <MobileNav 
        activeTab={activeView} 
        setActiveTab={handleViewChange} 
        currentSong={currentSong}
      />
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Suspense fallback={<div />}><LoginPage /></Suspense>} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
