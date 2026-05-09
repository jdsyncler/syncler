import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Player from './components/Player';
import HomePage from './pages/HomePage';
import { useSongs } from './hooks/useSongs';

const App = () => {
  const { songs, loading: songsLoading, error: songsError, refreshSongs } = useSongs();
  const [activeTab, setActiveTab] = useState('home');
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSongs = songs.filter(song => 
    song.song_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlaySong = (song) => {
    if (currentSong?.url === song.url) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.url === currentSong?.url);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.url === currentSong?.url);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
    setIsPlaying(true);
  };

  return (
    <div className="flex min-h-screen bg-black text-white relative custom-cursor font-sans">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-green-900/5 blur-[120px] pointer-events-none" />

      {/* Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto scroll-smooth custom-scrollbar relative">
        <Navbar onRefresh={refreshSongs} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <div className="relative z-10">
          {activeTab === 'home' ? (
            <HomePage 
              songs={filteredSongs} 
              isSearching={searchQuery.length > 0}
              loading={songsLoading} 
              error={songsError} 
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong} 
            />
          ) : (
            <div className="h-[calc(100vh-120px)] flex items-center justify-center">
              <div className="text-center glass p-12 rounded-[48px] border border-white/5 max-w-lg w-full mx-4">
                <h2 className="text-4xl font-black mb-3 uppercase tracking-tighter text-gradient">SYNC: {activeTab}</h2>
                <p className="text-zinc-500 font-bold tracking-wide">INITIALIZING COMPONENT MODULE...</p>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="mt-10 px-10 py-4 bg-primary text-black font-black rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-primary/20 uppercase tracking-widest text-sm"
                >
                  Return to Base
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Player */}
      <Player 
        currentSong={currentSong} 
        isPlaying={isPlaying} 
        setIsPlaying={setIsPlaying} 
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
};

export default App;
