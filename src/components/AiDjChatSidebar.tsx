import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Flame, Sliders, Play, X, Bot, User, Radio, Compass } from 'lucide-react';
import { ChatMessage, CurationSettings, ObscurityLevel, Song } from '../types';

interface AiDjChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onPlaySong: (song: Song) => void;
  curationSettings: CurationSettings;
  onUpdateSettings: (settings: CurationSettings) => void;
  isLoading: boolean;
  currentSong: Song | null;
}

export const AiDjChatSidebar: React.FC<AiDjChatSidebarProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onPlaySong,
  curationSettings,
  onUpdateSettings,
  isLoading,
  currentSong,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleObscurityChange = (level: ObscurityLevel) => {
    onUpdateSettings({ ...curationSettings, obscurityLevel: level });
  };

  const QUICK_PROMPTS = [
    'Quiero algo más underground / caleta',
    'Bájale al tempo y ponme algo íntimo',
    'Más guitarras acústicas y menos electrónica',
    'Mantenme esta misma vibra pero con otros artistas',
  ];

  return (
    <div className="w-96 h-full flex flex-col bg-aura-surface/95 backdrop-blur-2xl border-l border-white/10 z-40 shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-aura-accent to-aura-neonPink flex items-center justify-center text-white shadow-neon">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Aura DJ en Vivo</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-aura-subtext">Tu musicólogo personal</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-aura-subtext hover:text-white rounded-lg hover:bg-white/5 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Obscurity / Rareza Selector */}
      <div className="p-3 bg-aura-card/60 border-b border-white/5 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-aura-subtext font-medium">
          <span className="flex items-center gap-1.5 text-white/90">
            <Sliders className="w-3.5 h-3.5 text-aura-neonCyan" />
            <span>Nivel de Rareza (Curaduría)</span>
          </span>
          <span className="capitalize font-mono text-aura-accent text-[10px]">
            {curationSettings.obscurityLevel === 'underground'
              ? '💎 Joyas Caletas'
              : curationSettings.obscurityLevel === 'hits'
              ? '🏆 Clásicos / Hits'
              : '⚖️ Balanceado'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-aura-surface p-1 rounded-xl border border-white/5 text-[11px]">
          <button
            type="button"
            onClick={() => handleObscurityChange('hits')}
            className={`py-1 rounded-lg font-medium transition cursor-pointer text-center ${
              curationSettings.obscurityLevel === 'hits'
                ? 'bg-white/15 text-white shadow'
                : 'text-aura-subtext hover:text-white'
            }`}
          >
            Éxitos
          </button>
          <button
            type="button"
            onClick={() => handleObscurityChange('balanced')}
            className={`py-1 rounded-lg font-medium transition cursor-pointer text-center ${
              curationSettings.obscurityLevel === 'balanced'
                ? 'bg-aura-accent text-white shadow'
                : 'text-aura-subtext hover:text-white'
            }`}
          >
            Balanceado
          </button>
          <button
            type="button"
            onClick={() => handleObscurityChange('underground')}
            className={`py-1 rounded-lg font-medium transition cursor-pointer text-center ${
              curationSettings.obscurityLevel === 'underground'
                ? 'bg-gradient-to-r from-aura-neonPink to-aura-accent text-white shadow'
                : 'text-aura-subtext hover:text-white'
            }`}
          >
            Caleta
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Compass className="w-10 h-10 text-aura-accent/40 mb-3 animate-spin-slow" />
            <h4 className="text-sm font-semibold text-white mb-1">Conversa con tu DJ</h4>
            <p className="text-xs text-aura-subtext leading-relaxed">
              Dile exactamente qué sientes, qué instrumento quieres escuchar o pídele que busque joyas ocultas.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-aura-accent text-white rounded-tr-sm'
                    : 'bg-aura-card border border-white/10 text-white/95 rounded-tl-sm'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 opacity-60 text-[10px] font-mono">
                  {msg.role === 'user' ? (
                    <>
                      <span>Tú</span>
                      <User className="w-2.5 h-2.5" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-2.5 h-2.5 text-aura-neonCyan" />
                      <span>Aura DJ</span>
                    </>
                  )}
                </div>
                <p>{msg.content}</p>

                {/* Song Cards embedded inside DJ response */}
                {msg.songs && msg.songs.length > 0 && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-white/10">
                    <p className="text-[10px] uppercase font-semibold text-aura-accent tracking-wider">
                      Pistas recomendadas:
                    </p>
                    {msg.songs.map((song) => (
                      <div
                        key={song.id}
                        onClick={() => onPlaySong(song)}
                        className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/5 transition cursor-pointer group"
                      >
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-white truncate group-hover:text-aura-accent">
                            {song.title}
                          </p>
                          <p className="text-[10px] text-aura-subtext truncate">{song.artist}</p>
                        </div>
                        <Play className="w-3 h-3 text-white fill-white opacity-0 group-hover:opacity-100 transition mr-1" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-aura-subtext bg-aura-card p-3 rounded-2xl w-fit animate-pulse border border-white/5">
            <Sparkles className="w-3.5 h-3.5 text-aura-accent animate-spin" />
            <span>El DJ está curando tu petición...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-1.5 overflow-x-auto scrollbar-none flex items-center gap-1.5 text-[10px] border-t border-white/5 bg-aura-card/30">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-aura-subtext hover:text-white transition whitespace-nowrap cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-aura-surface flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          placeholder="Habla con el DJ: 'Más guitarras', 'Quita los carnavales'..."
          className="flex-1 bg-aura-card border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-aura-subtext focus:outline-none focus:border-aura-accent"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2 bg-aura-accent hover:bg-aura-accent/90 disabled:opacity-40 text-white rounded-xl transition shadow-neon cursor-pointer flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
