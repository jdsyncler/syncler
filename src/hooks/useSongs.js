import { useState, useEffect } from 'react';
import { songService } from '../services/songService';
import { cleanSongName } from '../lib/utils';
import { supabase } from '../lib/supabase';

export const useSongs = () => {
  const [songs, setSongs] = useState(() => {
    try {
      const saved = localStorage.getItem('syncler_songs_local_state');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('CRITICAL: Songs State Corruption:', e);
      return [];
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      
      // Fetch Supabase Songs
      const data = await songService.getSongs();
      
      // Merge with liked status from localStorage
      let likedIds = [];
      try {
        const savedLiked = localStorage.getItem('syncler_liked_ids');
        likedIds = savedLiked ? JSON.parse(savedLiked) : [];
        if (!Array.isArray(likedIds)) likedIds = [];
      } catch (e) {
        console.error('Liked IDs Parse Error:', e);
        likedIds = [];
      }

      // Deep Repair: Safe mapping with defaults and corrupted track removal
      const rawData = Array.isArray(data) ? data : [];
      const songsWithLikes = rawData.map((song, index) => {
        if (!song) return null;
        
        // Support both old and new schema fields if they exist, but map to standard
        const cleanTitle = song.song_name || song.title || "Unknown Track";
        const cleanUrl = song.url || song.song_url || "";

        // Corrupted Song Filter: Must have a URL
        if (!cleanUrl) {
          console.warn(`[SYNCLER] Purging Corrupted Track at index: ${index}`);
          return null;
        }

        return {
          song_name: cleanTitle,
          url: cleanUrl,
          liked: Array.isArray(likedIds) && likedIds.includes(cleanUrl)
        };
      }).filter(Boolean); // Remove null/corrupted entries

      setSongs(songsWithLikes);
      
      try {
        localStorage.setItem('syncler_songs_local_state', JSON.stringify(songsWithLikes));
      } catch (e) {
        console.error('Failed to cache library state:', e);
      }
      
      setError(null);
    } catch (err) {
      setError(err?.message || 'Connection Interrupted');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const toggleLike = (url) => {
    let likedUrls = [];
    try {
      likedUrls = JSON.parse(localStorage.getItem('syncler_liked_ids') || '[]');
    } catch (e) {
      console.error('Liked IDs Parse Error in toggle:', e);
    }
    
    let newLikedUrls;
    if (likedUrls.includes(url)) {
      newLikedUrls = likedUrls.filter(lurl => lurl !== url);
    } else {
      newLikedUrls = [...likedUrls, url];
    }
    localStorage.setItem('syncler_liked_ids', JSON.stringify(newLikedUrls));
    
    setSongs(prev => prev.map(song => 
      song.url === url ? { ...song, liked: !song.liked } : song
    ));
  };

  const runCleanup = async () => {
    setLoading(true);
    try {
      console.log('[SYNCLER] Starting Database Cleanup Migration...');
      
      // 1. Clean Supabase Database
      const { data: cloudSongs, error: fetchError } = await supabase.from('songs').select('*');
      if (fetchError) throw fetchError;

      const cloudUpdates = [];
      for (const song of cloudSongs) {
        const cleanedName = cleanSongName(song.song_name);
        if (cleanedName && cleanedName !== song.song_name) {
          console.log(`[SYNCLER] Cleaning Cloud: "${song.song_name}" -> "${cleanedName}"`);
          cloudUpdates.push({ id: song.id, song_name: cleanedName, url: song.url });
        }
      }

      if (cloudUpdates.length > 0) {
        console.log(`[SYNCLER] Pushing ${cloudUpdates.length} updates to Supabase...`);
        const { error: upsertError } = await supabase.from('songs').upsert(cloudUpdates);
        if (upsertError) throw upsertError;
      }

      console.log(`[SYNCLER] Cleanup Complete. Cloud updated: ${cloudUpdates.length}`);
      
      // 2. Refresh App State
      await fetchSongs();
      
    } catch (err) {
      console.error('[SYNCLER] Cleanup Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return { songs, loading, error, refreshSongs: fetchSongs, toggleLike, runCleanup, setSongs };
};
