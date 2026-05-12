export const cleanSongName = (filename) => {
  if (!filename) return '';
  let cleanName = filename;

  // 1. Remove .mp3 extension
  cleanName = cleanName.replace(/\.mp3$/i, '');

  // 2. Remove specific unwanted domains and tags (case-insensitive)
  const unwantedPatterns = [
    /masstamilan\.dev/gi,
    /masstamilan\.org/gi,
    /masstamilan\.com/gi,
    /masstamilan/gi,
    /www\./gi
  ];

  unwantedPatterns.forEach(pattern => {
    cleanName = cleanName.replace(pattern, '');
  });

  // 3. Remove brackets and their contents (e.g., [MassTamilan], [])
  cleanName = cleanName.replace(/\[.*?\]/g, '');

  // 4. Replace underscores with spaces
  cleanName = cleanName.replace(/_/g, ' ');

  // 5. Clean up hyphens
  cleanName = cleanName.replace(/-+/g, '-'); // Collapse multiple hyphens
  
  // 6. Clean up trailing/leading hyphens and spaces
  cleanName = cleanName.replace(/^[- ]+|[- ]+$/g, '');

  // 7. Collapse multiple spaces into a single space
  cleanName = cleanName.replace(/\s+/g, ' ');

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
