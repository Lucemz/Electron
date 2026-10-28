import React, { useState, useEffect, useCallback } from 'react';
import {
  getStoredApiKey,
  saveStoredApiKey,
  getStoredModel,
  saveStoredModel,
  getStoredThinkingBudget,
  saveStoredThinkingBudget,
  validateGeminiApiKey,
} from '../services/aiDjService';
import { UserProfile } from '../types';
import {
  Key,
  X,
  ExternalLink,
  Sparkles,
  Check,
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  BrainCircuit,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [thinkingBudget, setThinkingBudget] = useState(2048);
  const [saved, setSaved] = useState(false);

  // Gemini token validation state
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidation, setKeyValidation] = useState<{ valid: boolean; error?: string } | null>(
    null
  );

  // Account & Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showWebSync, setShowWebSync] = useState(false);

  const checkToken = useCallback(async (keyToCheck: string) => {
    if (!keyToCheck.trim()) {
      setKeyValidation(null);
      return;
    }
    setIsValidatingKey(true);
    const result = await validateGeminiApiKey(keyToCheck);
    setKeyValidation(result);
    setIsValidatingKey(false);
  }, []);

  const loadProfile = useCallback(async () => {
    if (window.auraAPI?.getUserProfile) {
      try {
        const p = await window.auraAPI.getUserProfile();
        setUserProfile(p);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const storedKey = getStoredApiKey();
      setApiKey(storedKey);
      setModel(getStoredModel());
      setThinkingBudget(getStoredThinkingBudget());
      setSaved(false);

      if (storedKey) {
        checkToken(storedKey);
      } else {
        setKeyValidation(null);
      }

      loadProfile();
    }
  }, [isOpen, checkToken, loadProfile]);

  useEffect(() => {
    if (!window.auraAPI?.onAuthSuccess) return;
    const unbind = window.auraAPI.onAuthSuccess(() => {
      loadProfile();
      setIsLoggingIn(false);
    });
    return () => unbind();
  }, [loadProfile]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveStoredApiKey(apiKey);
    saveStoredModel(model);
    saveStoredThinkingBudget(thinkingBudget);
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleDirectLogin = async () => {
    setIsLoggingIn(true);
    if (window.auraAPI?.openGoogleLogin) {
      await window.auraAPI.openGoogleLogin();
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    if (window.auraAPI?.logout) {
      await window.auraAPI.logout();
      setUserProfile(null);
    }
  };

  const handleBrowserLogin = async () => {
    if (window.auraAPI?.openBrowserLogin) {
      await window.auraAPI.openBrowserLogin();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-aura-surface border border-white/10 rounded-3xl p-6 shadow-2xl relative space-y-5 my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-aura-subtext hover:text-white rounded-full hover:bg-white/5 transition cursor-pointer"
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
            <p className="text-xs text-aura-subtext">Cuenta de Google y modelo de IA</p>
          </div>
        </div>

        {/* Section 1: YouTube / Google Account */}
        <div className="bg-aura-card border border-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-aura-neonCyan" />
              <h4 className="text-sm font-semibold text-white">Cuenta de YouTube</h4>
            </div>
            {userProfile?.loggedIn ? (
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Conectado
              </span>
            ) : (
              <span className="text-[10px] text-aura-subtext/70 bg-white/5 px-2 py-0.5 rounded-full font-mono">
                No vinculado
              </span>
            )}
          </div>

          {/* User Profile Card if logged in */}
          {userProfile?.loggedIn ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                {userProfile.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-aura-accent/20 flex items-center justify-center text-aura-accent">
                    <UserCheck className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {userProfile.name}
                  </div>
                  {userProfile.email && (
                    <div className="text-xs text-aura-subtext truncate">{userProfile.email}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDirectLogin}
                  disabled={isLoggingIn}
                  className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoggingIn ? 'animate-spin' : ''}`} />
                  <span>Cambiar cuenta</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-aura-subtext leading-relaxed">
                Inicia sesión con tu cuenta de YouTube / Google para sincronizar tus me gusta y ver más tarde. Admite notificación al móvil o Touch ID sin necesidad de escribir contraseñas.
              </p>

              <button
                type="button"
                onClick={handleDirectLogin}
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 bg-aura-accent hover:bg-aura-accent/90 border border-aura-accent/30 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-neon"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Abriendo acceso oficial de Google...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 text-white" />
                    <span>Iniciar Sesión en YouTube / Google</span>
                  </>
                )}
              </button>

              <div className="pt-0.5 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => setShowWebSync(!showWebSync)}
                  className="text-aura-subtext hover:text-white transition cursor-pointer"
                >
                  {showWebSync ? 'Ocultar opciones web' : '¿Prefieres vincular con tu navegador Chrome?'}
                </button>
              </div>

              {showWebSync && (
                <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl space-y-2">
                  <p className="text-[11px] text-aura-subtext">
                    Abre YouTube Music en tu navegador habitual y vincula tus cookies directamente:
                  </p>
                  <button
                    type="button"
                    onClick={handleBrowserLogin}
                    className="w-full py-1.5 px-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs rounded-lg transition cursor-pointer"
                  >
                    Abrir enlace de sincronización en navegador ↗
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-emerald-400/90 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Bloqueador de anuncios de red activo: Cero anuncios en la reproducción.</span>
          </div>
        </div>

        {/* Section 2: Gemini API Key & Token Verification */}
        <div className="bg-aura-card border border-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-aura-accent" />
              <h4 className="text-sm font-semibold text-white">Token de Google Gemini</h4>
            </div>

            {/* Validation Badge */}
            {isValidatingKey ? (
              <span className="flex items-center gap-1 text-[10px] text-aura-neonCyan bg-aura-neonCyan/10 px-2 py-0.5 rounded-full font-mono">
                <Loader2 className="w-3 h-3 animate-spin" />
                Verificando...
              </span>
            ) : keyValidation?.valid ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                <CheckCircle2 className="w-3 h-3" />
                Token válido
              </span>
            ) : keyValidation && !keyValidation.valid ? (
              <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full font-mono">
                <AlertCircle className="w-3 h-3" />
                Token inválido
              </span>
            ) : (
              <span className="text-[10px] text-aura-accent font-mono bg-aura-accent/10 px-2 py-0.5 rounded-full">
                Opcional
              </span>
            )}
          </div>

          <p className="text-xs text-aura-subtext leading-relaxed">
            Para análisis armónico, generación musical inteligente y conversación en vivo con el DJ.
          </p>

          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                const val = e.target.value;
                setApiKey(val);
                checkToken(val);
              }}
              placeholder="AIzaSy..."
              className="w-full bg-aura-surface border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-aura-subtext/40 focus:outline-none focus:border-aura-accent pr-24"
            />
            {apiKey && (
              <button
                type="button"
                onClick={() => checkToken(apiKey)}
                className="absolute right-2 top-2 px-2.5 py-1 text-[11px] bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
              >
                Comprobar
              </button>
            )}
          </div>

          {/* Error explanation if invalid */}
          {keyValidation && !keyValidation.valid && (
            <div className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{keyValidation.error}</span>
            </div>
          )}

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
                onClick={() => {
                  setApiKey('');
                  setKeyValidation(null);
                }}
                className="text-aura-subtext hover:text-white"
              >
                Borrar clave
              </button>
            )}
          </div>
        </div>

        {/* Section 3: Model Selection & Reasoning (Thinking Budget) */}
        <div className="bg-aura-card border border-white/5 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-aura-neonPink" />
            <h4 className="text-sm font-semibold text-white">Modelo y Razonamiento</h4>
          </div>

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-aura-subtext font-medium flex items-center justify-between">
              <span>Modelo Gemini</span>
              <span className="text-[10px] text-aura-subtext/60 font-mono">Generación</span>
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-aura-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-aura-accent cursor-pointer"
            >
              <option value="gemini-2.5-flash">
                Gemini 2.5 Flash (Ultrarrápido y preciso - Recomendado)
              </option>
              <option value="gemini-2.5-pro">
                Gemini 2.5 Pro (Máxima capacidad de razonamiento musical)
              </option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Veloz y versátil)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Clásico)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
          </div>

          {/* Reasoning / Thinking Budget */}
          <div className="space-y-1.5">
            <label className="text-xs text-aura-subtext font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-aura-neonCyan" />
                <span>Nivel de Razonamiento (Thinking)</span>
              </span>
              <span className="text-[10px] text-aura-neonCyan font-mono">
                {thinkingBudget === 0
                  ? 'Sin razonamiento'
                  : thinkingBudget === 2048
                  ? '2,048 tokens'
                  : '8,192 tokens'}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setThinkingBudget(0)}
                className={`py-2 px-2 text-xs rounded-xl border transition cursor-pointer text-center ${
                  thinkingBudget === 0
                    ? 'bg-aura-accent text-white border-aura-accent shadow-neon'
                    : 'bg-white/5 border-white/10 text-aura-subtext hover:text-white'
                }`}
              >
                <div className="font-semibold">Inmediato</div>
                <div className="text-[10px] opacity-70">0 tokens</div>
              </button>

              <button
                type="button"
                onClick={() => setThinkingBudget(2048)}
                className={`py-2 px-2 text-xs rounded-xl border transition cursor-pointer text-center ${
                  thinkingBudget === 2048
                    ? 'bg-aura-accent text-white border-aura-accent shadow-neon'
                    : 'bg-white/5 border-white/10 text-aura-subtext hover:text-white'
                }`}
              >
                <div className="font-semibold">Balanceado</div>
                <div className="text-[10px] opacity-70">2,048 tokens</div>
              </button>

              <button
                type="button"
                onClick={() => setThinkingBudget(8192)}
                className={`py-2 px-2 text-xs rounded-xl border transition cursor-pointer text-center ${
                  thinkingBudget === 8192
                    ? 'bg-aura-accent text-white border-aura-accent shadow-neon'
                    : 'bg-white/5 border-white/10 text-aura-subtext hover:text-white'
                }`}
              >
                <div className="font-semibold">Profundo</div>
                <div className="text-[10px] opacity-70">8,192 tokens</div>
              </button>
            </div>
            <p className="text-[11px] text-aura-subtext/70 pt-0.5">
              El razonamiento permite al DJ analizar tonalidades, BPMs y coherencia armónica antes
              de dar su veredicto.
            </p>
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
