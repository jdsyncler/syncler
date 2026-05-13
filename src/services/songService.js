import { supabase } from '../lib/supabase';
import { cleanSongName } from '../lib/utils';

export const songService = {
  async getSongs() {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async bulkImportText(songs) {
    if (!Array.isArray(songs) || songs.length === 0) return [];
    const { data, error } = await supabase
      .from('songs')
      .insert(songs.map(song => ({
        song_name: cleanSongName(song.song_name),
        url: song.url
      })))
      .select();
    if (error) throw error;
    return data;
  },

  async uploadSongFile(file, songName, onProgress) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required.');

    // 1. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `songs/${fileName}`;

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('songs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;
    if (onProgress) onProgress(50);

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('songs')
      .getPublicUrl(filePath);

    if (onProgress) onProgress(80);

    // 3. Save Metadata to Database
    const payload = {
      song_name: cleanSongName(songName || file.name.replace(/\.[^/.]+$/, "")),
      url: publicUrl
    };

    const { data: insertData, error: insertError } = await supabase
      .from('songs')
      .insert([payload])
      .select();

    if (insertError) throw insertError;
    if (onProgress) onProgress(100);

    return insertData[0];
  }
};
