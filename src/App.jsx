import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Player from './components/Player';
import HomePage from './pages/HomePage';
import PlaylistsPage from './pages/PlaylistsPage';
import BulkImportPage from './pages/BulkImportPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useSongs } from './hooks/useSongs';
import { useAppCore } from './hooks/useAppCore';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, ListMusic, X, ShieldAlert, Sparkles } from 'lucide-react';

const MainApp = () => {
  const { songs, loading: songsLoading, error: songsError, refreshSongs, toggleLike, runCleanup, setSongs } = useSongs();
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

  React.useEffect(() => {
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

    if (activeView === 'liked') {
      return filtered.filter(song => song && song.liked);
    }

    return filtered;
  }, [songs, activeView, searchQuery, recentlyPlayed]);

  const handlePlaySong = (song) => {
    if (!song) return;
    if (currentSong?.url === song.url) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      if (typeof addRecentlyPlayed === 'function') addRecentlyPlayed(song);
    }
  };

  const handleNext = (nextSong) => {
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
  };

  const handlePrevious = () => {
    const safeSongs = Array.isArray(songs) ? songs : [];
    if (safeSongs.length === 0) return;
    const currentIndex = safeSongs.findIndex(s => s?.url === currentSong?.url);
    const prevIndex = (currentIndex - 1 + safeSongs.length) % safeSongs.length;
    const prevTrack = safeSongs[prevIndex];
    if (prevTrack) {
      setCurrentSong(prevTrack);
      setIsPlaying(true);
    }
  };

  const handleViewChange = (viewId) => {
    if (viewId === 'nowplaying') {
      if (currentSong) setIsPlayerExpanded(true);
    } else {
      setActiveView(viewId);
    }
    setIsMobileMenuOpen(false);
  };

  const openPlaylistModal = (song) => {
    setSongToAddToPlaylist(song);
    setIsPlaylistModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-black text-white relative font-sans overflow-hidden">
      {/* Immersive Liquid Mesh Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-liquid-mesh opacity-30 animate-liquid-slow" />
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#1DB954]/10 blur-[150px] rounded-full animate-pulse-soft" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] bg-[#1DB954]/5 blur-[120px] rounded-full animate-pulse-soft" style={{ animationDelay: '-8s' }} />
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-white/5 blur-[100px] rounded-full animate-pulse-soft" style={{ animationDelay: '-12s' }} />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Desktop Sidebar Container */}
      <div className="hidden lg:block w-[320px] flex-shrink-0 p-6 z-20">
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
      <main ref={mainContentRef} className="flex-1 h-screen overflow-y-auto scroll-smooth custom-scrollbar relative z-10 lg:mr-6 py-6 overflow-x-hidden">
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
        
        <div className="px-6 sm:px-10 mt-8 max-w-7xl mx-auto pb-48">
          <AnimatePresence mode="wait">
            {activeView === 'playlists' ? (
              <motion.div key="playlists" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ type: "spring", damping: 25, stiffness: 200 }}>
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
              <motion.div key="import" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ type: "spring", damping: 25, stiffness: 200 }}>
                <BulkImportPage 
                  onRefresh={refreshSongs}
                  existingSongs={songs}
                />
              </motion.div>
            ) : (
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
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
        </div>
      </main>

      {/* Playlist Modal - Liquid Glass Overlay */}
      <AnimatePresence>
        {isPlaylistModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPlaylistModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="max-w-md w-full glass-panel p-10 relative z-10 shadow-glass-strong border-white/10"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-3">
                   <div className="p-2 bg-spotify-green/10 rounded-lg">
                      <ListMusic size={24} className="text-spotify-green" />
                   </div>
                   <h2 className="text-2xl font-black text-white tracking-tight">Add to Playlist</h2>
                </div>
                <button onClick={() => setIsPlaylistModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-3 mb-10">
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
                      className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-[20px] transition-all duration-500 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl overflow-hidden flex items-center justify-center bg-spotify-dark border border-white/5 shadow-glass-soft">
                          <img src="/logo.png" alt="logo" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-left">
                          <p className="text-white font-black tracking-tight">{playlist.name}</p>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            {(Array.isArray(playlist.songIds) ? playlist.songIds : []).length} Tracks
                          </p>
                        </div>
                      </div>
                      <Plus size={18} className="text-zinc-500 group-hover:text-spotify-green transition-colors" strokeWidth={3} />
                    </button>
                  ))
                )}
              </div>

              <button
                onClick={() => {
                  if (typeof createPlaylist === 'function') createPlaylist('New Playlist');
                }}
                className="btn-spotify w-full py-5 text-xs font-black uppercase tracking-[0.3em]"
              >
                <Sparkles size={16} strokeWidth={3} />
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
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
