import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify authentication via Supabase token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized — no token provided' });
  }

  const token = authHeader.replace('Bearer ', '');

  // Verify the JWT with Supabase
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return res.status(401).json({ error: 'Unauthorized — invalid session' });
  }

  // Verify single-user access — hardcoded for private use
  const allowedEmail = process.env.ALLOWED_EMAIL || "jd.syncler@gmail.com";
  if (user.email !== allowedEmail) {
    return res.status(403).json({ error: 'Forbidden — access denied' });
  }

  // Get upload parameters from request body
  const { file, fileName, songName } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'No file data provided' });
  }

  try {
    // Upload to Cloudinary using server-side credentials
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`;

    const formData = new URLSearchParams();
    formData.append('file', file);
    formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'syncler_music_upload');
    formData.append('folder', 'songs');
    formData.append('api_key', process.env.CLOUDINARY_API_KEY);

    // Generate signature for signed upload if secret is available
    if (process.env.CLOUDINARY_API_SECRET) {
      const timestamp = Math.round(Date.now() / 1000);
      const crypto = await import('crypto');
      const paramsToSign = `folder=songs&timestamp=${timestamp}`;
      const signature = crypto
        .createHash('sha256')
        .update(paramsToSign + process.env.CLOUDINARY_API_SECRET)
        .digest('hex');

      formData.set('timestamp', timestamp.toString());
      formData.set('signature', signature);
      // Remove upload_preset for signed uploads
      formData.delete('upload_preset');
    }

    const cloudinaryResponse = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
    });

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text();
      console.error('Cloudinary Error:', errorText);
      return res.status(500).json({ error: 'Failed to upload to cloud storage' });
    }

    const cloudinaryData = await cloudinaryResponse.json();
    const publicUrl = cloudinaryData.secure_url;

    // Insert into Supabase using the user's token for RLS
    const userSupabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const payload = {
      song_name: songName || fileName || 'Untitled',
      url: publicUrl,
    };

    const { data: insertedSong, error: insertError } = await userSupabase
      .from('songs')
      .insert([payload])
      .select();

    if (insertError) {
      console.error('Database Insert Error:', insertError);
      return res.status(500).json({ error: 'Failed to save to database' });
    }

    return res.status(200).json({ 
      success: true, 
      song: insertedSong[0],
      url: publicUrl 
    });

  } catch (err) {
    console.error('Upload API Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
