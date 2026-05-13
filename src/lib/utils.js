export const cleanSongName = (filename) => {
  if (!filename) return '';
  let cleanName = filename;

  // 1. Remove file extensions (mp3, wav, flac, m4a, etc.)
  cleanName = cleanName.replace(/\.(mp3|wav|flac|m4a|ogg|aac)$/i, '');

  // 2. Remove specific unwanted patterns (case-insensitive)
  const unwantedPatterns = [
    /masstamilan\.(dev|fm|org|com|net|in|info|me|tv|asia)/gi,
    /masstamilan/gi,
    // URLs and common website patterns
    /https?:\/\/[^\s]+/gi,
    /www\.[a-z0-9-]+\.[a-z.]{2,}/gi,
    /[a-z0-9-]+\.(com|net|org|dev|fm|in|info|me|tv|asia)/gi,
    // Specific extensions mentioned by user that might remain
    /\.(org|dev|fm)$/gi,
    /\[.*?\]/g, // bracketed text like [MassTamilan]
  ];

  unwantedPatterns.forEach(pattern => {
    cleanName = cleanName.replace(pattern, '');
  });

  // 3. Replace hyphens and underscores with spaces
  cleanName = cleanName.replace(/[-_]/g, ' ');

  // 4. Collapse multiple spaces into a single space
  cleanName = cleanName.replace(/\s+/g, ' ');

  // 5. Final trim and cleanup of any lingering artifacts
  return cleanName.trim();
};

export const isDuplicateSong = (url, name, existingSongs = []) => {
  if (!existingSongs.length) return false;
  
  const cleanTargetName = name ? cleanSongName(name).toLowerCase() : '';
  
  return existingSongs.some(song => {
    // Check URL Match
    if (url && song.url === url) return true;
    
    // Check Cleaned Name Match (Case Insensitive)
    if (cleanTargetName && song.song_name) {
      if (cleanSongName(song.song_name).toLowerCase() === cleanTargetName) {
        return true;
      }
    }
    
    return false;
  });
};
