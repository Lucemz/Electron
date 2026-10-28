import { Song, UserTasteProfile, CurationSettings, ObscurityLevel } from '../types';

const STORAGE_KEY_TASTE = 'aura_user_taste_profile';
const STORAGE_KEY_SETTINGS = 'aura_curation_settings';

export function getUserTasteProfile(): UserTasteProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASTE);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return {
    likedSongs: [],
    favoriteArtists: [],
    dislikedArtists: [],
    playedHistory: [],
    totalPlays: 0,
  };
}

export function saveUserTasteProfile(profile: UserTasteProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_TASTE, JSON.stringify(profile));
  } catch (e) {}
}

export function toggleLikeSong(song: Song): { profile: UserTasteProfile; isLiked: boolean } {
  const profile = getUserTasteProfile();
  const index = profile.likedSongs.findIndex((s) => s.videoId === song.videoId || s.title === song.title);
  let isLiked = false;

  if (index >= 0) {
    profile.likedSongs.splice(index, 1);
    isLiked = false;
  } else {
    profile.likedSongs.push(song);
    isLiked = true;
    if (song.artist && !profile.favoriteArtists.includes(song.artist)) {
      profile.favoriteArtists.push(song.artist);
    }
  }

  saveUserTasteProfile(profile);
  return { profile, isLiked };
}

export function recordPlayedSong(song: Song): void {
  const profile = getUserTasteProfile();
  const tag = `${song.artist} - ${song.title}`;
  if (!profile.playedHistory.includes(tag)) {
    profile.playedHistory.push(tag);
    if (profile.playedHistory.length > 50) profile.playedHistory.shift();
  }
  profile.totalPlays = (profile.totalPlays || 0) + 1;
  saveUserTasteProfile(profile);
}

export function recordDislikedSong(song: Song): void {
  const profile = getUserTasteProfile();
  if (song.artist && !profile.dislikedArtists.includes(song.artist)) {
    profile.dislikedArtists.push(song.artist);
  }
  saveUserTasteProfile(profile);
}

export function getCurationSettings(): CurationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return {
    obscurityLevel: 'balanced',
    preferInstrumental: false,
    avoidCommercial: false,
  };
}

export function saveCurationSettings(settings: CurationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {}
}

/**
 * Generates rich context string describing the user's taste to inject into the LLM
 */
export function getTasteContextForPrompt(settings?: CurationSettings): string {
  const profile = getUserTasteProfile();
  const curSettings = settings || getCurationSettings();

  const favs = profile.favoriteArtists.slice(0, 8).join(', ');
  const liked = profile.likedSongs.slice(-6).map((s) => `"${s.title}" de ${s.artist}`).join(', ');
  const dislikes = profile.dislikedArtists.slice(0, 5).join(', ');

  let obscurityDirective = '';
  if (curSettings.obscurityLevel === 'underground') {
    obscurityDirective = 'ENFOQUE: UNDERGROUND / JOYAS OCULTAS. Prohibido recomendar los éxitos virales o top 20 más comerciales. Busca deep cuts, grabaciones de culto, artistas de nicho respetados y temas caletas de alta fidelidad musical.';
  } else if (curSettings.obscurityLevel === 'hits') {
    obscurityDirective = 'ENFOQUE: ÉXITOS / CLÁSICOS. Recomienda las canciones cumbre, himnos indiscutibles y temas más representativos y pulidos del estilo.';
  } else {
    obscurityDirective = 'ENFOQUE: BALANCEADO. Mezcla 1 o 2 temas de alta resonancia con 2 joyas ocultas de gran calibre musical.';
  }

  return `
PERFIL DEL OYENTE:
${favs ? `- Artistas favoritos que ama: ${favs}` : '- Nuevo oyente en descubrimiento.'}
${liked ? `- Canciones que le han encantado recientemente: ${liked}` : ''}
${dislikes ? `- Artistas/estilos que prefiere evitar: ${dislikes}` : ''}
${curSettings.preferInstrumental ? '- PREFERENCIA: Priorizar versiones instrumentales sin voces distractivas.' : ''}
${obscurityDirective}
`.trim();
}
