import React from 'react';
import { Song, PlaybackState } from '../types';
import { Play, Pause, SkipForward, SkipBack, Maximize2 } from 'lucide-react';

interface MiniPlayerViewProps {
  currentSong: Song | null;
  playbackState: PlaybackState;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onExpand: () => void;
}

export const MiniPlayerView: React.FC<MiniPlayerViewProps> = ({
  currentSong,
  playbackState,
  onTogglePlay,
  onNext,
  onPrevious,
  onExpand,
}) => {
  const progressPercent =
    playbackState.duration > 0
      ? (playbackState.currentTime / playbackState.duration) * 100
      : 0;

  return (
    <div className="h-screen w-screen bg-aura-bg/95 flex flex-col justify-between p-3 select-none border border-white/10 rounded-2xl overflow-hidden">
      {/* Top drag handle / expand */}
      <div className="flex items-center justify-between pl-16 pr-1 pt-1">
        <span className="text-[10px] uppercase font-mono tracking-widest text-aura-subtext/60">
          Aura Mini
        </span>
        <button
          onClick={onExpand}
          className="p-1 text-aura-subtext hover:text-white rounded-lg hover:bg-white/5 transition"
          title="Restaurar ventana"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Track Row */}
      <div className="flex items-center gap-3 px-1">
        {currentSong ? (
          <>
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="w-14 h-14 rounded-xl object-cover border border-white/10 shadow-lg flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{currentSong.title}</p>
              <p className="text-xs text-aura-subtext truncate">{currentSong.artist}</p>
              {currentSong.aiReason && (
                <p className="text-[10px] text-aura-accent truncate mt-0.5 italic">
                  {currentSong.aiReason}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/5" />
            <p className="text-xs text-aura-subtext">Sin pista seleccionada</p>
          </div>
        )}
      </div>

      {/* Controls & Progress */}
      <div className="space-y-2 pb-1">
        {/* Progress line */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-aura-accent rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onPrevious}
            className="p-1 text-aura-subtext hover:text-white transition"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            disabled={!currentSong}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow disabled:opacity-40"
          >
            {playbackState.isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-1 text-aura-subtext hover:text-white transition"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
