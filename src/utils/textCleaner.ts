/**
 * Cleans YouTube video titles to remove cluttered tags, genre shouting, and upload junk.
 * Example: "YENNIFER SERMEÑO - Flor de Retama - CANCION AYACUCHANA (Video Oficial)" -> "Flor de Retama"
 */
export function cleanSongTitle(rawTitle: string, artistName?: string): string {
  if (!rawTitle) return '';

  let title = rawTitle;

  // 1. Remove bracketed/parenthetical metadata: (Official Video), [HD], (4K), (En Vivo), etc.
  title = title.replace(/\(.*?\)/g, ' ');
  title = title.replace(/\[.*?\]/g, ' ');

  // 2. Remove common YouTube shouting and clutter tags
  const JUNK_PATTERNS = [
    /\b(cancion ayacuchana|canción ayacuchana|huayno ayacuchano|musica andina|carnaval ayacuchano)\b/gi,
    /\b(video oficial|audio oficial|official video|official audio|video clip oficial|videoclip oficial)\b/gi,
    /\b(dvd en tiempo real|en vivo|live session|concierto en vivo|en directo)\b/gi,
    /\b(letra|lyrics|subtitulado|sub español|sub ingles)\b/gi,
    /\b(remastered|remasterizado|4k|hd|1080p|hq)\b/gi,
    /\b(tema musical|full hd)\b/gi,
  ];

  for (const pattern of JUNK_PATTERNS) {
    title = title.replace(pattern, ' ');
  }

  // 3. If title is formatted as "Artist - Song", separate them cleanly
  if (title.includes(' - ')) {
    const parts = title.split(' - ');
    if (parts.length >= 2) {
      // If artist matches the first part, use the second part as title
      const firstPart = parts[0].trim().toLowerCase();
      const secondPart = parts.slice(1).join(' - ').trim();

      if (artistName && firstPart.includes(artistName.toLowerCase())) {
        title = secondPart;
      } else if (secondPart.length > 2) {
        title = secondPart;
      }
    }
  }

  // 4. Remove trailing pipes, dashes, and duplicate spaces
  title = title.replace(/[|•–—_]/g, ' ');
  title = title.replace(/\s+/g, ' ').trim();

  // If over-cleaned, fallback to first 60 chars of raw title
  if (title.length < 2) {
    title = rawTitle.replace(/\(.*?\)/g, '').trim();
  }

  return title;
}

/**
 * Cleans artist names from channel names
 * Example: "Dolly JR Producciones" -> "Trío Ayacucho" (if in title) or clean name
 */
export function cleanArtistName(rawArtist: string, rawTitle?: string): string {
  if (!rawArtist) return 'Artista';

  let artist = rawArtist.replace(/\s*-\s*Topic$/i, '').trim();
  artist = artist.replace(/\s*(Official|Oficial|Producciones|Vevo|Records|Music)$/i, '').trim();

  // If channel is a production label and title has "Artist - Song", extract the real artist
  if (rawTitle && rawTitle.includes(' - ')) {
    const firstPart = rawTitle.split(' - ')[0].trim();
    if (firstPart.length > 2 && firstPart.length < 35 && !firstPart.toLowerCase().includes('mix')) {
      return firstPart;
    }
  }

  return artist || rawArtist;
}

/**
 * Normalizes a title or artist string for fuzzy comparison:
 * - strips accents, lowercases
 * - removes common clutter (ft, feat, remix, official, audio, video, etc.)
 * - strips punctuation
 */
export function normalizeSongToken(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(feat|ft|remix|mix|official|audio|video|lyrics|letra|cover|en vivo|live|version|versión)\b/gi, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns true if two songs are the same track (even by different uploaders or with minor title differences)
 */
export function isSameOrSimilarSong(
  songA: { title: string; artist?: string; videoId?: string },
  songB: { title: string; artist?: string; videoId?: string }
): boolean {
  if (!songA || !songB) return false;

  // 1. Exact Video ID match
  if (songA.videoId && songB.videoId && songA.videoId === songB.videoId) {
    return true;
  }

  const normA = normalizeSongToken(songA.title);
  const normB = normalizeSongToken(songB.title);
  if (!normA || !normB) return false;

  // 2. Exact normalized title match
  if (normA === normB) return true;

  // 3. Substring inclusion if length is meaningful
  if (normA.length >= 4 && normB.length >= 4) {
    if (normA.includes(normB) || normB.includes(normA)) {
      return true;
    }
  }

  // 4. Word-level overlap (Jaccard similarity on tokens >= 3 chars)
  const wordsA = new Set(normA.split(' ').filter((w) => w.length >= 3));
  const wordsB = new Set(normB.split(' ').filter((w) => w.length >= 3));
  if (wordsA.size === 0 || wordsB.size === 0) return false;

  let common = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) common++;
  }
  const minLen = Math.min(wordsA.size, wordsB.size);
  if (common / minLen >= 0.7) {
    return true;
  }

  return false;
}
