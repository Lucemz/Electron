# 🎵 Aura — AI-First Music Player for macOS

**Aura** es una aplicación de escritorio nativa para macOS con arquitectura **AI-First**, diseñada para curar, descubrir y reproducir música usando lenguaje natural mediante modelos de Inteligencia Artificial (Gemini) y el catálogo de YouTube / YouTube Music.

---

## ✨ Características Principales

- **🧠 DJ con Inteligencia Artificial:** Pide música como hablarías con un experto: *"Canciones con sintetizadores retro para programar a las 2 AM"*, *"Música similar a Daft Punk pero con guitarra acústica"*.
- **⚡ Motor Dual-Deck (Gapless Prefetch):** Mientras una pista suena en el deck activo, el deck secundario precarga y bufferiza el siguiente tema en segundo plano. Los cambios de canción ocurren en **0 milisegundos**, sin cortes ni silencios.
- **🛡️ Deduplicación Inteligente:** Algoritmo que filtra versiones repetidas, remixes o subidas duplicadas de la misma canción, garantizando que la cola siempre tenga temas distintos y variados.
- **🎹 Integración Nativa con macOS:**
  - Soporte de teclas físicas multimedia de Mac (`F7`, `F8`, `F9`), Touch Bar y atajos in-app (`Espacio`, `Cmd+Flechas`).
  - Control desde el **Centro de Control** y pantalla de bloqueo de macOS vía `navigator.mediaSession`.
  - Soporte para toques en el vástago de los **AirPods Pro**.
- **📻 Infinite Smart Radio:** Cuando la cola de reproducción baja a menos de 3 canciones, el motor autocompleta pistas similares del mismo universo sonoro sin detener la música.
- **🪟 Modo Mini-Player:** Ventana compacta flotante (*Picture-in-Picture*) para escuchar música mientras programas o navegas.
- **📦 Instalador Nativo:** Empaquetado oficial en formato `.dmg` y `.zip` para macOS Apple Silicon y Universal.

---

## 🚀 Cómo Ejecutar la Aplicación

### Modo Desarrollo (Vite + Interfaz Web rápida):
```bash
npm run dev
```

### Modo App de Escritorio para Mac (Electron Nativo):
```bash
npm run electron
```

### Compilar y abrir en un solo paso:
```bash
npm run app
```

### Generar Instaladores para Distribución (`.dmg` y `.zip`):
```bash
npm run dist
```
Los archivos de instalación se generarán en la carpeta `release/`:
- `release/Aura-1.0.0-arm64.dmg` (Instalador DMG arrastrable a `/Applications`)
- `release/Aura-1.0.0-arm64-mac.zip` (Bundle portátil para compartir)

---

## 🌿 Flujo de Git y Ramas (Git Flow)

Este repositorio sigue el flujo de trabajo estándar con tres ramas principales:

```
  main      ───●────────────────────────────●── [Producción / Releases estables con tags]
                \                          /
  releases       \                  ──────●─── [Estabilización y preparación de versión]
                  \                /
  dev              ●──────────────●─────────── [Desarrollo activo e integración]
```

1. **`main`**: Rama de producción con código 100% probado, estable y etiquetado con versiones semánticas (ej. `v1.0.0`).
2. **`dev`**: Rama de integración y desarrollo activo continuo.
3. **`releases`**: Rama de preparación para versiones de lanzamiento y congelamiento de características.

### 📝 Convención de Commits (Conventional Commits)

Todos los commits deben seguir la especificación [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nuevas funcionalidades (ej. `feat(player): add dual-deck gapless engine`)
- `fix:` Corrección de errores (ej. `fix(auth): solve google login 400 redirect error`)
- `chore:` Tareas de mantenimiento, dependencias o configuración (ej. `chore(build): configure electron-builder`)
- `docs:` Cambios en documentación (ej. `docs: update git flow and shortcuts guide`)
- `style:` Cambios de formato, estilos o UI sin afectar lógica
- `refactor:` Refactorización de código sin añadir features ni corregir bugs
- `release:` Commits de etiquetado o preparación de versión (ej. `release: v1.0.0`)

---

## 🛠️ Estructura del Proyecto

```
aura-music-mac/
├── build/             # Iconos oficiales de la app (icon.icns, icon.png)
├── electron/
│   ├── main.cjs       # Proceso principal: ventana, atajos globales y bridge IPC
│   ├── preload.cjs    # Puente seguro de IPC (AuraAPI)
│   └── server.cjs     # Servidor HTTP local para servir el bundle con origen confiable
├── src/
│   ├── components/
│   │   ├── AiDjChatSidebar.tsx     # Chat conversacional interactivo con el DJ
│   │   ├── MiniPlayerView.tsx      # Modo compacto flotante
│   │   ├── NowPlayingView.tsx      # Arte de álbum con resplandor ambiental y tarjeta de IA
│   │   ├── PlayerControls.tsx      # Barra inferior con scrubber y volumen
│   │   ├── PromptBar.tsx           # Barra de prompts tipo Command Palette + Chips de Vibes
│   │   ├── QueueList.tsx           # Lista de próximas canciones con badge ⚡ Precargado
│   │   ├── SettingsModal.tsx       # Configuración de Gemini API Key y login de Google
│   │   └── YouTubeAudioPlayer.tsx  # Motor Dual-Deck (Deck A / Deck B) sin pausas
│   ├── services/
│   │   ├── aiDjService.ts          # Integración con Gemini y motor algorítmico integrado
│   │   ├── tasteProfileService.ts  # Perfil de gustos y persistencia local
│   │   └── youtubeService.ts       # Resolvedor de canciones a YouTube Video IDs
│   ├── utils/
│   │   └── textCleaner.ts          # Limpieza de títulos y deduplicación inteligente
│   ├── types/index.ts              # Tipos TypeScript
│   ├── App.tsx                     # Orquestación de estado, atajos y auto-radio
│   └── main.tsx                    # Punto de entrada de React
├── package.json
└── tsconfig.json
```
