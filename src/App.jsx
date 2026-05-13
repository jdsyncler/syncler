import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
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
import { Plus, ListMusic, X, Sparkles, Loader2 } from 'lucide-react';

// Lazy Load Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const PlaylistsPage = lazy(() => import('./pages/PlaylistsPage'));
const BulkImportPage = lazy(() => import('./pages/BulkImportPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
    <Loader2 size={40} className="text-spotify-green animate-spin" />
    <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Initializing System...</p>
  </div>
);

const MainApp = () => {
  const { songs, loading: songsLoading, error: songsError, refreshSongs, toggleLike, runCleanup } = useSongs();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeView, setActiveView] = useState('library');
  const [currentSong, setCurrentSong] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  React.useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
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

    if (activeView === 'liked') {
      return filtered.filter(song => song && song.liked);
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
    <div className="flex h-[100dvh] bg-black text-white relative font-sans overflow-hidden">
      {/* Immersive Liquid Mesh Background - Optimized for performance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-black">
        <div className="absolute inset-0 bg-liquid-mesh opacity-20" />
        <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-[#1DB954]/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#1DB954]/5 blur-[100px] rounded-full" />
      </div>

      {/* Desktop Sidebar Container */}
      <div className="hidden lg:block w-[300px] flex-shrink-0 p-6 z-20">
        <Sidebar activeTab={activeView} setActiveTab={handleViewChange} playlists={playlists} createPlaylist={createPlaylist} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <Sidebar 
            activeTab={activeView} 
            setActiveTab={handleViewChange} 
            isMobile={true} 
            onClose={() => setIsMobileMenuOpen(false)} 
            playlists={playlists}
            createPlaylist={createPlaylist}
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main ref={mainContentRef} className="flex-1 h-full overflow-y-auto scroll-smooth custom-scrollbar relative z-10 lg:mr-6 lg:py-6 overflow-x-hidden safe-pb">
        <Navbar 
          onRefresh={refreshSongs} 
          searchQuery={searchQuery} 
          setSearchQuery={(val) => {
            setSearchQuery(val);
            if (val && activeView !== 'liked') setActiveView('search');
            else if (!val && activeView === 'search') setActiveView('library');
          }} 
          onCleanLibrary={runCleanup}
          onViewChange={handleViewChange}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          existingSongs={songs}
        />
        
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-10 mt-4 lg:mt-8 pb-44 lg:pb-48 overflow-x-hidden">
          <Suspense fallback={<LoadingFallback />}>
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
                    onLike={toggleLike}
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
                    isSearching={searchQuery.length > 0}
                    loading={songsLoading} 
                    error={songsError} 
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    onPlaySong={handlePlaySong} 
                    onLike={toggleLike}
                    onAddToPlaylist={openPlaylistModal}
                    onAddToQueue={addToQueue}
                    title={activeView === 'liked' ? 'Liked Tracks' : activeView === 'search' ? 'Search Results' : activeView === 'history' ? 'Recently Played' : 'Your Library'}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Suspense>
        </div>
      </main>

      {/* Playlist Modal - Liquid Glass Overlay */}
      <AnimatePresence>
        {isPlaylistModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPlaylistModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="max-w-md w-full glass-panel p-6 sm:p-10 relative z-10 shadow-glass-strong border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                   <div className="p-2 bg-spotify-green/10 rounded-lg">
                      <ListMusic size={24} className="text-spotify-green" />
                   </div>
                   <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Add to Playlist</h2>
                </div>
                <button onClick={() => setIsPlaylistModalOpen(false)} className="p-2 hover:bg-white/10 rounded-2xl transition-all">
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1 mb-8">
                {(Array.isArray(playlists) ? playlists : []).length === 0 ? (
                  <div className="py-12 text-center glass-panel border-dashed border-white/5">
                     <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">No playlists available</p>
                  </div>
                ) : (
                  (Array.isArray(playlists) ? playlists : []).map(playlist => (
                    <button
                      key={playlist.id}
                      onClick={() => {
                        if (typeof addSongToPlaylist === 'function' && songToAddToPlaylist) {
                          addSongToPlaylist(playlist.id, songToAddToPlaylist.url);
                          setIsPlaylistModalOpen(false);
                        }
                      }}
                      className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-[20px] transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center bg-spotify-dark border border-white/5 shadow-glass-soft">
                          <img src="/logo.png" alt="logo" className="w-full h-full object-cover opacity-60" />
                        </div>
                        <div className="text-left">
                          <p className="text-white font-bold tracking-tight text-sm">{playlist.name}</p>
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                            {(Array.isArray(playlist.songIds) ? playlist.songIds : []).length} Tracks
                          </p>
                        </div>
                      </div>
                      <Plus size={16} className="text-zinc-500 group-hover:text-spotify-green transition-colors" strokeWidth={3} />
                    </button>
                  ))
                )}
              </div>

              <button
                onClick={() => {
                  if (typeof createPlaylist === 'function') createPlaylist('New Playlist');
                }}
                className="btn-spotify w-full py-4 text-[10px] font-black uppercase tracking-[0.2em]"
              >
                <Sparkles size={14} strokeWidth={3} />
                <span className="ml-2">Create New Instance</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Immersive Player Dock */}
      <Player 
        currentSong={currentSong} 
        isPlaying={isPlaying} 
        setIsPlaying={setIsPlaying} 
        onNext={handleNext}
        onPrevious={handlePrevious}
        onLike={toggleLike}
        isLiked={currentSong && Array.isArray(songs) ? songs.find(s => s.url === currentSong.url)?.liked : false}
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
        <Route path="/login" element={<Suspense fallback={<LoadingFallback />}><LoginPage /></Suspense>} />
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
