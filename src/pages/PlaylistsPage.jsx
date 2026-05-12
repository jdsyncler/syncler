import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListMusic, Plus, Trash2, Edit2, Play, Music, MoreHorizontal } from 'lucide-react';
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
    <div className="pt-8 px-4 lg:px-8 pb-32">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Playlists Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Playlists</h2>
            <button 
              onClick={() => createPlaylist('New Playlist')}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-2">
            {safePlaylists.map(playlist => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`group p-3 rounded-2xl cursor-pointer transition-all border ${
                  selectedPlaylistId === playlist.id 
                    ? 'bg-white/10 border-white/10 shadow-lg' 
                    : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
                onClick={() => setSelectedPlaylistId(playlist.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center shadow-lg border border-white/5 group-hover:border-spotify-green/30 transition-all">
                      <ListMusic size={24} className={selectedPlaylistId === playlist.id ? 'text-spotify-green' : 'text-zinc-500 group-hover:text-white'} />
                    </div>
                    <div>
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
                          className="bg-zinc-800 border-b-2 border-spotify-green text-white font-bold focus:outline-none text-sm px-2 py-1 rounded"
                        />
                      ) : (
                        <h3 className={`font-bold text-sm truncate max-w-[150px] ${selectedPlaylistId === playlist.id ? 'text-spotify-green' : 'text-white'}`}>
                          {playlist.name}
                        </h3>
                      )}
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                        {playlist.songIds.length} Tracks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRenaming(playlist.id);
                        setNewName(playlist.name);
                      }}
                      className="p-2 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlaylist(playlist.id);
                        if (selectedPlaylistId === playlist.id) setSelectedPlaylistId(null);
                      }}
                      className="p-2 hover:bg-red-500/10 rounded-full text-zinc-500 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {safePlaylists.length === 0 && (
              <div className="py-12 text-center glass-panel border-dashed border-white/10">
                <p className="text-zinc-500 text-sm">No playlists yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Playlist Content */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedPlaylist ? (
              <motion.div
                key={selectedPlaylist.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                {/* Hero Header */}
                <div className="relative h-72 rounded-[40px] overflow-hidden flex items-end p-8 lg:p-12 group">
                   {/* Backdrop */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />
                   <div className="absolute inset-0 bg-zinc-900" />
                   <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-bl from-spotify-green/20 via-transparent to-transparent blur-3xl opacity-50" />

                   <div className="relative z-20 flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8 w-full">
                     <div className="h-48 w-48 rounded-3xl bg-zinc-800 flex items-center justify-center shadow-2xl border border-white/5 shrink-0">
                        <ListMusic size={64} className="text-spotify-green" />
                     </div>
                     <div className="flex-1 text-center md:text-left">
                       <span className="text-spotify-green text-[10px] font-bold uppercase tracking-[0.3em] mb-2 block">Curated Playlist</span>
                       <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-6">{selectedPlaylist.name}</h1>
                       <div className="flex items-center justify-center md:justify-start space-x-6">
                         <button 
                           onClick={() => playlistSongs.length > 0 && onPlaySong(playlistSongs[0])}
                           className="btn-spotify px-10 py-3 flex items-center space-x-3 group"
                         >
                           <Play size={20} fill="currentColor" />
                           <span className="font-bold">Play All</span>
                         </button>
                         <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                           {playlistSongs.length} Tracks • High Fidelity
                         </p>
                       </div>
                     </div>
                   </div>
                </div>

                {/* Song List */}
                <div className="space-y-1">
                  {playlistSongs.length > 0 ? (
                    playlistSongs.map(song => (
                      <div key={song.url} className="relative group/item">
                        <SongListItem
                          song={song}
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
                          className="absolute right-32 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover/item:opacity-100 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-all"
                          title="Remove from Playlist"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="h-48 glass-panel border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8">
                      <Music size={32} className="text-zinc-700 mb-4" />
                      <h3 className="text-lg font-bold text-white">Empty Playlist</h3>
                      <p className="text-zinc-500 text-xs mt-1">Add tracks to this playlist from the home page.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-[500px] glass-panel border-dashed border-white/10 flex flex-col items-center justify-center text-center p-12">
                <div className="h-20 w-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl relative group">
                  <div className="absolute inset-0 bg-spotify-green/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <ListMusic size={32} className="text-zinc-700 relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Select a Playlist</h2>
                <p className="text-zinc-500 font-medium text-sm mt-2 max-w-xs mx-auto">Access your curated collections or create a new one to get started.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PlaylistsPage;
