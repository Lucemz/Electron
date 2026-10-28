import React, { useEffect, useRef, useState } from 'react';
import { Song } from '../types';

interface YouTubeAudioPlayerProps {
  currentSong: Song | null;
  nextSong?: Song | null;
  isPlaying: boolean;
  volume: number;
  seekTime: number | null;
  showVideo: boolean;
  onTrackEnd: () => void;
  onTimeUpdate: (current: number, duration: number) => void;
  onBuffering: (buffering: boolean) => void;
  onPlayingStateChange: (playing: boolean) => void;
}

export const YouTubeAudioPlayer: React.FC<YouTubeAudioPlayerProps> = ({
  currentSong,
  nextSong,
  isPlaying,
  volume,
  seekTime,
  showVideo,
  onTrackEnd,
  onTimeUpdate,
  onBuffering,
  onPlayingStateChange,
}) => {
  const containerDeckAId = 'aura-deck-a-container';
  const containerDeckBId = 'aura-deck-b-container';

  // Dual-Deck refs
  const deckAPlayerRef = useRef<any>(null);
  const deckBPlayerRef = useRef<any>(null);
  const deckAIsReadyRef = useRef<boolean>(false);
  const deckBIsReadyRef = useRef<boolean>(false);

  const activeDeckRef = useRef<'A' | 'B'>('A');
  const [activeDeckDisplay, setActiveDeckDisplay] = useState<'A' | 'B'>('A');

  const deckAVideoIdRef = useRef<string>('');
  const deckBVideoIdRef = useRef<string>('');

  const progressInterval = useRef<any>(null);

  // Sync refs to prevent stale closure bugs in callbacks
  const currentSongRef = useRef(currentSong);
  const nextSongRef = useRef(nextSong);
  const isPlayingRef = useRef(isPlaying);
  const volumeRef = useRef(volume);
  const onTrackEndRef = useRef(onTrackEnd);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onBufferingRef = useRef(onBuffering);
  const onPlayingStateChangeRef = useRef(onPlayingStateChange);

  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);
  useEffect(() => { nextSongRef.current = nextSong; }, [nextSong]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { onTrackEndRef.current = onTrackEnd; }, [onTrackEnd]);
  useEffect(() => { onTimeUpdateRef.current = onTimeUpdate; }, [onTimeUpdate]);
  useEffect(() => { onBufferingRef.current = onBuffering; }, [onBuffering]);
  useEffect(() => { onPlayingStateChangeRef.current = onPlayingStateChange; }, [onPlayingStateChange]);

  const getActivePlayer = () => {
    return activeDeckRef.current === 'A' ? deckAPlayerRef.current : deckBPlayerRef.current;
  };

  const getStandbyPlayer = () => {
    return activeDeckRef.current === 'A' ? deckBPlayerRef.current : deckAPlayerRef.current;
  };

  // Pre-buffer next song on standby deck
  const prebufferNextSong = (songToPreload: Song | null) => {
    if (!songToPreload || !songToPreload.videoId) return;

    const standbyDeck = activeDeckRef.current === 'A' ? 'B' : 'A';
    const standbyPlayer = standbyDeck === 'B' ? deckBPlayerRef.current : deckAPlayerRef.current;
    const standbyReady = standbyDeck === 'B' ? deckBIsReadyRef.current : deckAIsReadyRef.current;
    const currentPreloadedId = standbyDeck === 'B' ? deckBVideoIdRef.current : deckAVideoIdRef.current;

    if (!standbyPlayer || !standbyReady) return;

    if (currentPreloadedId !== songToPreload.videoId) {
      console.log(`[Aura Preload Deck ${standbyDeck}] Pre-buffering next track:`, songToPreload.title, songToPreload.videoId);
      if (standbyDeck === 'B') {
        deckBVideoIdRef.current = songToPreload.videoId;
      } else {
        deckAVideoIdRef.current = songToPreload.videoId;
      }

      try {
        standbyPlayer.setVolume(0);
        standbyPlayer.cueVideoById({
          videoId: songToPreload.videoId,
          startSeconds: 0,
        });
      } catch (e) {
        console.warn(`[Aura Preload Deck ${standbyDeck}] Error cueing:`, e);
      }
    }
  };

  // Initialize Dual YouTube Players
  useEffect(() => {
    function initDualPlayers() {
      if (!window.YT || !window.YT.Player) return;

      console.log('[Aura Player] Initializing Dual-Deck YouTube Engine (A & B)...');

      // 1. Deck A (Initial Active Player)
      deckAPlayerRef.current = new window.YT.Player(containerDeckAId, {
        height: '180',
        width: '320',
        videoId: currentSongRef.current?.videoId || '',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            console.log('[Aura Player Deck A] Ready!');
            deckAIsReadyRef.current = true;
            try {
              event.target.setVolume(volumeRef.current);
            } catch (e) {}

            const song = currentSongRef.current;
            if (song && song.videoId && activeDeckRef.current === 'A') {
              deckAVideoIdRef.current = song.videoId;
              console.log('[Aura Player Deck A] Loading initial song:', song.title, song.videoId);
              event.target.loadVideoById({
                videoId: song.videoId,
                startSeconds: 0,
              });
              if (isPlayingRef.current) {
                event.target.playVideo();
              }
            }

            // Once Deck A is ready, prebuffer next song on Deck B
            prebufferNextSong(nextSongRef.current || null);
          },
          onStateChange: (event: any) => handleDeckStateChange(event, 'A'),
          onError: (event: any) => handleDeckError(event, 'A'),
        },
      });

      // 2. Deck B (Standby Pre-buffering Deck)
      deckBPlayerRef.current = new window.YT.Player(containerDeckBId, {
        height: '180',
        width: '320',
        videoId: nextSongRef.current?.videoId || '',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            console.log('[Aura Player Deck B] Ready as Standby Pre-fetch Deck!');
            deckBIsReadyRef.current = true;
            try {
              event.target.setVolume(0);
            } catch (e) {}

            prebufferNextSong(nextSongRef.current || null);
          },
          onStateChange: (event: any) => handleDeckStateChange(event, 'B'),
          onError: (event: any) => handleDeckError(event, 'B'),
        },
      });
    }

    if (window.YT && window.YT.Player) {
      initDualPlayers();
    } else {
      window.onYouTubeIframeAPIReady = initDualPlayers;
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      try { deckAPlayerRef.current?.destroy?.(); } catch (e) {}
      try { deckBPlayerRef.current?.destroy?.(); } catch (e) {}
    };
  }, []);

  // Handle State Changes for either Deck
  const handleDeckStateChange = (event: any, deck: 'A' | 'B') => {
    // If event is from standby deck, only log it and ignore UI updates
    if (deck !== activeDeckRef.current) {
      console.log(`[Aura Standby Deck ${deck}] Background cue state:`, event.data);
      return;
    }

    console.log(`[Aura Active Deck ${deck}] State Change:`, event.data);
    if (event.data === 1) { // Playing
      onBufferingRef.current(false);
      onPlayingStateChangeRef.current(true);
    } else if (event.data === 2) { // Paused
      onBufferingRef.current(false);
      // AUTOPLAY FIX: If the app expects to be playing, force playVideo()
      // so YouTube's transient state 2 on load does NOT stall playback!
      if (isPlayingRef.current) {
        console.log(`[Aura Active Deck ${deck}] State 2 received while isPlaying=true; forcing playVideo()`);
        try {
          event.target.playVideo();
        } catch (e) {}
      } else {
        onPlayingStateChangeRef.current(false);
      }
    } else if (event.data === 3) { // Buffering
      onBufferingRef.current(true);
    } else if (event.data === 0) { // Track Ended
      console.log(`[Aura Active Deck ${deck}] Track completed. Triggering gapless advance.`);
      onTrackEndRef.current();
    }
  };

  // Handle Errors on either Deck
  const handleDeckError = (event: any, deck: 'A' | 'B') => {
    console.warn(`[Aura Player Deck ${deck}] YouTube Error code:`, event.data);
    const targetPlayer = deck === 'A' ? deckAPlayerRef.current : deckBPlayerRef.current;
    const song = deck === activeDeckRef.current ? currentSongRef.current : nextSongRef.current;

    // Multi-candidate fallback: try alternative video IDs first
    if (song && song.alternativeVideoIds && song.alternativeVideoIds.length > 0) {
      const altId = song.alternativeVideoIds.shift();
      if (altId) {
        console.log(`[Aura Player Deck ${deck}] Switching to alternative ID for "${song.title}":`, altId);
        try {
          if (deck === activeDeckRef.current) {
            targetPlayer.loadVideoById({ videoId: altId, startSeconds: 0 });
            if (isPlayingRef.current) targetPlayer.playVideo();
          } else {
            targetPlayer.cueVideoById({ videoId: altId, startSeconds: 0 });
          }
          return;
        } catch (e) {}
      }
    }

    if (deck === activeDeckRef.current) {
      console.warn(`[Aura Active Deck ${deck}] No alternatives left, advancing to next song...`);
      setTimeout(() => {
        onTrackEndRef.current();
      }, 500);
    }
  };

  // Track Transition Engine: Seamless Deck Swap when currentSong changes
  useEffect(() => {
    if (!currentSong?.videoId) return;

    const activeDeck = activeDeckRef.current;
    const activeVideoId = activeDeck === 'A' ? deckAVideoIdRef.current : deckBVideoIdRef.current;
    const standbyDeck = activeDeck === 'A' ? 'B' : 'A';
    const standbyVideoId = standbyDeck === 'A' ? deckAVideoIdRef.current : deckBVideoIdRef.current;

    // CASE 1: The new song is the one already PRE-BUFFERED on the standby deck!
    // -> Perform an INSTANT 0ms Deck Swap!
    if (standbyVideoId === currentSong.videoId) {
      console.log(`[Aura Gapless] ⚡ SEAMLESS DECK SWAP! Standby Deck ${standbyDeck} is already buffered and takes over!`);

      const oldPlayer = activeDeck === 'A' ? deckAPlayerRef.current : deckBPlayerRef.current;
      const newPlayer = standbyDeck === 'A' ? deckAPlayerRef.current : deckBPlayerRef.current;

      // Swap active pointer
      activeDeckRef.current = standbyDeck;
      setActiveDeckDisplay(standbyDeck);

      // Mute and pause old player
      try {
        oldPlayer?.setVolume(0);
        oldPlayer?.pauseVideo();
      } catch (e) {}

      // Play pre-buffered new player instantly with zero latency
      try {
        newPlayer?.setVolume(volumeRef.current);
        newPlayer?.playVideo();
      } catch (e) {}

      // Preload next upcoming song on the newly freed old player
      setTimeout(() => {
        prebufferNextSong(nextSongRef.current || null);
      }, 400);

      return;
    }

    // CASE 2: The song is completely new or different from the pre-buffered track
    if (activeVideoId !== currentSong.videoId) {
      const activePlayer = getActivePlayer();
      const isReady = activeDeck === 'A' ? deckAIsReadyRef.current : deckBIsReadyRef.current;

      if (activePlayer && isReady) {
        console.log(`[Aura Player Deck ${activeDeck}] Loading track directly:`, currentSong.title, currentSong.videoId);
        if (activeDeck === 'A') {
          deckAVideoIdRef.current = currentSong.videoId;
        } else {
          deckBVideoIdRef.current = currentSong.videoId;
        }

        try {
          activePlayer.setVolume(volumeRef.current);
          activePlayer.loadVideoById({
            videoId: currentSong.videoId,
            startSeconds: 0,
          });
          if (isPlayingRef.current) {
            activePlayer.playVideo();
            setTimeout(() => {
              try {
                if (isPlayingRef.current) activePlayer.playVideo();
              } catch (e) {}
            }, 150);
          }
        } catch (err) {
          console.error('[Aura Player] Error loading video:', err);
        }

        // Preload next track on the standby deck
        setTimeout(() => {
          prebufferNextSong(nextSongRef.current || null);
        }, 500);
      }
    }
  }, [currentSong?.videoId]);

  // Keep standby deck pre-buffered whenever nextSong changes in the queue
  useEffect(() => {
    prebufferNextSong(nextSong || null);
  }, [nextSong?.videoId]);

  // Play / Pause toggle on active player
  useEffect(() => {
    const activePlayer = getActivePlayer();
    if (!activePlayer) return;
    try {
      if (isPlaying) {
        activePlayer.playVideo();
      } else {
        activePlayer.pauseVideo();
      }
    } catch (e) {}
  }, [isPlaying]);

  // Volume updates on active player
  useEffect(() => {
    const activePlayer = getActivePlayer();
    if (!activePlayer) return;
    try {
      activePlayer.setVolume(volume);
    } catch (e) {}
  }, [volume]);

  // Seek updates on active player
  useEffect(() => {
    if (seekTime === null) return;
    const activePlayer = getActivePlayer();
    if (!activePlayer) return;
    try {
      activePlayer.seekTo(seekTime, true);
    } catch (e) {}
  }, [seekTime]);

  // Poll progress from active player every 500ms
  useEffect(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);

    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        const activePlayer = getActivePlayer();
        if (activePlayer) {
          try {
            const cur = activePlayer.getCurrentTime() || 0;
            const dur = activePlayer.getDuration() || 0;
            if (dur > 0) {
              onTimeUpdateRef.current(cur, dur);
            }
          } catch (e) {}
        }
      }, 500);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying]);

  return (
    <div
      className={`transition-all duration-500 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black ${
        showVideo
          ? 'w-72 h-44 opacity-100 z-40'
          : 'w-1 h-1 opacity-0 pointer-events-none fixed -bottom-10 -left-10'
      }`}
    >
      {/* Deck A Container */}
      <div
        id={containerDeckAId}
        className={activeDeckDisplay === 'A' ? 'w-full h-full' : 'w-0 h-0 opacity-0 pointer-events-none absolute'}
      />

      {/* Deck B Container */}
      <div
        id={containerDeckBId}
        className={activeDeckDisplay === 'B' ? 'w-full h-full' : 'w-0 h-0 opacity-0 pointer-events-none absolute'}
      />
    </div>
  );
};
