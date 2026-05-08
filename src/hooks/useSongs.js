import { useState, useEffect } from 'react';
import { songService } from '../services/songService';

export const useSongs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSongs = async () => {
    try {
      console.log('useSongs: Start fetching...');
      setLoading(true);
      const data = await songService.getSongs();
      console.log(`useSongs: Fetched ${data.length} songs.`);
      setSongs(data);
      setError(null);
    } catch (err) {
      console.error('useSongs: Error in hook:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('useSongs: Fetch cycle complete.');
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  return { songs, loading, error, refreshSongs: fetchSongs };
};
