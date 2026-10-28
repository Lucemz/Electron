import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Song, PlaybackState, ChatMessage, CurationSettings } from './types';
import {
  getAiCuratedPlaylist,
  getSmartSkipRecommendations,
  chatWithAiDj,
  getSimilarSongsForTrack,
} from './services/aiDjService';
import { resolveSongFromYouTube } from './services/youtubeService';
import {
  getUserTasteProfile,
  toggleLikeSong,
  recordPlayedSong,
  getCurationSettings,
  saveCurationSettings,
} from './services/tasteProfileService';
import { YouTubeAudioPlayer } from './components/YouTubeAudioPlayer';
import { PromptBar } from './components/PromptBar';
import { NowPlayingView } from './components/NowPlayingView';
import { QueueList } from './components/QueueList';
import { PlayerControls } from './components/PlayerControls';
import { MiniPlayerView } from './components/MiniPlayerView';
import { SettingsModal } from './components/SettingsModal';
import { AiDjChatSidebar } from './components/AiDjChatSidebar';
import { Sparkles, Radio, MessageSquare } from 'lucide-react';

const STORAGE_LAST_PLAYED = 'aura_last_played_song';
const SILENT_AUDIO_URI = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAACAgICA';

const RANDOM_STARTERS = [
  'Coldplay - Yellow',
  'Bad Bunny - DÁKITI',
  'Daft Punk - Get Lucky',
  'HOME - Resonance',
  'The Weeknd - Blinding Lights',
  'Soda Stereo - De Música Ligera',
  'Guitarras andinas solistas',
];

export const App: React.FC = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 90,
    isMuted: false,
    isBuffering: false,
    isShuffle: false,
    isRepeat: false,
  });
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiProgressStep, setAiProgressStep] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState('Radio Inteligente');
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Conversational DJ State & Curation Settings
  const [isDjChatOpen, setIsDjChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [curationSettings, setCurationSettings] = useState<CurationSettings>(() => getCurationSettings());

  const playedHistoryRef = useRef<string[]>([]);
  const queueRef = useRef<Song[]>([]);
  const currentSongRef = useRef<Song | null>(null);
  const curationSettingsRef = useRef<CurationSettings>(curationSettings);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentSongRef.current = currentSong;
    if (currentSong) {
      try {
        localStorage.setItem(STORAGE_LAST_PLAYED, JSON.stringify(currentSong));
      } catch (e) {}
    }
  }, [currentSong]);

  useEffect(() => {
    curationSettingsRef.current = curationSettings;
    saveCurationSettings(curationSettings);
  }, [curationSettings]);

  // Toggle Mini-Player state
  const handleToggleMini = async () => {
    if (window.auraAPI?.toggleMiniPlayer) {
      const active = await window.auraAPI.toggleMiniPlayer();
      setIsMiniPlayer(active);
    } else {
      setIsMiniPlayer(!isMiniPlayer);
    }
  };

  /**
   * Generates a dynamic 5-track Auto-Radio queue matching ANY song being played
   */
  const populateSimilarRadio = useCallback(async (song: Song) => {
    try {
      console.log('[App Radio] Populating similar queue for:', song.title, song.artist);
      const similarRecs = await getSimilarSongsForTrack(song, curationSettingsRef.current);

      if (similarRecs && similarRecs.length > 0) {
        const resolvedQueue: Song[] = [];
        for (const rec of similarRecs) {
          const s = await resolveSongFromYouTube(rec);
          resolvedQueue.push(s);
          playedHistoryRef.current.push(`${s.artist} - ${s.title}`);
        }
        setQueue(resolvedQueue);
      }
    } catch (err) {
      console.warn('[App Radio] Failed to populate similar queue:', err);
    }
  }, []);

  // Process a prompt with live progress and instant playback of track 1
  const handlePromptSubmit = useCallback(
    async (prompt: string) => {
      setIsLoadingAi(true);
      setLastPrompt(prompt);
      setAiProgressStep('Analizando intención y descartando recopilaciones...');

      try {
        const recommendations = await getAiCuratedPlaylist(
          prompt,
          playedHistoryRef.current,
          curationSettingsRef.current
        );

        if (!recommendations || recommendations.length === 0) {
          setAiProgressStep('No se encontraron canciones para esta petición.');
          setTimeout(() => setAiProgressStep(null), 2500);
          return;
        }

        // STEP 1: Resolve track 1 and play IMMEDIATELY
        setAiProgressStep(`Conectando pista de estudio: "${recommendations[0].title}"...`);
        const firstSong = await resolveSongFromYouTube(recommendations[0]);
        playedHistoryRef.current.push(`${firstSong.artist} - ${firstSong.title}`);

        console.log('[App] Auto-playing first track instantly:', firstSong.title, firstSong.videoId);
        recordPlayedSong(firstSong);
        setCurrentSong(firstSong);
        setPlaybackState((prev) => ({ ...prev, isPlaying: true, currentTime: 0 }));
        setAiProgressStep(`▶ Reproduciendo "${firstSong.title}" al instante`);

        setTimeout(() => setAiProgressStep(null), 2500);

        // STEP 2: In the background, resolve remaining recommendations for the queue
        const remainingRecs = recommendations.slice(1);
        if (remainingRecs.length > 0) {
          const resolvedRest: Song[] = [];
          for (const rec of remainingRecs) {
            const song = await resolveSongFromYouTube(rec);
            resolvedRest.push(song);
            playedHistoryRef.current.push(`${song.artist} - ${song.title}`);
          }
          setQueue(resolvedRest);
        } else {
          // If less than 2 tracks, auto-populate radio matching the first track
          populateSimilarRadio(firstSong);
        }
      } catch (err) {
        console.error('Failed to generate playlist:', err);
        setAiProgressStep(null);
      } finally {
        setIsLoadingAi(false);
      }
    },
    [populateSimilarRadio]
  );

  // Conversational DJ Chat handler with instant playback
  const handleSendMessageToDj = useCallback(
    async (userText: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userText,
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, userMsg]);
      setIsLoadingAi(true);
      setAiProgressStep('El DJ está analizando tu pedido...');

      try {
        const history = chatMessages.map((m) => ({ role: m.role, content: m.content }));
        const response = await chatWithAiDj(
          userText,
          history,
          currentSongRef.current,
          curationSettingsRef.current
        );

        if (response.recommendations.length > 0) {
          setAiProgressStep(`Conectando pista recomendada: "${response.recommendations[0].title}"...`);

          // Play track 1 immediately
          const firstSong = await resolveSongFromYouTube(response.recommendations[0]);
          recordPlayedSong(firstSong);
          setCurrentSong(firstSong);
          setPlaybackState((prev) => ({ ...prev, isPlaying: true, currentTime: 0 }));
          setAiProgressStep(`▶ Reproduciendo "${firstSong.title}"`);
          setTimeout(() => setAiProgressStep(null), 2500);

          // Resolve the rest in background
          const remainingRecs = response.recommendations.slice(1);
          const resolvedRest: Song[] = [];
          for (const rec of remainingRecs) {
            const song = await resolveSongFromYouTube(rec);
            resolvedRest.push(song);
          }
          setQueue(resolvedRest);

          const djMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response.commentary,
            timestamp: Date.now(),
            songs: [firstSong, ...resolvedRest],
          };
          setChatMessages((prev) => [...prev, djMsg]);
        } else {
          const djMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response.commentary,
            timestamp: Date.now(),
          };
          setChatMessages((prev) => [...prev, djMsg]);
          setAiProgressStep(null);
        }
      } catch (e) {
        console.error('[App] DJ chat error:', e);
        setAiProgressStep(null);
      } finally {
        setIsLoadingAi(false);
      }
    },
    [chatMessages]
  );

  // Direct song playback from Global Search Bar -> Automatically triggers 5 similar songs in Queue!
  const handlePlayDirectSong = useCallback(
    (song: Song) => {
      console.log('[App] Playing direct single from search:', song.title, song.videoId);
      recordPlayedSong(song);
      setCurrentSong(song);
      setPlaybackState((prev) => ({ ...prev, isPlaying: true, currentTime: 0 }));
      setLastPrompt(`Radio: ${song.title}`);

      // Immediately regenerate the queue with 5 tracks similar to this newly played song!
      populateSimilarRadio(song);
    },
    [populateSimilarRadio]
  );

  // Add song to queue from Global Search Bar
  const handleAddSongToQueue = useCallback((song: Song) => {
    console.log('[App] Adding single to queue from search:', song.title);
    setQueue((prev) => [...prev, song]);
  }, []);

  // Toggle Like on song (Trains user taste profile)
  const handleToggleLike = useCallback((song: Song) => {
    const { isLiked } = toggleLikeSong(song);
    setCurrentSong((prev) => (prev && prev.videoId === song.videoId ? { ...prev, isLiked } : prev));
    setQueue((prev) =>
      prev.map((s) => (s.videoId === song.videoId ? { ...s, isLiked } : s))
    );
  }, []);

  // History stack for Previous Track playback
  const playedStackRef = useRef<Song[]>([]);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Unified Toggle Play function
  const handleTogglePlay = useCallback(() => {
    setPlaybackState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const handleTogglePlayRef = useRef(handleTogglePlay);
  const handleNextRef = useRef<() => void>(() => {});
  const handlePreviousRef = useRef<() => void>(() => {});

  useEffect(() => {
    handleTogglePlayRef.current = handleTogglePlay;
  }, [handleTogglePlay]);

  // Next Track using current queueRef + recording into playedStackRef
  const handleNext = useCallback(() => {
    if (currentSongRef.current) {
      playedStackRef.current.push(currentSongRef.current);
      if (playedStackRef.current.length > 50) {
        playedStackRef.current.shift();
      }
    }

    if (queueRef.current.length > 0) {
      const nextSong = queueRef.current[0];
      const remainingQueue = queueRef.current.slice(1);
      recordPlayedSong(nextSong);
      setCurrentSong(nextSong);
      setQueue(remainingQueue);
      setPlaybackState((prev) => ({ ...prev, isPlaying: true, currentTime: 0 }));

      if (remainingQueue.length <= 2) {
        populateSimilarRadio(nextSong);
      }
    } else if (currentSongRef.current) {
      populateSimilarRadio(currentSongRef.current);
    }
  }, [populateSimilarRadio]);

  // Previous Track: Rewind if > 3s, otherwise go back to previous song from history
  const handlePrevious = useCallback(() => {
    if (playbackState.currentTime > 3) {
      setSeekTime(0);
      return;
    }

    if (playedStackRef.current.length > 0) {
      const prevSong = playedStackRef.current.pop()!;
      if (currentSongRef.current) {
        setQueue((prev) => [currentSongRef.current!, ...prev]);
      }
      setCurrentSong(prevSong);
      setPlaybackState((prev) => ({ ...prev, isPlaying: true, currentTime: 0 }));
    } else {
      setSeekTime(0);
    }
  }, [playbackState.currentTime]);

  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  useEffect(() => {
    handlePreviousRef.current = handlePrevious;
  }, [handlePrevious]);

  // Track end callback
  const handleTrackEnd = useCallback(() => {
    console.log('[App] handleTrackEnd called. Remaining in queue:', queueRef.current.length);
    if (playbackState.isRepeat && currentSongRef.current) {
      setSeekTime(0);
      setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
      return;
    }
    handleNext();
  }, [playbackState.isRepeat, handleNext]);

  // Smart Skip (AI Feedback Loop)
  const handleSmartSkip = useCallback(async () => {
    const song = currentSongRef.current;
    if (!song) return;
    setIsLoadingAi(true);

    try {
      const newRecs = await getSmartSkipRecommendations(
        song,
        lastPrompt,
        curationSettingsRef.current
      );

      const replacementSongs: Song[] = [];
      for (const rec of newRecs) {
        const resolved = await resolveSongFromYouTube(rec);
        replacementSongs.push(resolved);
      }

      if (replacementSongs.length > 0) {
        const [nextImmediate, ...rest] = replacementSongs;
        recordPlayedSong(nextImmediate);
        setCurrentSong(nextImmediate);
        setQueue(rest);
        setPlaybackState((prev) => ({ ...prev, isPlaying: true, currentTime: 0 }));
      } else {
        handleNext();
      }
    } catch (e) {
      handleNext();
    } finally {
      setIsLoadingAi(false);
    }
  }, [lastPrompt, handleNext]);

  // Silent audio loop to guarantee macOS CoreAudio registers Aura as the active media app
  useEffect(() => {
    if (!silentAudioRef.current) return;
    silentAudioRef.current.volume = 0.0001;
    if (playbackState.isPlaying) {
      silentAudioRef.current.play().catch(() => {});
    } else {
      silentAudioRef.current.pause();
    }
  }, [playbackState.isPlaying]);

  // Sync MediaSession metadata and state with macOS Control Center, Lock Screen & Touch Bar
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    if (currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist || 'Aura AI',
        album: 'Aura Music',
        artwork: currentSong.thumbnail
          ? [
              { src: currentSong.thumbnail, sizes: '96x96', type: 'image/jpeg' },
              { src: currentSong.thumbnail, sizes: '128x128', type: 'image/jpeg' },
              { src: currentSong.thumbnail, sizes: '192x192', type: 'image/jpeg' },
              { src: currentSong.thumbnail, sizes: '256x256', type: 'image/jpeg' },
              { src: currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' },
            ]
          : [],
      });
    }

    navigator.mediaSession.playbackState = playbackState.isPlaying ? 'playing' : 'paused';
  }, [currentSong, playbackState.isPlaying]);

  // Register MediaSession action handlers (macOS physical keys F7/F8/F9, AirPods stem squeeze)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        console.log('[MediaSession] Play triggered');
        handleTogglePlayRef.current();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        console.log('[MediaSession] Pause triggered');
        handleTogglePlayRef.current();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        console.log('[MediaSession] Next track triggered');
        handleNextRef.current();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        console.log('[MediaSession] Previous track triggered');
        handlePreviousRef.current();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime != null) {
          setSeekTime(details.seekTime);
        }
      });
    } catch (err) {
      console.warn('[MediaSession] Action handlers not supported:', err);
    }
  }, []);

  // In-app keyboard shortcuts (Space, Cmd+Right, Cmd+Left, F8, F9, F7)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Never intercept when user is typing in search input or chat textarea
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Space: Toggle Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlayRef.current();
        return;
      }

      // Cmd+Right or Ctrl+Right: Next Track
      if ((e.metaKey || e.ctrlKey) && e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextRef.current();
        return;
      }

      // Cmd+Left or Ctrl+Left: Previous Track
      if ((e.metaKey || e.ctrlKey) && e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePreviousRef.current();
        return;
      }

      // Mac F8 / MediaPlayPause key in DOM
      if (e.code === 'F8' || e.key === 'F8' || e.code === 'MediaPlayPause') {
        e.preventDefault();
        handleTogglePlayRef.current();
        return;
      }

      // Mac F9 / MediaTrackNext in DOM
      if (e.code === 'F9' || e.key === 'F9' || e.code === 'MediaTrackNext') {
        e.preventDefault();
        handleNextRef.current();
        return;
      }

      // Mac F7 / MediaTrackPrevious in DOM
      if (e.code === 'F7' || e.key === 'F7' || e.code === 'MediaTrackPrevious') {
        e.preventDefault();
        handlePreviousRef.current();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to macOS global media keys from Electron IPC
  useEffect(() => {
    if (!window.auraAPI?.onMediaKey) return;

    const unregPlay = window.auraAPI.onMediaKey('toggle-play', () => {
      console.log('[IPC] toggle-play event received');
      handleTogglePlayRef.current();
    });
    const unregNext = window.auraAPI.onMediaKey('next', () => {
      console.log('[IPC] next event received');
      handleNextRef.current();
    });
    const unregPrev = window.auraAPI.onMediaKey('previous', () => {
      console.log('[IPC] previous event received');
      handlePreviousRef.current();
    });

    return () => {
      unregPlay();
      unregNext();
      unregPrev();
    };
  }, []);

  // App Startup: Restore LAST PLAYED song or pick a pleasant random starter
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LAST_PLAYED);
      if (saved) {
        const song: Song = JSON.parse(saved);
        if (song && song.videoId) {
          console.log('[App Startup] Restoring last played song:', song.title, song.artist);
          setCurrentSong(song);
          setPlaybackState((prev) => ({ ...prev, isPlaying: true, currentTime: 0 }));
          setLastPrompt(`Última: ${song.title}`);
          populateSimilarRadio(song);
          return;
        }
      }
    } catch (e) {}

    // First time ever: pick random pleasant starter
    const randomVibe = RANDOM_STARTERS[Math.floor(Math.random() * RANDOM_STARTERS.length)];
    console.log('[App Startup] Initial random starter:', randomVibe);
    handlePromptSubmit(randomVibe);
  }, []);

  // Single persistent instance of the Dual-Deck YouTube Audio Engine
  const persistentPlayer = (
    <YouTubeAudioPlayer
      currentSong={currentSong}
      nextSong={queue.length > 0 ? queue[0] : null}
      isPlaying={playbackState.isPlaying}
      volume={playbackState.isMuted ? 0 : playbackState.volume}
      seekTime={seekTime}
      showVideo={showVideo}
      onTrackEnd={handleTrackEnd}
      onTimeUpdate={(current, duration) => {
        setPlaybackState((prev) => ({ ...prev, currentTime: current, duration }));
        setSeekTime(null);
      }}
      onBuffering={(buffering) => {
        setPlaybackState((prev) => ({ ...prev, isBuffering: buffering }));
      }}
      onPlayingStateChange={(playing) => {
        setPlaybackState((prev) => ({ ...prev, isPlaying: playing }));
      }}
    />
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-aura-bg text-white relative overflow-hidden select-none">
      {/* Silent audio element anchoring macOS CoreAudio NowPlaying */}
      <audio
        ref={silentAudioRef}
        src={SILENT_AUDIO_URI}
        loop
        preload="auto"
        style={{ display: 'none' }}
      />

      {/* Mini Player View Mode */}
      {isMiniPlayer ? (
        <MiniPlayerView
          currentSong={currentSong}
          playbackState={playbackState}
          onTogglePlay={handleTogglePlay}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onExpand={handleToggleMini}
        />
      ) : (
        /* Full Desktop Window */
        <>
          {/* macOS Titlebar & Header */}
          <header className="mac-drag-region h-14 w-full flex items-center justify-between px-6 pt-2 select-none border-b border-white/5 bg-aura-surface/40 backdrop-blur-md z-20">
            <div className="flex items-center gap-2 pl-16 mac-no-drag">
              <div className="flex items-center gap-2 bg-aura-accent/15 border border-aura-accent/30 px-3 py-1 rounded-full">
                <Radio className="w-3.5 h-3.5 text-aura-accent animate-pulse" />
                <span className="text-xs font-semibold tracking-wider text-white">AURA</span>
                <span className="text-[10px] text-aura-accent bg-aura-accent/20 px-1.5 py-0.2 rounded font-mono">
                  AI-FIRST
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mac-no-drag">
              <div className="text-xs text-aura-subtext/70 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-aura-neonCyan" />
                <span>
                  Estación: <strong className="text-white/80 font-normal">{lastPrompt}</strong>
                </span>
              </div>

              {/* DJ Live Chat Toggle Pill */}
              <button
                onClick={() => setIsDjChatOpen(!isDjChatOpen)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition cursor-pointer ${
                  isDjChatOpen
                    ? 'bg-aura-accent text-white border-aura-accent shadow-neon'
                    : 'bg-white/5 hover:bg-white/10 text-aura-subtext hover:text-white border-white/10'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-aura-neonCyan" />
                <span>DJ Chat</span>
              </button>
            </div>
          </header>

          {/* Main Body */}
          <main className="flex-1 flex flex-col overflow-hidden relative">
            {/* Top Prompt & Global Search Area */}
            <div className="w-full px-6 pt-3 pb-2 z-30 max-w-4xl mx-auto">
              <PromptBar
                onPromptSubmit={handlePromptSubmit}
                onPlayDirectSong={handlePlayDirectSong}
                onAddSongToQueue={handleAddSongToQueue}
                isLoading={isLoadingAi}
                aiProgressStep={aiProgressStep}
              />
            </div>

            {/* Center Area: Now Playing & Queue + DJ Chat Sidebar */}
            <div className="flex-1 flex overflow-hidden">
              <NowPlayingView
                currentSong={currentSong}
                isPlaying={playbackState.isPlaying}
                showVideo={showVideo}
                onToggleVideo={() => setShowVideo(!showVideo)}
                onSmartSkip={handleSmartSkip}
                onToggleLike={handleToggleLike}
                onToggleDjChat={() => setIsDjChatOpen(!isDjChatOpen)}
                isAiLoading={isLoadingAi}
                videoSlot={persistentPlayer}
              />

              <QueueList
                queue={queue}
                onPlaySong={(index) => {
                  const song = queue[index];
                  const newQueue = queue.filter((_, i) => i !== index);
                  if (currentSong) newQueue.unshift(currentSong);
                  recordPlayedSong(song);
                  setCurrentSong(song);
                  setQueue(newQueue);
                  setPlaybackState((p) => ({ ...p, isPlaying: true, currentTime: 0 }));
                  // Refresh radio with tracks similar to the selected track!
                  populateSimilarRadio(song);
                }}
                onRemoveSong={(index) => {
                  setQueue((prev) => prev.filter((_, i) => i !== index));
                }}
                isLoadingAi={isLoadingAi}
              />

              {/* Interactive Conversational DJ Sidebar */}
              <AiDjChatSidebar
                isOpen={isDjChatOpen}
                onClose={() => setIsDjChatOpen(false)}
                messages={chatMessages}
                onSendMessage={handleSendMessageToDj}
                onPlaySong={handlePlayDirectSong}
                curationSettings={curationSettings}
                onUpdateSettings={setCurationSettings}
                isLoading={isLoadingAi}
                currentSong={currentSong}
              />
            </div>
          </main>

          {/* If video mode is OFF, persistentPlayer is kept mounted in an off-dock position */}
          {!showVideo && persistentPlayer}

          {/* Bottom Player Controls */}
          <PlayerControls
            currentSong={currentSong}
            playbackState={playbackState}
            onTogglePlay={handleTogglePlay}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSeek={(secs) => setSeekTime(secs)}
            onVolumeChange={(vol) => setPlaybackState((p) => ({ ...p, volume: vol, isMuted: false }))}
            onToggleMute={() => setPlaybackState((p) => ({ ...p, isMuted: !p.isMuted }))}
            onToggleShuffle={() => setPlaybackState((p) => ({ ...p, isShuffle: !p.isShuffle }))}
            onToggleRepeat={() => setPlaybackState((p) => ({ ...p, isRepeat: !p.isRepeat }))}
            onToggleMiniPlayer={handleToggleMini}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </>
      )}

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};
