import { AiRecommendation, CurationSettings, Song } from '../types';
import { getTasteContextForPrompt, recordDislikedSong } from './tasteProfileService';
import { cleanSongTitle, cleanArtistName, isSameOrSimilarSong } from '../utils/textCleaner';

const STORAGE_KEY_API_KEY = 'aura_gemini_api_key';
const STORAGE_KEY_MODEL = 'aura_gemini_model';
const STORAGE_KEY_THINKING = 'aura_gemini_thinking_budget';

export function getStoredApiKey(): string {
  return localStorage.getItem(STORAGE_KEY_API_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function saveStoredApiKey(key: string): void {
  if (key) {
    localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
  }
}

export function getStoredModel(): string {
  return localStorage.getItem(STORAGE_KEY_MODEL) || 'gemini-2.5-flash';
}

export function saveStoredModel(model: string): void {
  localStorage.setItem(STORAGE_KEY_MODEL, model);
}

export function getStoredThinkingBudget(): number {
  const val = localStorage.getItem(STORAGE_KEY_THINKING);
  if (val === null) return 2048; // Default: Moderate reasoning
  return parseInt(val, 10);
}

export function saveStoredThinkingBudget(budget: number): void {
  localStorage.setItem(STORAGE_KEY_THINKING, budget.toString());
}

/**
 * Validates Gemini API Key by checking available models from Google AI Studio
 */
export async function validateGeminiApiKey(
  key: string
): Promise<{ valid: boolean; error?: string }> {
  const cleanKey = key?.trim();
  if (!cleanKey) return { valid: false, error: 'Ingresa una clave para verificar' };
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`
    );
    if (res.ok) {
      return { valid: true };
    }
    const data = await res.json().catch(() => ({}));
    return { valid: false, error: data.error?.message || 'Clave de Google Gemini inválida' };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Error de conexión con Google' };
  }
}

/**
 * Conversational response from the AI DJ
 */
export interface AiDjChatResponse {
  commentary: string;
  recommendations: AiRecommendation[];
}

/**
 * Generates at least 5 similar tracks whenever ANY song is played (Auto-Radio Engine)
 */
export async function getSimilarSongsForTrack(
  song: Song,
  curationSettings?: CurationSettings
): Promise<AiRecommendation[]> {
  const apiKey = getStoredApiKey();

  // 1. If Gemini API is available, ask Gemini for 5 musically compatible tracks
  if (apiKey) {
    try {
      const prompt = `Actúa como el motor de radio musical de Spotify / Apple Music.
El oyente acaba de poner la canción: "${song.title}" del artista: "${song.artist}".
Genera exactamente 5 canciones DIFERENTES pero altamente compatibles y similares en género, vibra, energía y ritmo para continuar la estación.
REGLA INQUEBRANTABLE: ESTÁ ESTRICTAMENTE PROHIBIDO sugerir "${song.title}", remixes de "${song.title}", o cualquier versión de esa misma pista. Cada una de las 5 canciones debe ser un tema distinto de otros artistas del mismo género o del repertorio diferente del mismo artista.
- Si es reggaeton/urbano latino, sugiere otros temas de reggaeton/urbano de nivel similar (Rauw Alejandro, Feid, Jhay Cortez, etc.).
- Si es folclore andino (huaynos, guitarra andina), sugiere otras piezas de folclore andino de maestros similares.
- Si es rock, pop, synthwave o clásica, mantén el mismo universo sonoro exacto.

Devuelve ÚNICAMENTE un array JSON válido (sin markdown ni comillas triples) con 5 objetos:
[
  {
    "title": "Nombre de la Canción",
    "artist": "Nombre del Artista",
    "reason": "Compatible en ritmo y estilo con ${song.title}",
    "bpm": 100,
    "energy": "medium"
  }
]`;

      const model = getStoredModel();
      const thinkingBudget = getStoredThinkingBudget();
      const genConfig: any = {
        temperature: 0.75,
        responseMimeType: 'application/json',
      };
      if (thinkingBudget > 0 && (model.includes('2.5') || model.includes('2.0'))) {
        genConfig.thinkingConfig = { thinkingBudget };
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: genConfig,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Strictly filter out any track similar to the current song
            return parsed.filter((rec) => !isSameOrSimilarSong(rec, song));
          }
        }
      }
    } catch (e) {
      console.warn('[Aura Radio] Gemini radio call failed, falling back to YouTube:', e);
    }
  }

  // 2. Dynamic YouTube Fallback for Radio:
  // Search for the artist's other top singles or hits
  if (window.auraAPI?.searchMultipleYouTube) {
    try {
      const query = `${song.artist} top singles hits audio`;
      const results = await window.auraAPI.searchMultipleYouTube(query, 16);

      const recommendations: AiRecommendation[] = [];
      for (const item of results) {
        const cleanedTitle = cleanSongTitle(item.title, item.artist);
        const candidate = {
          title: cleanedTitle,
          artist: cleanArtistName(item.artist, item.title) || song.artist,
          videoId: item.videoId,
        };

        // Strict deduplication: Do NOT recommend the song currently playing
        if (isSameOrSimilarSong(candidate, song)) {
          continue;
        }

        // Strict deduplication: Do NOT repeat songs already chosen for this radio batch
        const alreadyInBatch = recommendations.some((r) => isSameOrSimilarSong(r, candidate));
        if (alreadyInBatch) {
          continue;
        }

        recommendations.push({
          title: candidate.title,
          artist: candidate.artist,
          reason: `Radio afín a ${song.artist}.`,
          bpm: 100,
          energy: 'medium',
        });

        if (recommendations.length >= 5) break;
      }

      if (recommendations.length > 0) {
        return recommendations;
      }
    } catch (e) {
      console.warn('YouTube radio search failed:', e);
    }
  }

  return [];
}

/**
 * Interactive Conversational Chat with Aura DJ
 */
export async function chatWithAiDj(
  userMessage: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = [],
  currentSong: Song | null = null,
  settings?: CurationSettings
): Promise<AiDjChatResponse> {
  const apiKey = getStoredApiKey();
  const tasteContext = getTasteContextForPrompt(settings);

  // If Gemini API key is available, use multi-turn conversational Gemini 1.5 Flash
  if (apiKey) {
    try {
      const systemInstruction = `
Eres Aura DJ, un musicólogo de clase mundial, productor musical y curador sonoro con oído absoluto.
Tienes un conocimiento enciclopédico de todos los géneros: desde música urbana contemporánea (reggaeton, trap, pop), folclore andino (huayno tradicional, guitarra solista de Manuelcha Prado, Raúl García Zárate), rock clásico, indie, jazz, hasta electrónica fina.

${tasteContext}

${currentSong ? `CANCIÓN ACTUAL EN REPRODUCCIÓN: "${currentSong.title}" de ${currentSong.artist}.` : ''}

INSTRUCCIONES CLAVE:
1. Responde al usuario de manera cálida, inteligente y experta.
2. Si el usuario te pide cambiar de vibra, quitar canciones comerciales, o enfocarse en un instrumento específico, ajústalo con precisión.
3. SIEMPRE incluye un bloque JSON al final con exactamente 3 a 5 canciones recomendadas que cumplan con la dirección de la conversación.

FORMATO OBLIGATORIO DE RESPUESTA:
Escribe tu comentario conversacional (2-3 frases), y luego escribe EXACTAMENTE este delimitador seguido del JSON:
---JSON---
[
  {
    "title": "Nombre de la Canción",
    "artist": "Nombre del Artista",
    "reason": "Explicación musicológica de timbres, ritmo o armonía",
    "bpm": 95,
    "energy": "chill" | "medium" | "high",
    "subgenre": "Subgénero exacto"
  }
]
`.trim();

      const contents = [
        ...chatHistory.slice(-4).map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ];

      const model = getStoredModel();
      const thinkingBudget = getStoredThinkingBudget();
      const genConfig: any = {
        temperature: 0.75,
      };
      if (thinkingBudget > 0 && (model.includes('2.5') || model.includes('2.0'))) {
        genConfig.thinkingConfig = { thinkingBudget };
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: genConfig,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return parseDjChatResponse(rawText);
      }
    } catch (e) {
      console.warn('[Aura DJ] Gemini chat call failed, using dynamic local intelligence:', e);
    }
  }

  // Dynamic Semantic Fallback (Works for any prompt even without an API key)
  return getDynamicSemanticChat(userMessage, currentSong, settings);
}

/**
 * Standard Prompt-to-Playlist Curator with Musicology Reasoning
 */
export async function getAiCuratedPlaylist(
  userPrompt: string,
  currentHistory: string[] = [],
  settings?: CurationSettings
): Promise<AiRecommendation[]> {
  const chatRes = await chatWithAiDj(userPrompt, [], null, settings);
  return chatRes.recommendations;
}

/**
 * Smart Skip: Adapt recommendations when user skips a song early
 */
export async function getSmartSkipRecommendations(
  skippedSong: Song,
  originalPrompt: string,
  settings?: CurationSettings
): Promise<AiRecommendation[]> {
  recordDislikedSong(skippedSong);
  const adjustedPrompt = `El usuario acaba de saltar "${skippedSong.title}" de ${skippedSong.artist}. No encajó el estilo. Cámbiale el rumbo al set de "${originalPrompt}", evitando artistas similares y priorizando un enfoque más fresco o profundo.`;
  return getAiCuratedPlaylist(adjustedPrompt, [], settings);
}

/**
 * Parses the DJ text + JSON split format
 */
function parseDjChatResponse(rawText: string): AiDjChatResponse {
  if (rawText.includes('---JSON---')) {
    const [commentaryPart, jsonPart] = rawText.split('---JSON---');
    try {
      const cleanJson = jsonPart.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          commentary: commentaryPart.trim(),
          recommendations: parsed,
        };
      }
    } catch (e) {
      console.warn('[Aura DJ] Failed to parse JSON block from model:', e);
    }
    return {
      commentary: commentaryPart.trim(),
      recommendations: [],
    };
  }

  try {
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed)) {
      return {
        commentary: 'Aquí tienes una selección curada especialmente para tu vibra.',
        recommendations: parsed,
      };
    }
  } catch (e) {}

  return {
    commentary: rawText.trim(),
    recommendations: [],
  };
}

/**
 * Dynamic Semantic Chat Fallback for offline / zero-key usage
 */
async function getDynamicSemanticChat(
  message: string,
  currentSong: Song | null,
  settings?: CurationSettings
): Promise<AiDjChatResponse> {
  const lower = message.toLowerCase();
  const obscurity = settings?.obscurityLevel || 'balanced';

  // Andean regional music
  if (lower.includes('ayacucho') || lower.includes('huayno') || lower.includes('andino')) {
    let recs: AiRecommendation[];
    let commentary = 'Excelente elección. Te preparé una selección limpia de maestros de la guitarra y tradición andina.';

    if (obscurity === 'underground') {
      commentary += ' Activé el modo Caleta con grabaciones íntimas de solistas.';
      recs = [
        {
          title: 'Helme',
          artist: 'Raúl García Zárate',
          reason: 'Solo de guitarra tradicional ayacuchana en temple baúl.',
          bpm: 78,
          energy: 'chill',
          subgenre: 'Guitarra Andina',
        },
        {
          title: 'Madre Andina',
          artist: 'Manuelcha Prado',
          reason: 'Voz y guitarra acústica tradicional de Puquio.',
          bpm: 85,
          energy: 'chill',
          subgenre: 'Huayno Tradicional',
        },
        {
          title: 'Una Paloma Sobre Una Rama',
          artist: 'Nancy Manchego y Manuelcha Prado',
          reason: 'Arpegios andinos limpios y melodía nostálgica.',
          bpm: 82,
          energy: 'chill',
          subgenre: 'Yaraví Tradicional',
        },
      ];
    } else {
      recs = [
        {
          title: 'Adiós Pueblo de Ayacucho',
          artist: 'Trío Ayacucho',
          reason: 'El himno tradicional de la guitarra andina.',
          bpm: 90,
          energy: 'medium',
          subgenre: 'Huayno Tradicional',
        },
        {
          title: 'Flor de Retama',
          artist: 'Yennifer Sermeño',
          reason: 'Composición clásica de la historia y poesía andina.',
          bpm: 92,
          energy: 'medium',
          subgenre: 'Canción Tradicional',
        },
      ];
    }

    return { commentary, recommendations: recs };
  }

  // General YouTube Multi-Search Fallback
  if (window.auraAPI?.searchMultipleYouTube) {
    try {
      const searchTerms = `${message} audio`;
      const results = await window.auraAPI.searchMultipleYouTube(searchTerms, 10);

      if (results && results.length > 0) {
        const uniqueRecs: AiRecommendation[] = [];

        for (const item of results) {
          const candidate = {
            title: cleanSongTitle(item.title, item.artist),
            artist: cleanArtistName(item.artist, item.title) || item.artist || 'Artista Destacado',
            videoId: item.videoId,
          };

          // Discard if similar to any track already in this batch
          const duplicate = uniqueRecs.some((r) => isSameOrSimilarSong(r, candidate));
          if (duplicate) continue;

          uniqueRecs.push({
            title: candidate.title,
            artist: candidate.artist,
            reason: `Pista seleccionada para tu vibra.`,
            bpm: 100,
            energy: 'medium',
            subgenre: 'Selección de Estudio',
          });

          if (uniqueRecs.length >= 5) break;
        }

        // If the query was a specific single song and we only got 1 unique track (because all others were duplicates of it),
        // fetch other hits by that same artist to fill the queue with real variety!
        if (uniqueRecs.length < 5 && uniqueRecs.length > 0) {
          const mainArtist = uniqueRecs[0].artist;
          try {
            const artistHits = await window.auraAPI.searchMultipleYouTube(`${mainArtist} top hits audio`, 8);
            for (const hit of artistHits) {
              const candidate = {
                title: cleanSongTitle(hit.title, hit.artist),
                artist: cleanArtistName(hit.artist, hit.title) || mainArtist,
                videoId: hit.videoId,
              };

              const duplicate = uniqueRecs.some((r) => isSameOrSimilarSong(r, candidate));
              if (duplicate) continue;

              uniqueRecs.push({
                title: candidate.title,
                artist: candidate.artist,
                reason: `Éxito de ${mainArtist} para enriquecer la estación.`,
                bpm: 100,
                energy: 'medium',
                subgenre: 'Selección de Estudio',
              });

              if (uniqueRecs.length >= 5) break;
            }
          } catch (e) {}
        }

        if (uniqueRecs.length > 0) {
          return {
            commentary: `Curando pistas de alta calidad para "${message}".`,
            recommendations: uniqueRecs,
          };
        }
      }
    } catch (e) {
      console.warn('Fallback search failed:', e);
    }
  }

  // Fallback
  return {
    commentary: 'Ajusté los ritmos para una experiencia auditiva fluida.',
    recommendations: [
      {
        title: 'Yellow',
        artist: 'Coldplay',
        reason: 'Guitarras acústicas y melodía expansiva.',
        bpm: 88,
        energy: 'medium',
        subgenre: 'Alternative Rock',
      },
      {
        title: 'Get Lucky',
        artist: 'Daft Punk',
        reason: 'Groove de bajo y guitarra funk.',
        bpm: 116,
        energy: 'high',
        subgenre: 'Funk / Electronic',
      },
    ],
  };
}
