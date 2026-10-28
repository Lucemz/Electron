import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Search, Play, Plus, X, Loader2, Clock, BrainCircuit } from 'lucide-react';
import { SearchResultItem, Song } from '../types';
import { cleanSongTitle, cleanArtistName } from '../utils/textCleaner';

interface PromptBarProps {
  onPromptSubmit: (prompt: string) => void;
  onPlayDirectSong: (song: Song) => void;
  onAddSongToQueue: (song: Song) => void;
  onToggleWatchLater?: (song: Song) => void;
  isLoading: boolean;
  aiProgressStep?: string | null;
}

const NATURAL_KEYWORDS = [
  'para', 'algo', 'quiero', 'como', 'estilo', 'tipo', 'vibra', 'vibe', 'momento',
  'triste', 'desamor', 'llorar', 'estudiar', 'concentrar', 'programar', 'dormir',
  'relajar', 'gym', 'entrenar', 'fiesta', 'perreo', 'bailar', 'manejar', 'noche',
  'caleta', 'buena', 'buenas', 'rolitas', 'rolita', 'musica', 'canciones', 'cancion',
  'bajon', 'recuerdo', 'parecido', 'tranqui', 'motiva', 'pesado', 'viaje', 'carretera',
];

export const PromptBar: React.FC<PromptBarProps> = ({
  onPromptSubmit,
  onPlayDirectSong,
  onAddSongToQueue,
  onToggleWatchLater,
  isLoading,
  aiProgressStep,
}) => {
  const [mode, setMode] = useState<'ai' | 'search'>('ai');
  const [input, setInput] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect whether current query is a natural language sentence
  const isNaturalLanguage = (text: string): boolean => {
    const clean = text.toLowerCase().trim();
    const words = clean.split(/\s+/);
    if (words.length >= 3) {
      return NATURAL_KEYWORDS.some((kw) => clean.includes(kw));
    }
    return false;
  };

  const isNaturalQuery = isNaturalLanguage(input);

  // Handle Search Input in direct search mode
  const handleDirectSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      if (window.auraAPI?.searchMultipleYouTube) {
        const results = await window.auraAPI.searchMultipleYouTube(query, 6);
        setSearchResults(results);
      }
    } catch (err) {
      console.error('Error during direct search:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    if (mode === 'search') {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        handleDirectSearch(val);
      }, 300);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // If user is in search mode but typed natural language, seamlessly route to AI Curador
    if (mode === 'search' && isNaturalQuery) {
      setMode('ai');
      setShowResults(false);
      onPromptSubmit(input.trim());
      setInput('');
      return;
    }

    if (mode === 'ai') {
      onPromptSubmit(input.trim());
      setInput('');
    } else {
      handleDirectSearch(input.trim());
    }
  };

  const triggerCurateFromSearch = () => {
    if (!input.trim()) return;
    setMode('ai');
    setShowResults(false);
    onPromptSubmit(input.trim());
    setInput('');
  };

  const convertSearchResultToSong = (item: SearchResultItem): Song => ({
    id: `${item.videoId}-${Date.now()}`,
    title: cleanSongTitle(item.title, item.artist) || item.title,
    artist: cleanArtistName(item.artist, item.title) || item.artist,
    videoId: item.videoId,
    thumbnail: item.thumbnail,
    duration: item.duration,
    durationFormatted: item.durationFormatted,
    aiReason: 'Búsqueda directa de pista individual.',
    bpm: 100,
    energy: 'medium',
    alternativeVideoIds: [],
  });

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center gap-2 relative">
      {/* Clean Mode Switcher Tabs */}
      <div className="flex items-center gap-1 bg-aura-surface/90 p-1 rounded-2xl border border-white/5 backdrop-blur-md shadow-sm">
        <button
          type="button"
          onClick={() => {
            setMode('ai');
            setShowResults(false);
          }}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            mode === 'ai'
              ? 'bg-aura-accent text-white shadow-neon'
              : 'text-aura-subtext hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Buscador IA (Contextual)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('search');
            if (input.trim()) handleDirectSearch(input.trim());
          }}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            mode === 'search'
              ? 'bg-aura-accent text-white shadow-neon'
              : 'text-aura-subtext hover:text-white hover:bg-white/5'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Pista Exacta (Singles)</span>
        </button>
      </div>

      {/* Main Input Bar */}
      <form onSubmit={handleSubmit} className="w-full relative group">
        <div
          className={`absolute -inset-0.5 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500 ${
            mode === 'ai'
              ? 'bg-gradient-to-r from-aura-accent via-aura-neonCyan to-aura-neonPink'
              : 'bg-gradient-to-r from-aura-neonCyan to-aura-accent'
          }`}
        />

        <div className="relative flex items-center bg-aura-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
          {mode === 'ai' ? (
            <Sparkles className={`w-5 h-5 mr-3 text-aura-accent ${isLoading ? 'animate-spin' : 'animate-pulse'}`} />
          ) : (
            <Search className="w-5 h-5 mr-3 text-aura-neonCyan" />
          )}

          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            disabled={isLoading && mode === 'ai'}
            placeholder={
              mode === 'ai'
                ? isLoading
                  ? 'Aura IA está analizando el contexto y seleccionando canciones...'
                  : 'Escribe en lenguaje natural: "música para concentrarme", "algo triste de desamor", "reggaeton viejo"...'
                : 'Escribe el nombre exacto de la canción o artista...'
            }
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-aura-subtext focus:outline-none"
          />

          {input && (
            <button
              type="button"
              onClick={() => {
                setInput('');
                setSearchResults([]);
                setShowResults(false);
              }}
              className="p-1 mr-2 text-aura-subtext hover:text-white rounded-full hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={!input.trim() || (isLoading && mode === 'ai')}
            className="px-3.5 py-1.5 bg-aura-accent hover:bg-aura-accent/90 disabled:opacity-40 text-white text-xs font-medium rounded-xl transition shadow-neon flex items-center gap-1.5 cursor-pointer"
          >
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : mode === 'ai' ? (
              <span>Curar con IA</span>
            ) : (
              <span>Buscar</span>
            )}
            <kbd className="hidden sm:inline-block text-[10px] bg-black/30 px-1.5 py-0.5 rounded border border-white/20">↵</kbd>
          </button>
        </div>
      </form>

      {/* Subtext info pill clarifying Contextual Understanding */}
      {mode === 'ai' && !aiProgressStep && (
        <div className="flex items-center gap-1.5 text-[11px] text-aura-subtext/80 px-2">
          <BrainCircuit className="w-3 h-3 text-aura-accent" />
          <span>Entiende estados de ánimo, situaciones y vibras sin exigir títulos literales.</span>
        </div>
      )}

      {/* Live AI Processing Indicator Ticker */}
      {aiProgressStep && (
        <div className="flex items-center gap-2 text-xs font-medium text-aura-accent bg-aura-surface/80 border border-aura-accent/30 px-3.5 py-1.5 rounded-full shadow-glass animate-in fade-in zoom-in-95 duration-200">
          <Sparkles className="w-3.5 h-3.5 animate-spin text-aura-neonCyan" />
          <span>{aiProgressStep}</span>
        </div>
      )}

      {/* Global Search Results Dropdown (Clean singles only) */}
      {mode === 'search' && showResults && (
        <div className="w-full bg-aura-surface/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto space-y-1 mt-1 animate-in fade-in duration-200">
          {/* Smart Contextual Suggestion Banner */}
          {isNaturalQuery && (
            <div className="flex items-center justify-between p-2.5 mb-2 bg-aura-accent/15 border border-aura-accent/30 rounded-xl">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-aura-accent flex-shrink-0 animate-pulse" />
                <span className="text-xs text-white truncate">
                  Detectamos una vibra o contexto: <strong>"{input}"</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={triggerCurateFromSearch}
                className="px-3 py-1 bg-aura-accent hover:bg-aura-accent/90 text-white text-xs font-semibold rounded-lg shadow-neon flex-shrink-0 cursor-pointer transition"
              >
                Curar con IA
              </button>
            </div>
          )}

          <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-mono text-aura-subtext border-b border-white/5 mb-1">
            <span>Pistas individuales encontradas (sin recopilaciones)</span>
            {isSearching && <span className="text-aura-accent animate-pulse">Buscando...</span>}
          </div>

          {searchResults.length === 0 && !isSearching && (
            <div className="p-4 text-center text-xs text-aura-subtext">
              No se encontraron pistas individuales para este término exacto.
              {isNaturalQuery && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={triggerCurateFromSearch}
                    className="text-aura-accent underline hover:text-white"
                  >
                    Haz clic aquí para que la IA interprete este contexto musical
                  </button>
                </div>
              )}
            </div>
          )}

          {searchResults.map((item) => {
            const cleanTitle = cleanSongTitle(item.title, item.artist);
            const cleanArtist = cleanArtistName(item.artist, item.title);

            return (
              <div
                key={item.videoId}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 transition group/item"
              >
                {/* Left: Thumbnail & Title */}
                <div
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    onPlayDirectSong(convertSearchResultToSong(item));
                    setShowResults(false);
                  }}
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0">
                    <img src={item.thumbnail} alt={cleanTitle} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate group-hover/item:text-aura-accent transition">
                      {cleanTitle}
                    </p>
                    <p className="text-[11px] text-aura-subtext truncate">{cleanArtist}</p>
                  </div>
                </div>

                {/* Right: Duration & Actions */}
                <div className="flex items-center gap-2 pl-3">
                  <span className="text-[11px] font-mono text-aura-subtext hidden sm:inline-block">
                    {item.durationFormatted}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      onPlayDirectSong(convertSearchResultToSong(item));
                      setShowResults(false);
                    }}
                    className="px-2.5 py-1 bg-white/10 hover:bg-aura-accent text-white text-[11px] font-medium rounded-lg transition flex items-center gap-1 cursor-pointer"
                    title="Reproducir ahora"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span className="hidden sm:inline">Play</span>
                  </button>

                  {onToggleWatchLater && (
                    <button
                      type="button"
                      onClick={() => {
                        onToggleWatchLater(convertSearchResultToSong(item));
                        setShowResults(false);
                      }}
                      className="p-1.5 bg-white/5 hover:bg-white/15 text-aura-subtext hover:text-white rounded-lg transition cursor-pointer"
                      title="Guardar en Ver más tarde"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onAddSongToQueue(convertSearchResultToSong(item));
                      setShowResults(false);
                    }}
                    className="p-1.5 bg-white/5 hover:bg-white/15 text-aura-subtext hover:text-white rounded-lg transition cursor-pointer"
                    title="Añadir a la cola"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
