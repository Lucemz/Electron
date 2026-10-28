import React, { useState } from 'react';
import { Song, PlaybackState } from '../types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  PictureInPicture2,
  Settings as SettingsIcon,
} from 'lucide-react';

interface PlayerControlsProps {
  currentSong: Song | null;
  playbackState: PlaybackState;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleMiniPlayer: () => void;
  onOpenSettings: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentSong,
  playbackState,
  onTogglePlay,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleMiniPlayer,
  onOpenSettings,
}) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [localSeekTime, setLocalSeekTime] = useState(0);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLocalSeekTime(val);
  };

  const handleSliderMouseDown = () => {
    setIsSeeking(true);
    setLocalSeekTime(playbackState.currentTime);
  };

  const handleSliderMouseUp = () => {
    setIsSeeking(false);
    onSeek(localSeekTime);
  };

  const displayedTime = isSeeking ? localSeekTime : playbackState.currentTime;
  const progressPercent =
    playbackState.duration > 0
      ? (displayedTime / playbackState.duration) * 100
      : 0;

  const renderVolumeIcon = () => {
    if (playbackState.isMuted || playbackState.volume === 0) {
      return <VolumeX className="w-4 h-4 text-aura-subtext" />;
    }
    if (playbackState.volume < 50) {
      return <Volume1 className="w-4 h-4 text-aura-subtext" />;
    }
    return <Volume2 className="w-4 h-4 text-aura-subtext" />;
  };

  return (
    <div className="h-20 w-full bg-aura-surface/90 backdrop-blur-2xl border-t border-white/5 px-4 sm:px-6 flex items-center justify-between select-none z-30">
      {/* Left: Current Track Info */}
      <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
        {currentSong ? (
          <>
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-md flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentSong.title}</p>
              <p className="text-xs text-aura-subtext truncate">{currentSong.artist}</p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 opacity-40">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5" />
            <div>
              <div className="w-24 h-3 bg-white/10 rounded mb-1.5" />
              <div className="w-16 h-2.5 bg-white/5 rounded" />
            </div>
          </div>
        )}
      </div>

      {/* Center: Controls + Scrubber */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-xl px-4">
        {/* Buttons */}
        <div className="flex items-center gap-4 mb-1">
          <button
            onClick={onToggleShuffle}
            className={`p-1.5 rounded-full transition ${
              playbackState.isShuffle ? 'text-aura-accent' : 'text-aura-subtext hover:text-white'
            }`}
            title="Aleatorio"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onPrevious}
            className="p-1.5 text-aura-subtext hover:text-white transition"
            title="Anterior"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            disabled={!currentSong}
            className="w-9 h-9 rounded-full bg-white text-black hover:scale-105 active:scale-95 flex items-center justify-center transition shadow-lg disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
            title={playbackState.isPlaying ? 'Pausa' : 'Reproducir'}
          >
            {playbackState.isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-1.5 text-aura-subtext hover:text-white transition"
            title="Siguiente"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={onToggleRepeat}
            className={`p-1.5 rounded-full transition ${
              playbackState.isRepeat ? 'text-aura-accent' : 'text-aura-subtext hover:text-white'
            }`}
            title="Repetir"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full flex items-center gap-3 text-[11px] font-mono text-aura-subtext">
          <span className="w-9 text-right">{formatTime(displayedTime)}</span>
          <div className="relative flex-1 flex items-center group cursor-pointer">
            {/* Background bar */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative group-hover:h-1.5 transition-all">
              <div
                className="h-full bg-gradient-to-r from-aura-accent to-aura-neonCyan rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Invisible Range Input for scrubbing */}
            <input
              type="range"
              min={0}
              max={playbackState.duration || 100}
              step={0.5}
              value={displayedTime}
              onChange={handleSliderChange}
              onMouseDown={handleSliderMouseDown}
              onMouseUp={handleSliderMouseUp}
              onTouchStart={handleSliderMouseDown}
              onTouchEnd={handleSliderMouseUp}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="w-9">{formatTime(playbackState.duration)}</span>
        </div>
      </div>

      {/* Right: Volume & Extra Controls */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
        {/* Volume */}
        <div className="flex items-center gap-2 group">
          <button onClick={onToggleMute} className="hover:text-white transition">
            {renderVolumeIcon()}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={playbackState.isMuted ? 0 : playbackState.volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-20 h-1 bg-white/10 rounded-full appearance-none accent-aura-accent cursor-pointer"
          />
        </div>

        {/* Mini-Player PIP Mode */}
        <button
          onClick={onToggleMiniPlayer}
          className="p-2 text-aura-subtext hover:text-white hover:bg-white/5 rounded-xl transition"
          title="Modo Mini-Player flotante"
        >
          <PictureInPicture2 className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-aura-subtext hover:text-white hover:bg-white/5 rounded-xl transition"
          title="Ajustes y API Key de Gemini"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
