export type ObscurityLevel = 'hits' | 'balanced' | 'underground';

export interface Song {
  id: string;
  title: string;
  artist: string;
  videoId: string;
  thumbnail: string;
  duration: number;
  durationFormatted: string;
  aiReason?: string;
  bpm?: number;
  energy?: 'chill' | 'medium' | 'high';
  searchQuery?: string;
  alternativeVideoIds?: string[];
  isLiked?: boolean;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isBuffering: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
}

export interface MoodPreset {
  id: string;
  label: string;
  description: string;
  icon: string;
  prompt: string;
  accentColor: string;
}

export interface AiRecommendation {
  title: string;
  artist: string;
  reason: string;
  bpm?: number;
  energy?: 'chill' | 'medium' | 'high';
  subgenre?: string;
}

export interface SearchResultItem {
  videoId: string;
  title: string;
  artist: string;
  duration: number;
  durationFormatted: string;
  thumbnail: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  songs?: Song[];
}

export interface CurationSettings {
  obscurityLevel: ObscurityLevel;
  preferInstrumental: boolean;
  avoidCommercial: boolean;
}

export interface UserTasteProfile {
  likedSongs: Song[];
  favoriteArtists: string[];
  dislikedArtists: string[];
  playedHistory: string[];
  totalPlays: number;
}

export interface AuraAPI {
  searchYouTube: (query: string) => Promise<{
    videoId: string;
    title: string;
    artist: string;
    duration: number;
    durationFormatted: string;
    thumbnail: string;
    url: string;
    alternativeVideoIds?: string[];
  } | null>;
  searchMultipleYouTube: (query: string, limit?: number) => Promise<SearchResultItem[]>;
  openGoogleLogin: () => Promise<boolean>;
  toggleMiniPlayer: () => Promise<boolean>;
  isMiniPlayer: () => Promise<boolean>;
  minimizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  onAuthSuccess: (callback: () => void) => () => void;
  onMediaKey: (action: 'toggle-play' | 'next' | 'previous', callback: () => void) => () => void;
}

declare global {
  interface Window {
    auraAPI?: AuraAPI;
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}
