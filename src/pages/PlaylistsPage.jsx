import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListMusic, Plus, Trash2, Edit2, Play, Music, ChevronLeft } from 'lucide-react';
import SongListItem from '../components/SongListItem';

const PlaylistsPage = ({ songs, playlists, createPlaylist, deletePlaylist, renamePlaylist, removeSongFromPlaylist, onPlaySong, currentSong, isPlaying, onLike }) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [isRenaming, setIsRenaming] = useState(null);
  const [newName, setNewName] = useState('');

  const safePlaylists = Array.isArray(playlists) ? playlists : [];
  const safeSongs = Array.isArray(songs) ? songs : [];
  const selectedPlaylist = safePlaylists.find(p => p.id === selectedPlaylistId);
  const playlistSongs = selectedPlaylist ? safeSongs.filter(s => Array.isArray(selectedPlaylist.songIds) && selectedPlaylist.songIds.includes(s.url)) : [];

  return (
    <div className="pt-4 lg:pt-8 px-4 lg:px-8 pb-32">
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-10">
        <AnimatePresence mode="wait">
          {(!selectedPlaylistId || window.innerWidth >= 1024) ? (
            <motion.div 
              key="playlist-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`lg:grid lg:grid-cols-12 lg:gap-12 ${selectedPlaylistId ? 'hidden lg:grid' : 'block'}`}
            >
              {/* Playlists Sidebar */}
              <div className="lg:col-span-4 space-y-6 lg:space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tighter">Playlists</h2>
                  <button 
                    onClick={() => createPlaylist('New Collection')}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95"
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="space-y-2">
                  {safePlaylists.map(playlist => (
                    <motion.div
                      key={playlist.id}
                      className={`group p-3 lg:p-4 rounded-2xl cursor-pointer transition-all border active:scale-[0.98] ${
                        selectedPlaylistId === playlist.id 
                          ? 'bg-white/10 border-white/10 shadow-lg' 
                          : 'bg-transparent border-transparent hover:bg-white/5'
                      }`}
                      onClick={() => setSelectedPlaylistId(playlist.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 lg:space-x-4 truncate">
                          <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-xl bg-spotify-dark flex items-center justify-center border border-white/5 shrink-0">
                            <ListMusic size={20} lg:size={24} className={selectedPlaylistId === playlist.id ? 'text-spotify-green' : 'text-zinc-500'} />
                          </div>
                          <div className="truncate">
                            {isRenaming === playlist.id ? (
                              <input
                                autoFocus
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onBlur={() => {
                                  renamePlaylist(playlist.id, newName);
                                  setIsRenaming(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    renamePlaylist(playlist.id, newName);
                                    setIsRenaming(null);
                                  }
                                }}
                                className="bg-zinc-800 border-b-2 border-spotify-green text-white font-bold focus:outline-none text-xs lg:text-sm px-2 py-1 rounded w-full"
                              />
                            ) : (
                              <h3 className={`font-bold text-sm truncate ${selectedPlaylistId === playlist.id ? 'text-spotify-green' : 'text-white'}`}>
                                {playlist.name}
                              </h3>
                            )}
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                              {playlist.songIds?.length || 0} Tracks
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsRenaming(playlist.id);
                              setNewName(playlist.name);
                            }}
                            className="p-2 text-zinc-500 hover:text-white transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePlaylist(playlist.id);
                              if (selectedPlaylistId === playlist.id) setSelectedPlaylistId(null);
                            }}
                            className="p-2 text-zinc-500 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {safePlaylists.length === 0 && (
                    <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">No Collections</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selection Placeholder for Desktop */}
              {!selectedPlaylistId && (
                <div className="hidden lg:flex lg:col-span-8 flex-col items-center justify-center text-center p-12 glass-panel border-dashed border-white/5 min-h-[500px]">
                  <div className="h-20 w-20 bg-white/5 rounded-[32px] flex items-center justify-center mb-8 border border-white/5">
                    <ListMusic size={32} className="text-zinc-700" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Select Collection</h2>
                  <p className="text-zinc-500 font-bold text-sm mt-2 max-w-xs mx-auto">Access your curated collections or create a new one.</p>
                </div>
              )}
            </motion.div>
          ) : null}

          {/* Playlist Content View */}
          {selectedPlaylist && (
            <motion.div
              key="playlist-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`lg:col-span-8 space-y-6 lg:space-y-8 ${selectedPlaylistId ? 'block' : 'hidden lg:block'}`}
            >
              {/* Back Button for Mobile */}
              <button 
                onClick={() => setSelectedPlaylistId(null)}
                className="lg:hidden flex items-center space-x-2 text-zinc-400 font-bold text-xs uppercase tracking-widest mb-4 active:text-white"
              >
                <ChevronLeft size={16} />
                <span>Back to Collections</span>
              </button>

              {/* Hero Header */}
              <div className="relative h-48 sm:h-60 lg:h-72 rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] overflow-hidden flex items-end p-5 lg:p-12 group border border-white/5 shadow-glass-strong">
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                 <div className="absolute inset-0 bg-zinc-950" />
                 <div className="absolute top-0 right-0 w-2/3 h-full bg-spotify-green/10 blur-[80px] opacity-40" />

                 <div className="relative z-20 flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-8 w-full">
                   <div className="h-32 w-32 lg:h-48 lg:w-48 rounded-2xl lg:rounded-3xl bg-spotify-dark flex items-center justify-center shadow-2xl border border-white/5 shrink-0">
                      <ListMusic size={40} lg:size={64} className="text-spotify-green" />
                   </div>
                   <div className="flex-1 text-center md:text-left">
                     <span className="text-spotify-green text-[9px] font-black uppercase tracking-[0.3em] mb-2 block">Curated Playlist</span>
                     <h1 className="text-3xl lg:text-6xl font-black text-white tracking-tighter mb-4 lg:mb-6 leading-none">{selectedPlaylist.name}</h1>
                     <div className="flex items-center justify-center md:justify-start space-x-4 lg:space-x-6">
                       <button 
                         onClick={() => playlistSongs.length > 0 && onPlaySong(playlistSongs[0])}
                         className="btn-spotify px-8 lg:px-10 py-2.5 lg:py-3 flex items-center space-x-2 lg:space-x-3 active:scale-95"
                       >
                         <Play size={18} fill="currentColor" />
                         <span className="font-bold text-sm">Play All</span>
                       </button>
                       <p className="text-zinc-500 font-bold uppercase tracking-widest text-[9px]">
                         {playlistSongs.length} Tracks
                       </p>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Song List */}
              <div className="space-y-1">
                {playlistSongs.length > 0 ? (
                  playlistSongs.map((song, idx) => (
                    <div key={song.url} className="relative group/item">
                      <SongListItem
                        song={song}
                        index={idx}
                        isActive={currentSong?.url === song.url}
                        isPlaying={isPlaying}
                        onPlay={onPlaySong}
                        onLike={onLike}
                      />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSongFromPlaylist(selectedPlaylist.id, song.url);
                        }}
                        className="absolute right-12 lg:right-32 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover/item:opacity-100 text-zinc-500 hover:text-red-400 transition-all"
                        title="Remove from Playlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-3xl">
                    <Music size={32} className="text-zinc-800 mb-4" />
                    <h3 className="text-lg font-bold text-white tracking-tight">Empty Collection</h3>
                    <p className="text-zinc-500 text-xs mt-1 font-medium">Add tracks from your main library.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(PlaylistsPage);
