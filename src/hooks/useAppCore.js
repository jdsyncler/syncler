import { useState, useEffect, useRef } from 'react';

export const useAppCore = (songs, isPlaying, setIsPlaying) => {
  // --- PLAYLISTS ---
  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('syncler_playlists');
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) return parsed;
      return [
        { id: 'fav', name: 'My Favorites', songIds: [], color: '#22c55e' }
      ];
    } catch (e) {
      console.error('Playlist Parse Error:', e);
      return [{ id: 'fav', name: 'My Favorites', songIds: [], color: '#22c55e' }];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('syncler_playlists', JSON.stringify(playlists));
    } catch (e) {
      console.error('Playlist Save Error:', e);
    }
  }, [playlists]);

  const createPlaylist = (name) => {
    const newPlaylist = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || 'New Playlist',
      songIds: [],
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  const deletePlaylist = (id) => {
    setPlaylists(playlists.filter(p => p.id !== id));
  };

  const renamePlaylist = (id, newName) => {
    setPlaylists(playlists.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const addSongToPlaylist = (playlistId, songId) => {
    setPlaylists(playlists.map(p => {
      if (p.id === playlistId && !p.songIds.includes(songId)) {
        return { ...p, songIds: [...p.songIds, songId] };
      }
      return p;
    }));
  };

  const removeSongFromPlaylist = (playlistId, songId) => {
    setPlaylists(playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, songIds: p.songIds.filter(id => id !== songId) };
      }
      return p;
    }));
  };

  // --- MODULES ---
  const [activeModules, setActiveModules] = useState(() => {
    try {
      const saved = localStorage.getItem('syncler_active_modules');
      return saved ? JSON.parse(saved) : {
        bassBoost: false,
        surroundMode: false,
        vocalBoost: false,
        nightMode: false,
        chillMode: false,
        workoutMode: false,
        focusMode: false,
        visualizer: false,
        volumeBoost: false
      };
    } catch (e) {
      console.error('Modules Parse Error:', e);
      return {
        bassBoost: false,
        surroundMode: false,
        vocalBoost: false,
        nightMode: false,
        chillMode: false,
        workoutMode: false,
        focusMode: false,
        visualizer: false,
        volumeBoost: false
      };
    }
  });

  useEffect(() => {
    localStorage.setItem('syncler_active_modules', JSON.stringify(activeModules));
  }, [activeModules]);

  const toggleModule = (moduleId) => {
    setActiveModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  // --- SLEEP TIMER ---
  const [sleepTimer, setSleepTimer] = useState(null); // minutes
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const timerRef = useRef(null);

  useEffect(() => {
    if (sleepTimer) {
      setTimeLeft(sleepTimer * 60);
    } else {
      setTimeLeft(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [sleepTimer]);

  useEffect(() => {
    if (timeLeft > 0 && isPlaying) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              setIsPlaying(false);
              setSleepTimer(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, isPlaying, setIsPlaying]);

  // --- PLAYBACK MODES ---
  const [isShuffle, setIsShuffle] = useState(() => {
    try {
      return localStorage.getItem('syncler_shuffle') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [repeatMode, setRepeatMode] = useState(() => {
    try {
      return localStorage.getItem('syncler_repeat') || 'none';
    } catch (e) {
      return 'none';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('syncler_shuffle', isShuffle);
    } catch (e) {
      console.error('Shuffle State Save Error:', e);
    }
  }, [isShuffle]);

  useEffect(() => {
    try {
      localStorage.setItem('syncler_repeat', repeatMode);
    } catch (e) {
      console.error('Repeat State Save Error:', e);
    }
  }, [repeatMode]);

  // --- QUEUE SYSTEM ---
  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('syncler_queue');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Queue State Corruption:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('syncler_queue', JSON.stringify(Array.isArray(queue) ? queue : []));
    } catch (e) {
      console.error('Queue Save Error:', e);
    }
  }, [queue]);

  const addToQueue = (song) => {
    if (!song || !song.url) {
      console.warn('[SYNCLER] Blocked malformed track add to queue');
      return;
    }
    setQueue(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      // Prevent consecutive identical queue adds
      if (safePrev.length > 0 && safePrev[safePrev.length - 1]?.url === song.url) return safePrev;
      return [...safePrev, song];
    });
  };

  const removeFromQueue = (index) => {
    setQueue(prev => (Array.isArray(prev) ? prev.filter((_, i) => i !== index) : []));
  };

  const reorderQueue = (startIndex, endIndex) => {
    setQueue(prev => {
      if (!Array.isArray(prev)) return [];
      const result = Array.from(prev);
      if (startIndex < 0 || startIndex >= result.length) return result;
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const clearQueue = () => setQueue([]);

  // --- RECENTLY PLAYED ---
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      const saved = localStorage.getItem('syncler_history');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('History State Corruption:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('syncler_history', JSON.stringify(Array.isArray(recentlyPlayed) ? recentlyPlayed : []));
    } catch (e) {
      console.error('History Save Error:', e);
    }
  }, [recentlyPlayed]);

  const addRecentlyPlayed = (song) => {
    if (!song || !song.url) return;
    setRecentlyPlayed(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      // Remove if it exists to bring it to top, cap at 50
      const filtered = safePrev.filter(s => s && s.url !== song.url);
      return [{ ...song, playedAt: Date.now() }, ...filtered].slice(0, 50);
    });
  };

  return {
    playlists: Array.isArray(playlists) ? playlists : [],
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    activeModules: activeModules || {},
    toggleModule,
    sleepTimer,
    setSleepTimer,
    timeLeft,
    isShuffle: !!isShuffle,
    setIsShuffle,
    repeatMode: repeatMode || 'none',
    setRepeatMode,
    queue: Array.isArray(queue) ? queue : [],
    setQueue,
    addToQueue,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    recentlyPlayed: Array.isArray(recentlyPlayed) ? recentlyPlayed : [],
    addRecentlyPlayed
  };
};
