import React, { useState } from 'react';
import { Song } from '../types';
import {
  Heart,
  Clock,
  Play,
  Shuffle,
  Trash2,
  Plus,
  Search,
  Sparkles,
  Music,
  ExternalLink,
} from 'lucide-react';
import { cleanSongTitle, cleanArtistName } from '../utils/textCleaner';

interface LibraryViewProps {
  type: 'liked' | 'watchLater';
  songs: Song[];
  onPlaySong: (song: Song) => void;
  onPlayAll: (songs: Song[]) => void;
  onShuffleAll: (songs: Song[]) => void;
  onAddSongToQueue: (song: Song) => void;
  onRemoveFromList: (song: Song) => void;
  onGoToExplore?: () => void;
  onOpenGoogleLogin?: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  type,
  songs,
  onPlaySong,
  onPlayAll,
  onShuffleAll,
  onAddSongToQueue,
  onRemoveFromList,
  onGoToExplore,
  onOpenGoogleLogin,
}) => {
  const [filterText, setFilterText] = useState('');

  const isLikedView = type === 'liked';
  const title = isLikedView ? 'Canciones que te gustan' : 'Ver más tarde';
  const description = isLikedView
    ? 'Tus temas favoritos marcados con corazón en Aura y sincronizados con YouTube Music.'
    : 'Tu lista de pistas guardadas para escuchar con calma más tarde.';
  const Icon = isLikedView ? Heart : Clock;
  const accentColor = isLikedView ? 'text-aura-neonPink' : 'text-aura-neonCyan';
  const badgeGradient = isLikedView
    ? 'from-pink-600/30 to-purple-900/40 border-pink-500/30 text-pink-300'
    : 'from-cyan-600/30 to-blue-900/40 border-cyan-500/30 text-cyan-300';

  const filteredSongs = songs.filter((s) => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto px-6 py-4 bg-aura-bg select-none scrollbar-thin">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5 mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
              isLikedView ? 'from-pink-500/20 to-purple-600/30 border-pink-500/40' : 'from-cyan-500/20 to-blue-600/30 border-cyan-500/40'
            } border flex items-center justify-center shadow-neon flex-shrink-0`}
          >
            <Icon className={`w-8 h-8 ${accentColor}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeGradient}`}>
                {isLikedView ? 'FAVORITAS' : 'GUARDADAS'}
              </span>
              <span className="text-xs text-aura-subtext font-mono">
                {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">{title}</h1>
            <p className="text-xs text-aura-subtext mt-0.5 max-w-xl">{description}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {songs.length > 0 && (
            <>
              <button
                onClick={() => onPlayAll(filteredSongs)}
                className="flex-1 sm:flex-none px-4 py-2 bg-aura-accent hover:bg-aura-accent/90 text-white text-xs font-semibold rounded-xl transition shadow-neon flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Reproducir</span>
              </button>

              <button
                onClick={() => onShuffleAll(filteredSongs)}
                className="p-2 bg-white/5 hover:bg-white/10 text-aura-subtext hover:text-white rounded-xl transition border border-white/10 cursor-pointer"
                title="Reproducción aleatoria"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </>
          )}

          {onOpenGoogleLogin && (
            <button
              onClick={onOpenGoogleLogin}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-aura-subtext hover:text-white text-xs rounded-xl transition border border-white/10 flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
              title="Sincronizar cuenta de Google"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Google Sync</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter search bar inside library */}
      {songs.length > 4 && (
        <div className="relative mb-4 max-w-md">
          <Search className="w-4 h-4 text-aura-subtext absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder={`Buscar en ${title.toLowerCase()}...`}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-aura-subtext focus:outline-none focus:border-aura-accent/50"
          />
        </div>
      )}

      {/* Track List */}
      {songs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-aura-subtext">
            <Icon className="w-6 h-6 opacity-40" />
          </div>
          <p className="text-sm font-semibold text-white">No tienes canciones aquí todavía</p>
          <p className="text-xs text-aura-subtext mt-1 max-w-sm">
            {isLikedView
              ? 'Haz clic en el icono del corazón ❤️ en cualquier canción que esté sonando para guardarla aquí.'
              : 'Toca el icono del reloj 🕒 en cualquier pista para escucharla más tarde.'}
          </p>

          {onGoToExplore && (
            <button
              onClick={onGoToExplore}
              className="mt-4 px-4 py-2 bg-aura-accent/20 hover:bg-aura-accent/30 text-aura-accent text-xs font-medium rounded-xl border border-aura-accent/30 transition cursor-pointer"
            >
              Explorar canciones en tendencia
            </button>
          )}
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="p-8 text-center text-xs text-aura-subtext">
          No se encontraron canciones que coincidan con "{filterText}".
        </div>
      ) : (
        <div className="space-y-1">
          {filteredSongs.map((song, idx) => (
            <div
              key={`${song.id || song.videoId}-${idx}`}
              className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] transition border border-transparent hover:border-white/5 cursor-pointer"
              onClick={() => onPlaySong(song)}
            >
              {/* Left: Index & Artwork */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <span className="w-5 text-center text-xs text-aura-subtext/60 font-mono group-hover:hidden">
                  {idx + 1}
                </span>
                <span className="w-5 text-center text-xs text-aura-accent hidden group-hover:inline-block">
                  <Play className="w-3.5 h-3.5 fill-current mx-auto" />
                </span>

                <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-aura-accent transition">
                    {cleanSongTitle(song.title, song.artist)}
                  </p>
                  <p className="text-[11px] text-aura-subtext truncate">
                    {cleanArtistName(song.artist, song.title)}
                  </p>
                </div>
              </div>

              {/* Right: Duration & Actions */}
              <div className="flex items-center gap-2 pl-3">
                <span className="text-xs font-mono text-aura-subtext/60">{song.durationFormatted || '3:30'}</span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSongToQueue(song);
                    }}
                    className="p-1.5 text-aura-subtext hover:text-white rounded-lg hover:bg-white/10 transition"
                    title="Añadir a la cola"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromList(song);
                    }}
                    className="p-1.5 text-aura-subtext hover:text-aura-neonPink rounded-lg hover:bg-white/10 transition"
                    title="Quitar de la lista"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
