import { supabase } from '../lib/supabase';

export const songService = {
  async getSongs() {
    const { data, error } = await supabase
      .from('songs')
      .select('song_name, url');
    
    if (error) throw error;
    return data || [];
  },

  async uploadSongFile(file, songName) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('songs')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('songs')
      .getPublicUrl(filePath);

    // 3. Insert into Database
    const { data, error: insertError } = await supabase
      .from('songs')
      .insert([
        { 
          song_name: songName || file.name.replace('.mp3', ''), 
          url: publicUrl 
        }
      ])
      .select();

    if (insertError) throw insertError;
    return data[0];
  },

  async uploadSongData(songData) {
    const { data, error } = await supabase
      .from('songs')
      .insert([songData])
      .select();

    if (error) throw error;
    return data[0];
  }
};
