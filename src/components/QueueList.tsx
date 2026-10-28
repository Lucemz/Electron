import React from 'react';
import { Song } from '../types';
import { Play, Trash2, Radio, Sparkles } from 'lucide-react';

interface QueueListProps {
  queue: Song[];
  onPlaySong: (index: number) => void;
  onRemoveSong: (index: number) => void;
  isLoadingAi: boolean;
}

export const QueueList: React.FC<QueueListProps> = ({
  queue,
  onPlaySong,
  onRemoveSong,
  isLoadingAi,
}) => {
  return (
    <div className="w-80 h-full flex flex-col bg-aura-surface/50 backdrop-blur-xl border-l border-white/5 p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-aura-accent" />
          <h3 className="text-sm font-semibold text-white tracking-wide">Aura Queue</h3>
        </div>
        <span className="text-xs text-aura-subtext font-mono bg-white/5 px-2 py-0.5 rounded-full">
          {queue.length} {queue.length === 1 ? 'pista' : 'pistas'}
        </span>
      </div>

      {/* Queue items */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {queue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Radio className="w-8 h-8 text-aura-subtext/40 mb-2 animate-pulse" />
            <p className="text-xs text-aura-subtext">La cola está vacía</p>
            <p className="text-[11px] text-aura-subtext/60 mt-1">
              Pide algo al DJ de IA para autocompletar tu lista.
            </p>
          </div>
        ) : (
          queue.map((song, idx) => (
            <div
              key={song.id}
              className="group relative flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-transparent hover:border-white/10 transition"
            >
              {/* Thumbnail + Play Hover */}
              <div
                className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-aura-surface cursor-pointer"
                onClick={() => onPlaySong(idx)}
              >
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </div>

              {/* Title & Artist */}
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onPlaySong(idx)}>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium text-white truncate group-hover:text-aura-accent transition">
                    {song.title}
                  </p>
                  {idx === 0 && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-mono flex items-center gap-0.5 flex-shrink-0 animate-pulse">
                      ⚡ Precargado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-aura-subtext truncate">{song.artist}</p>
                {song.aiReason && (
                  <p className="text-[10px] text-aura-accent/80 truncate mt-0.5 font-light italic">
                    {song.aiReason}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSong(idx);
                  }}
                  className="p-1.5 text-aura-subtext hover:text-aura-neonPink hover:bg-white/5 rounded-lg transition"
                  title="Quitar de la cola"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Infinite Smart Radio Footer */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-aura-subtext">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isLoadingAi ? 'bg-aura-accent animate-ping' : 'bg-emerald-400'}`} />
          <span>{isLoadingAi ? 'Generando más pistas...' : 'Smart Radio activa'}</span>
        </div>
        <span className="text-[10px] text-aura-accent font-medium">Auto-DJ</span>
      </div>
    </div>
  );
};
