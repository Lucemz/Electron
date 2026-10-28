import React, { useState, useEffect } from 'react';
import { getStoredApiKey, saveStoredApiKey } from '../services/aiDjService';
import { Key, X, ExternalLink, Sparkles, Check, Globe, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setSaved(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!window.auraAPI?.onAuthSuccess) return;
    const unbind = window.auraAPI.onAuthSuccess(() => {
      setAuthSuccess(true);
      setIsLoggingIn(false);
    });
    return () => unbind();
  }, []);

  if (!isOpen) return null;

  const handleSave = () => {
    saveStoredApiKey(apiKey);
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleLogin = async () => {
    if (window.auraAPI?.openGoogleLogin) {
      setIsLoggingIn(true);
      await window.auraAPI.openGoogleLogin();
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-aura-surface border border-white/10 rounded-3xl p-6 shadow-2xl relative space-y-5">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-aura-subtext hover:text-white rounded-full hover:bg-white/5 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-aura-accent/20 border border-aura-accent/30 flex items-center justify-center text-aura-accent">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Ajustes de Aura</h3>
            <p className="text-xs text-aura-subtext">Cuenta de YouTube y modelo de IA</p>
          </div>
        </div>

        {/* Section 1: YouTube / Google Account */}
        <div className="bg-aura-card border border-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-aura-neonCyan" />
              <h4 className="text-sm font-semibold text-white">Cuenta de YouTube</h4>
            </div>
            {authSuccess && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono">
                <Check className="w-3 h-3" />
                Conectado
              </span>
            )}
          </div>
          <p className="text-xs text-aura-subtext leading-relaxed">
            Inicia sesión con tu cuenta de YouTube / Google (con soporte para Touch ID, llaves de paso o aviso en el móvil) para sincronizar tus me gusta y activar YouTube Premium.
          </p>

          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-aura-neonCyan" />
            <span>
              {isLoggingIn
                ? 'Abriendo inicio de sesión oficial...'
                : authSuccess
                ? 'Sesión Conectada (Re-vincular)'
                : 'Iniciar Sesión en YouTube'}
            </span>
          </button>

          <div className="flex items-center gap-2 text-[11px] text-emerald-400/90 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Bloqueador de anuncios de red activo: Cero anuncios en la reproducción.</span>
          </div>
        </div>

        {/* Section 2: Gemini API Key */}
        <div className="bg-aura-card border border-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-aura-accent" />
              <h4 className="text-sm font-semibold text-white">Cerebro AI (Google Gemini)</h4>
            </div>
            <span className="text-[10px] text-aura-accent font-mono bg-aura-accent/10 px-2 py-0.5 rounded-full">
              Opcional
            </span>
          </div>
          <p className="text-xs text-aura-subtext leading-relaxed">
            Para análisis musicológico profundo en el DJ Chat (BPM, armonía y conversación en vivo).
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full bg-aura-surface border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-aura-subtext/40 focus:outline-none focus:border-aura-accent"
          />
          <div className="flex items-center justify-between text-[11px] pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-aura-accent hover:underline flex items-center gap-1"
            >
              <span>Obtener clave gratis en Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            {apiKey && (
              <button
                type="button"
                onClick={() => setApiKey('')}
                className="text-aura-subtext hover:text-white"
              >
                Borrar clave
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-aura-subtext hover:text-white rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-aura-accent hover:bg-aura-accent/90 text-white text-xs font-semibold rounded-xl transition shadow-neon flex items-center gap-1.5 cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Guardado</span>
              </>
            ) : (
              <span>Guardar cambios</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
