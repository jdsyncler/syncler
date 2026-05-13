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
      
      // Deep Repair: Safe mapping with defaults and corrupted track removal
      const rawData = Array.isArray(data) ? data : [];
      const sanitizedSongs = rawData.map((song, index) => {
        if (!song) return null;
        
        // Support both old and new schema fields if they exist, but map to standard
        const cleanTitle = cleanSongName(song.song_name || song.title || "Unknown Track");
        const cleanUrl = song.url || song.song_url || "";

        // Corrupted Song Filter: Must have a URL
        if (!cleanUrl) {
          console.warn(`[SYNCLER] Purging Corrupted Track at index: ${index}`);
          return null;
        }

        return {
          song_name: cleanTitle,
          url: cleanUrl
        };
      }).filter(Boolean); // Remove null/corrupted entries

      setSongs(sanitizedSongs);
      
      try {
        localStorage.setItem('syncler_songs_local_state', JSON.stringify(sanitizedSongs));
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

    // Set up Realtime Subscription for library updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'songs'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setSongs(prev => prev.map(song => {
              if (song.url === payload.new.url) {
                return {
                  ...song,
                  song_name: cleanSongName(payload.new.song_name)
                };
              }
              return song;
            }));
          } else if (payload.eventType === 'INSERT') {
            const newSong = {
              song_name: cleanSongName(payload.new.song_name),
              url: payload.new.url
            };
            setSongs(prev => [newSong, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setSongs(prev => prev.filter(song => song.url !== payload.old.url));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  return { songs, loading, error, refreshSongs: fetchSongs, runCleanup, setSongs };
};
