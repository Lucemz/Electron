import React from 'react';
import { Song } from '../types';
import {
  Sparkles,
  Disc,
  ThumbsDown,
  Activity,
  Flame,
  Video,
  Image as ImageIcon,
  Heart,
  Clock,
  MessageSquare,
} from 'lucide-react';

interface NowPlayingViewProps {
  currentSong: Song | null;
  isPlaying: boolean;
  showVideo: boolean;
  onToggleVideo: () => void;
  onSmartSkip: () => void;
  onToggleLike: (song: Song) => void;
  onToggleWatchLater: (song: Song) => void;
  onToggleDjChat: () => void;
  isAiLoading: boolean;
  videoSlot?: React.ReactNode;
}

export const NowPlayingView: React.FC<NowPlayingViewProps> = ({
  currentSong,
  isPlaying,
  showVideo,
  onToggleVideo,
  onSmartSkip,
  onToggleLike,
  onToggleWatchLater,
  onToggleDjChat,
  isAiLoading,
  videoSlot,
}) => {
  if (!currentSong) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-aura-surface border border-white/5 flex items-center justify-center mb-6 shadow-2xl relative">
          <div className="absolute inset-0 rounded-full bg-aura-accent/20 blur-xl animate-pulse"></div>
          <Disc className="w-12 h-12 text-aura-accent animate-spin-slow opacity-60" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Tu estación de IA está lista</h3>
        <p className="text-sm text-aura-subtext max-w-md">
          Escribe una vibra, artista o sensación en la barra de arriba o abre el chat con el DJ para conversar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 p-6 overflow-y-auto">
      {/* Vinyl / Album Art or Video Player */}
      <div className="relative group flex-shrink-0 flex flex-col items-center">
        {/* Ambient Glow */}
        <div
          className={`absolute -inset-4 rounded-3xl blur-2xl opacity-60 transition duration-1000 ${
            isPlaying
              ? 'bg-gradient-to-tr from-aura-accent via-aura-neonCyan to-aura-neonPink animate-pulse-slow'
              : 'bg-aura-accent/20'
          }`}
        />

        {/* Media Container (300x300 or Video) */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-aura-surface flex items-center justify-center">
          {showVideo && videoSlot ? (
            <div className="w-full h-full flex items-center justify-center bg-black">
              {videoSlot}
            </div>
          ) : (
            <>
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />

              {/* Playing overlay badge */}
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                  }`}
                />
                <span className="text-[11px] font-medium uppercase tracking-wider text-white/90">
                  {isPlaying ? 'En vivo' : 'Pausado'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Video / Artwork Toggle */}
        <button
          onClick={onToggleVideo}
          className="mt-3 flex items-center gap-1.5 text-xs text-aura-subtext hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1 rounded-full transition cursor-pointer"
        >
          {showVideo ? (
            <>
              <ImageIcon className="w-3.5 h-3.5 text-aura-neonCyan" />
              <span>Ver Carátula</span>
            </>
          ) : (
            <>
              <Video className="w-3.5 h-3.5 text-aura-neonPink" />
              <span>Ver Video de YouTube</span>
            </>
          )}
        </button>
      </div>

      {/* Song Details & AI Explanation */}
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-md">
        {/* Energy & BPM badges */}
        <div className="flex items-center gap-2 mb-3">
          {currentSong.bpm && (
            <span className="flex items-center gap-1 text-[11px] bg-white/5 border border-white/10 text-white/80 px-2.5 py-0.5 rounded-full font-mono">
              <Activity className="w-3.5 h-3.5 text-aura-neonCyan" />
              {currentSong.bpm} BPM
            </span>
          )}
          {currentSong.energy && (
            <span className="flex items-center gap-1 text-[11px] bg-white/5 border border-white/10 text-white/80 px-2.5 py-0.5 rounded-full capitalize">
              <Flame className="w-3.5 h-3.5 text-aura-neonPink" />
              Vibra {currentSong.energy}
            </span>
          )}
        </div>

        {/* Title, Artist and Like button */}
        <div className="w-full flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight truncate">
              {currentSong.title}
            </h2>
            <p className="text-base sm:text-lg text-aura-subtext font-medium mt-0.5 truncate">
              {currentSong.artist}
            </p>
          </div>

          {/* Actions: Like and Watch Later */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Heart / Like Button (Teaches AI) */}
            <button
              onClick={() => onToggleLike(currentSong)}
              className={`p-2.5 rounded-2xl border transition cursor-pointer ${
                currentSong.isLiked
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-500 shadow-neon'
                  : 'bg-white/5 border-white/10 text-aura-subtext hover:text-white hover:bg-white/10'
              }`}
              title={currentSong.isLiked ? 'Canción que amas (registrada en memoria)' : 'Dar Like (enseña a tu AI DJ)'}
            >
              <Heart className={`w-5 h-5 ${currentSong.isLiked ? 'fill-current' : ''}`} />
            </button>

            {/* Watch Later Button */}
            <button
              onClick={() => onToggleWatchLater(currentSong)}
              className={`p-2.5 rounded-2xl border transition cursor-pointer ${
                currentSong.isSavedWatchLater
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 shadow-neon'
                  : 'bg-white/5 border-white/10 text-aura-subtext hover:text-white hover:bg-white/10'
              }`}
              title={currentSong.isSavedWatchLater ? 'Guardada en Ver más tarde' : 'Guardar en Ver más tarde'}
            >
              <Clock className={`w-5 h-5 ${currentSong.isSavedWatchLater ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* AI Curatorial Reason Card */}
        {currentSong.aiReason && (
          <div className="w-full bg-aura-surface/80 backdrop-blur-md border border-aura-accent/30 rounded-2xl p-4 shadow-glass my-3 relative overflow-hidden text-left">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-aura-accent/15 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 text-aura-accent text-xs font-semibold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Por qué Aura DJ eligió esto</span>
            </div>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              "{currentSong.aiReason}"
            </p>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2.5 mt-2">
          {/* Smart Skip Feedback Action */}
          <button
            onClick={onSmartSkip}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 text-xs text-aura-subtext hover:text-white/90 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <ThumbsDown className="w-3.5 h-3.5 text-aura-neonPink" />
            <span>No va con mi vibra</span>
          </button>

          {/* Open DJ Live Chat */}
          <button
            onClick={onToggleDjChat}
            className="flex items-center gap-1.5 text-xs text-white bg-aura-accent/20 hover:bg-aura-accent/30 border border-aura-accent/40 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-neon font-medium"
          >
            <MessageSquare className="w-3.5 h-3.5 text-aura-accent" />
            <span>Conversar con el DJ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
