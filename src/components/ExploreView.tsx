import React, { useState, useEffect } from 'react';
import { Song, ExploreData, ExploreItem, MoodCategory } from '../types';
import {
  Compass,
  Flame,
  Disc,
  Play,
  Heart,
  Clock,
  Plus,
  Loader2,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Music2,
  RefreshCw,
} from 'lucide-react';
import { cleanSongTitle, cleanArtistName } from '../utils/textCleaner';

interface ExploreViewProps {
  onPlaySong: (song: Song) => void;
  onAddSongToQueue: (song: Song) => void;
  onToggleLike: (song: Song) => void;
  onToggleWatchLater: (song: Song) => void;
  onAskDjWithVibe?: (prompt: string) => void;
  likedSongIds: Set<string>;
  watchLaterSongIds: Set<string>;
}

// Mood styling with color gradients
const MOOD_GRADIENTS: Record<string, string> = {
  Calma: 'from-teal-600/40 to-emerald-900/60 border-teal-500/30 text-teal-200',
  Concentración: 'from-indigo-600/40 to-blue-900/60 border-indigo-500/30 text-indigo-200',
  Dormir: 'from-purple-900/50 to-slate-900/70 border-purple-500/30 text-purple-200',
  Ejercicio: 'from-rose-600/40 to-red-900/60 border-rose-500/30 text-rose-200',
  Energía: 'from-amber-600/40 to-orange-900/60 border-amber-500/30 text-amber-200',
  Fiesta: 'from-fuchsia-600/40 to-pink-900/60 border-fuchsia-500/30 text-fuchsia-200',
  Romance: 'from-pink-600/40 to-rose-900/60 border-pink-500/30 text-pink-200',
  Triste: 'from-blue-800/40 to-slate-900/60 border-blue-500/30 text-blue-200',
  Relax: 'from-cyan-600/40 to-sky-900/60 border-cyan-500/30 text-cyan-200',
  default: 'from-white/10 to-white/5 border-white/10 text-white',
};

export const ExploreView: React.FC<ExploreViewProps> = ({
  onPlaySong,
  onAddSongToQueue,
  onToggleLike,
  onToggleWatchLater,
  onAskDjWithVibe,
  likedSongIds,
  watchLaterSongIds,
}) => {
  const [exploreData, setExploreData] = useState<ExploreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<{ title: string; items: ExploreItem[] } | null>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);

  const fetchExplore = async () => {
    setIsLoading(true);
    try {
      if (window.auraAPI?.getYouTubeExplore) {
        const data = await window.auraAPI.getYouTubeExplore();
        setExploreData(data);
      }
    } catch (err) {
      console.error('Error fetching explore data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExplore();
  }, []);

  const convertExploreItemToSong = (item: ExploreItem, reason = 'Explorar de YouTube Music'): Song => {
    const videoId = item.videoId || 'dQw4w9WgXcQ';
    const cleanTitle = cleanSongTitle(item.title, item.artist);
    const cleanArtist = cleanArtistName(item.artist || 'Artista Destacado', item.title);

    return {
      id: `${videoId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: cleanTitle,
      artist: cleanArtist,
      videoId,
      thumbnail: item.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: 210,
      durationFormatted: item.durationFormatted || '3:30',
      aiReason: reason,
      bpm: 105,
      energy: 'medium',
      isLiked: likedSongIds.has(videoId),
      isSavedWatchLater: watchLaterSongIds.has(videoId),
    };
  };

  // Click on Mood or New Release Album
  const handleSelectMoodOrAlbum = async (title: string, browseId?: string, params?: string) => {
    if (!browseId && !params) {
      // Trigger AI DJ if no browseId
      if (onAskDjWithVibe) onAskDjWithVibe(`Música para ${title}`);
      return;
    }

    setIsLoadingCategory(true);
    setSelectedCategory({ title, items: [] });

    try {
      if (window.auraAPI?.getYouTubeCategory && browseId) {
        const items = await window.auraAPI.getYouTubeCategory(browseId, params);
        setSelectedCategory({ title, items });
      }
    } catch (e) {
      console.error('Error fetching category:', e);
    } finally {
      setIsLoadingCategory(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto px-6 py-4 bg-aura-bg select-none scrollbar-thin">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-aura-neonCyan/20 to-aura-accent/20 border border-aura-neonCyan/30 flex items-center justify-center shadow-neon">
            <Compass className="w-5 h-5 text-aura-neonCyan" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Explorar YouTube Music
              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                En vivo
              </span>
            </h1>
            <p className="text-xs text-aura-subtext">
              Tendencias mundiales, nuevos lanzamientos y categorías sonoras de YouTube Music.
            </p>
          </div>
        </div>

        <button
          onClick={fetchExplore}
          disabled={isLoading}
          className="p-2 text-aura-subtext hover:text-white rounded-xl hover:bg-white/5 transition border border-white/10"
          title="Actualizar catálogo"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-aura-accent' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <Loader2 className="w-8 h-8 text-aura-neonCyan animate-spin mb-3" />
          <p className="text-sm font-medium text-white">Conectando con el catálogo de YouTube Music...</p>
          <p className="text-xs text-aura-subtext mt-1">Cargando listas de éxitos y nuevos lanzamientos oficiales</p>
        </div>
      ) : selectedCategory ? (
        /* Sub-View: Detailed Category / Album Tracks */
        <div className="space-y-4 animate-in fade-in duration-200">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-xs font-semibold text-aura-accent hover:text-white transition px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 w-fit cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Explorar</span>
          </button>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-wide">{selectedCategory.title}</h2>
            {onAskDjWithVibe && (
              <button
                onClick={() => onAskDjWithVibe(`Música para ${selectedCategory.title}`)}
                className="flex items-center gap-1.5 text-xs text-aura-neonCyan bg-aura-neonCyan/10 border border-aura-neonCyan/30 px-3 py-1.5 rounded-xl hover:bg-aura-neonCyan/20 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curar con AI DJ</span>
              </button>
            )}
          </div>

          {isLoadingCategory ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 text-aura-accent animate-spin" />
            </div>
          ) : selectedCategory.items.length === 0 ? (
            <div className="p-8 text-center text-xs text-aura-subtext">
              No se encontraron pistas para esta categoría. Intenta curar con el AI DJ.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedCategory.items.map((item, idx) => {
                const isLiked = item.videoId ? likedSongIds.has(item.videoId) : false;
                const isWatchLater = item.videoId ? watchLaterSongIds.has(item.videoId) : false;

                return (
                  <div
                    key={`${item.videoId || item.browseId}-${idx}`}
                    className="group flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition cursor-pointer"
                    onClick={() => {
                      if (item.videoId) {
                        onPlaySong(convertExploreItemToSong(item, selectedCategory.title));
                      } else if (item.browseId) {
                        handleSelectMoodOrAlbum(item.title, item.browseId);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-aura-accent transition">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-aura-subtext truncate">{item.artist}</p>
                      </div>
                    </div>

                    {item.videoId && (
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition pl-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLike(convertExploreItemToSong(item));
                          }}
                          className={`p-1.5 rounded-lg hover:bg-white/10 transition ${
                            isLiked ? 'text-aura-neonPink fill-aura-neonPink' : 'text-aura-subtext hover:text-white'
                          }`}
                          title="Me gusta"
                        >
                          <Heart className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWatchLater(convertExploreItemToSong(item));
                          }}
                          className={`p-1.5 rounded-lg hover:bg-white/10 transition ${
                            isWatchLater ? 'text-aura-neonCyan' : 'text-aura-subtext hover:text-white'
                          }`}
                          title="Ver más tarde"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddSongToQueue(convertExploreItemToSong(item));
                          }}
                          className="p-1.5 text-aura-subtext hover:text-white hover:bg-white/10 rounded-lg transition"
                          title="Añadir a la cola"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Main Explore Hub */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* SECTION 1: Moods & Genres (Ánimo y géneros) */}
          {exploreData?.moodsAndGenres && exploreData.moodsAndGenres.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-aura-neonCyan" />
                  <span>Ánimo y Géneros Musicales</span>
                </h2>
                <span className="text-xs text-aura-subtext">{exploreData.moodsAndGenres.length} categorías</span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {exploreData.moodsAndGenres.map((mood) => {
                  const gradient = MOOD_GRADIENTS[mood.title] || MOOD_GRADIENTS.default;

                  return (
                    <button
                      key={mood.title}
                      onClick={() => handleSelectMoodOrAlbum(mood.title, mood.browseId, mood.params)}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-2xl bg-gradient-to-br ${gradient} border text-xs font-semibold tracking-wide hover:scale-105 transition-all shadow-glass flex items-center gap-2 cursor-pointer`}
                    >
                      <span>{mood.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: Tendencias de YouTube Music (Trending) */}
          {exploreData?.trending && exploreData.trending.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-mono flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Tendencias en YouTube Music</span>
                </h2>
                <button
                  onClick={() => {
                    const first = exploreData.trending[0];
                    if (first?.videoId) onPlaySong(convertExploreItemToSong(first, 'Tendencias'));
                  }}
                  className="text-xs text-aura-accent hover:text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Reproducir todas</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {exploreData.trending.slice(0, 8).map((item, idx) => {
                  const isLiked = item.videoId ? likedSongIds.has(item.videoId) : false;
                  const isWatchLater = item.videoId ? watchLaterSongIds.has(item.videoId) : false;

                  return (
                    <div
                      key={item.videoId || idx}
                      className="group relative flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition cursor-pointer"
                      onClick={() => onPlaySong(convertExploreItemToSong(item, 'Tendencias YouTube Music'))}
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-black shadow-md">
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-aura-accent transition">
                          {cleanSongTitle(item.title, item.artist)}
                        </p>
                        <p className="text-[11px] text-aura-subtext truncate mt-0.5">
                          {cleanArtistName(item.artist || '', item.title)}
                        </p>
                      </div>

                      {/* Floating actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLike(convertExploreItemToSong(item));
                          }}
                          className={`p-1.5 rounded-lg hover:bg-white/10 transition ${
                            isLiked ? 'text-aura-neonPink fill-aura-neonPink' : 'text-aura-subtext hover:text-white'
                          }`}
                          title="Me gusta"
                        >
                          <Heart className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWatchLater(convertExploreItemToSong(item));
                          }}
                          className={`p-1.5 rounded-lg hover:bg-white/10 transition ${
                            isWatchLater ? 'text-aura-neonCyan' : 'text-aura-subtext hover:text-white'
                          }`}
                          title="Ver más tarde"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: Nuevos Lanzamientos (New Releases) */}
          {exploreData?.newReleases && exploreData.newReleases.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-mono flex items-center gap-2">
                  <Disc className="w-4 h-4 text-purple-400" />
                  <span>Álbumes y Singles Nuevos</span>
                </h2>
                <span className="text-xs text-aura-subtext">{exploreData.newReleases.length} lanzamientos</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {exploreData.newReleases.slice(0, 12).map((item, idx) => (
                  <div
                    key={`${item.browseId || item.title}-${idx}`}
                    className="group flex flex-col p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition cursor-pointer"
                    onClick={() => handleSelectMoodOrAlbum(item.title, item.browseId)}
                  >
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black shadow-lg mb-2">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <Play className="w-6 h-6 text-white fill-white shadow-neon" />
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-white truncate group-hover:text-aura-accent transition">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-aura-subtext truncate mt-0.5">{item.artist}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
