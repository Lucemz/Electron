import { Song, AiRecommendation } from '../types';
import { cleanSongTitle, cleanArtistName } from '../utils/textCleaner';

/**
 * Resolves an AI recommendation into a clean, playable single Song with a YouTube videoId
 */
export async function resolveSongFromYouTube(rec: AiRecommendation): Promise<Song> {
  // Append "audio" to bias YouTube towards single studio audio tracks instead of full concerts or mixes
  const searchQuery = `${rec.artist} - ${rec.title} audio`;

  // 1. If running inside Electron, use the native yt-search IPC bridge
  if (window.auraAPI?.searchYouTube) {
    try {
      const result = await window.auraAPI.searchYouTube(searchQuery);
      if (result) {
        const cleanedTitle = cleanSongTitle(result.title, result.artist) || rec.title;
        const cleanedArtist = cleanArtistName(result.artist, result.title) || rec.artist;

        return {
          id: `${result.videoId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: cleanedTitle,
          artist: cleanedArtist,
          videoId: result.videoId,
          thumbnail: result.thumbnail || `https://img.youtube.com/vi/${result.videoId}/hqdefault.jpg`,
          duration: result.duration || 180,
          durationFormatted: result.durationFormatted || '3:00',
          aiReason: rec.reason,
          bpm: rec.bpm,
          energy: rec.energy,
          searchQuery,
          alternativeVideoIds: result.alternativeVideoIds || [],
        };
      }
    } catch (err) {
      console.warn('IPC search failed, falling back:', err);
    }
  }

  // 2. Fallback for pure browser mode or if IPC failed
  const fallbackVideoId = getFallbackVideoId(rec.artist, rec.title);
  return {
    id: `${fallbackVideoId}-${Date.now()}`,
    title: rec.title,
    artist: rec.artist,
    videoId: fallbackVideoId,
    thumbnail: `https://img.youtube.com/vi/${fallbackVideoId}/hqdefault.jpg`,
    duration: 210,
    durationFormatted: '3:30',
    aiReason: rec.reason,
    bpm: rec.bpm,
    energy: rec.energy,
    searchQuery,
    alternativeVideoIds: ['dFmpTLV-qDw', '8GW6sLrK40k'],
  };
}

function getFallbackVideoId(artist: string, title: string): string {
  const q = `${artist} ${title}`.toLowerCase();
  if (q.includes('ayacucho') || q.includes('huayno')) return 'dFmpTLV-qDw';
  if (q.includes('daft punk') || q.includes('lucky')) return '5NV6Rdv1a3w';
  if (q.includes('resonance') || q.includes('home')) return '8GW6sLrK40k';
  if (q.includes('starboy') || q.includes('weeknd')) return '34Na4j8AVgA';
  if (q.includes('turbo') || q.includes('brut')) return 'wy9r2qeouiQ';
  if (q.includes('midnight city') || q.includes('m83')) return 'dX3k_QDnzHE';

  return 'dFmpTLV-qDw';
}
