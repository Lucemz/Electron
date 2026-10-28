const { app, BrowserWindow, ipcMain, globalShortcut, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');
const yts = require('yt-search');
const { startStaticServer } = require('./server.cjs');
const {
  getExploreData,
  getCategoryTracks,
  getUserLikedMusic,
  getUserWatchLater,
  getUserProfile,
  getCookieHeaderFromSession,
} = require('./youtubeMusic.cjs');

// Bypass Chromium's autoplay policy for seamless background/instant playback
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('enable-features', 'HardwareMediaKeyHandling');

let mainWindow = null;
let isMiniPlayer = false;
let previousBounds = null;
let staticServer = null;
let serverPort = 0;

const SESSION_PARTITION = 'persist:aura-user-session';

async function applyCookiesToSession(cookieString, sess) {
  if (!cookieString || typeof cookieString !== 'string') return false;
  const pairs = cookieString.split(';');
  for (const pair of pairs) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const name = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    try {
      await sess.cookies.set({
        url: 'https://music.youtube.com',
        domain: '.youtube.com',
        name,
        value,
        path: '/',
        secure: true,
        httpOnly: false,
      });
    } catch (e) {
      // Ignore malformed individual cookie
    }
  }
  return true;
}

// Anti-compilation and non-music regex to filter out mixes, albums, tutorials, and gear sales
const NON_MUSIC_REGEX =
  /\b(mix|compilation|recopilacion|recopilación|disco completo|full album|en vivo completo|concierto completo|1 hour|1 hora|2 horas|30 min|40 min|50 min|enganchados|megamix|volumen completo|grandes exitos|grandes éxitos|completo|tutorial|como tocar|cómo tocar|venta de|unboxing|review|clases de|aprende a tocar|tienda|comprar)\b/i;

function filterSingles(videos) {
  const clean = videos.filter((v) => {
    if (!v.videoId) return false;
    // Target single song duration: 75 seconds (1:15) to 450 seconds (7:30)
    if (v.seconds < 75 || v.seconds > 450) return false;
    if (NON_MUSIC_REGEX.test(v.title)) return false;
    return true;
  });

  if (clean.length > 0) {
    return clean.sort((a, b) => {
      const aTopic = a.author?.name?.endsWith(' - Topic') ? 1 : 0;
      const bTopic = b.author?.name?.endsWith(' - Topic') ? 1 : 0;
      return bTopic - aTopic;
    });
  }

  return videos.filter((v) => v.videoId && v.seconds < 500);
}

async function createWindow() {
  const sess = session.fromPartition(SESSION_PARTITION);

  // Silent Ad-Blocker: Cancel all ad requests at network level
  sess.webRequest.onBeforeRequest(
    {
      urls: [
        '*://*.doubleclick.net/*',
        '*://*.googleads.g.doubleclick.net/*',
        '*://*.youtube.com/api/stats/ads*',
        '*://*.youtube.com/pagead/*',
        '*://*.googlesyndication.com/*',
      ],
    },
    (details, callback) => {
      // Do not block authentication, Google accounts, or login resources
      if (
        details.url.includes('accounts.google.com') ||
        details.url.includes('accounts.youtube.com') ||
        details.url.includes('gstatic.com') ||
        details.url.includes('signin') ||
        details.url.includes('ServiceLogin')
      ) {
        return callback({ cancel: false });
      }
      callback({ cancel: true });
    }
  );

  mainWindow = new BrowserWindow({
    width: 1140,
    height: 760,
    minWidth: 880,
    minHeight: 620,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      backgroundThrottling: false,
      partition: SESSION_PARTITION,
    },
  });

  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log('[Renderer UI]', message);
  });

  let distPath = path.join(__dirname, '../dist');
  if (app.isPackaged) {
    const unpackedDist = path.join(process.resourcesPath, 'app.asar.unpacked/dist');
    const resourcesDist = path.join(process.resourcesPath, 'dist');
    if (fs.existsSync(unpackedDist)) {
      distPath = unpackedDist;
    } else if (fs.existsSync(resourcesDist)) {
      distPath = resourcesDist;
    }
  }
  console.log('[Aura Main] Using dist path:', distPath);

  const { port, server } = await startStaticServer(distPath, async (cookies) => {
    console.log('[Aura Main] Cookies received from browser sync endpoint!');
    await applyCookiesToSession(cookies, sess);
    if (mainWindow) {
      mainWindow.webContents.send('auth:success');
    }
  });
  serverPort = port;
  staticServer = server;
  const localUrl = `http://localhost:${port}`;
  console.log(`[Aura Main] Loading local application at ${localUrl}`);
  await mainWindow.loadURL(localUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (staticServer) staticServer.close();
  });

  // Register Mac Media Keys & Function Keys F7, F8, F9 (Strictly no Shift+Arrows)
  try {
    // 1. Physical Mac Top Function Keys
    const f7Ok = globalShortcut.register('F7', () => {
      console.log('[Aura Main] F7 pressed -> Previous Track');
      if (mainWindow) mainWindow.webContents.send('player:previous');
    });
    const f8Ok = globalShortcut.register('F8', () => {
      console.log('[Aura Main] F8 pressed -> Toggle Play/Pause');
      if (mainWindow) mainWindow.webContents.send('player:toggle-play');
    });
    const f9Ok = globalShortcut.register('F9', () => {
      console.log('[Aura Main] F9 pressed -> Next Track');
      if (mainWindow) mainWindow.webContents.send('player:next');
    });

    // 2. Hardware media keys
    const playOk = globalShortcut.register('MediaPlayPause', () => {
      console.log('[Aura Main] MediaPlayPause pressed');
      if (mainWindow) mainWindow.webContents.send('player:toggle-play');
    });
    const nextOk = globalShortcut.register('MediaNextTrack', () => {
      console.log('[Aura Main] MediaNextTrack pressed');
      if (mainWindow) mainWindow.webContents.send('player:next');
    });
    const prevOk = globalShortcut.register('MediaPreviousTrack', () => {
      console.log('[Aura Main] MediaPreviousTrack pressed');
      if (mainWindow) mainWindow.webContents.send('player:previous');
    });

    console.log('[Aura Main] Shortcuts active: F7/F8/F9 & Hardware media keys:', {
      f7Ok,
      f8Ok,
      f9Ok,
      playOk,
      nextOk,
      prevOk,
    });
  } catch (err) {
    console.warn('[Aura Main] Could not register media shortcuts:', err);
  }
}

// Single YouTube Search: Returns individual studio tracks, discarding mixes/compilations
ipcMain.handle('youtube:search', async (_, query) => {
  try {
    if (!query) return null;
    console.log('[Aura IPC] Searching YouTube single track for:', query);
    const r = await yts(query);
    if (!r || !r.videos || r.videos.length === 0) {
      console.warn('[Aura IPC] No videos found for:', query);
      return null;
    }

    const singles = filterSingles(r.videos);
    const top = singles[0] || r.videos[0];
    const alternatives = singles.slice(1, 5).map((v) => v.videoId);

    console.log('[Aura IPC] Selected clean single:', top.title, `(${top.timestamp})`, top.videoId);
    return {
      videoId: top.videoId,
      title: top.title,
      artist: top.author ? top.author.name : '',
      duration: top.seconds,
      durationFormatted: top.timestamp,
      thumbnail: top.thumbnail || top.image,
      url: top.url,
      alternativeVideoIds: alternatives,
    };
  } catch (error) {
    console.error('[Aura IPC] Error searching YouTube:', error);
    return null;
  }
});

// Multi-result Global Search: Returns strictly individual songs for user selection
ipcMain.handle('youtube:search-multiple', async (_, query, limit = 8) => {
  try {
    if (!query) return [];
    console.log('[Aura IPC] Multi-search singles for:', query);
    const r = await yts(query);
    if (!r || !r.videos) return [];

    const singles = filterSingles(r.videos);
    const pool = singles.length > 0 ? singles : r.videos.filter((v) => v.videoId && v.seconds < 500);

    return pool.slice(0, limit).map((v) => ({
      videoId: v.videoId,
      title: v.title,
      artist: v.author ? v.author.name : '',
      duration: v.seconds,
      durationFormatted: v.timestamp,
      thumbnail: v.thumbnail || v.image,
      url: v.url,
    }));
  } catch (error) {
    console.error('[Aura IPC] Error searching multiple:', error);
    return [];
  }
});

// YouTube Music Explore & Personalized Library Endpoints
ipcMain.handle('youtube:get-explore', async () => {
  const sess = session.fromPartition(SESSION_PARTITION);
  const cookieHeader = await getCookieHeaderFromSession(sess);
  return await getExploreData(cookieHeader);
});

ipcMain.handle('youtube:get-category', async (_, browseId, params) => {
  return await getCategoryTracks(browseId, params);
});

ipcMain.handle('youtube:get-user-liked', async () => {
  const sess = session.fromPartition(SESSION_PARTITION);
  return await getUserLikedMusic(sess);
});

ipcMain.handle('youtube:get-user-watch-later', async () => {
  const sess = session.fromPartition(SESSION_PARTITION);
  return await getUserWatchLater(sess);
});

// Profile status (Google / YouTube Music account)
ipcMain.handle('auth:get-profile', async () => {
  const sess = session.fromPartition(SESSION_PARTITION);
  return await getUserProfile(sess);
});

// Open external browser login sync helper (Seamless login via user's default browser)
ipcMain.handle('auth:open-browser-login', async () => {
  if (serverPort) {
    const url = `http://localhost:${serverPort}/sync-login`;
    console.log('[Aura Auth] Opening system browser for sync:', url);
    await shell.openExternal(url);
    return true;
  }
  return false;
});

// Save session cookies directly
ipcMain.handle('auth:save-cookies', async (_, cookieStr) => {
  const sess = session.fromPartition(SESSION_PARTITION);
  const ok = await applyCookiesToSession(cookieStr, sess);
  if (ok && mainWindow) {
    mainWindow.webContents.send('auth:success');
  }
  return ok;
});

// Clean, Official Google / YouTube Login Window
ipcMain.handle('auth:open-google-login', async () => {
  return new Promise((resolve) => {
    const loginWin = new BrowserWindow({
      width: 520,
      height: 680,
      center: true,
      parent: mainWindow || undefined,
      modal: false,
      title: 'Iniciar sesión en YouTube Music / Google',
      backgroundColor: '#0a0a0f',
      webPreferences: {
        partition: SESSION_PARTITION,
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    const CHROME_UA =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

    loginWin.webContents.setUserAgent(CHROME_UA);

    // Official YouTube sign-in URL with all valid parameters so Google never throws HTTP 400
    const targetUrl =
      'https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Des%26next%3Dhttps%253A%252F%252Fmusic.youtube.com%252F%26feature%3Dsign_in_button&hl=es';

    loginWin.loadURL(targetUrl);

    // Hide navigator.webdriver to pass Google's security checks
    loginWin.webContents.on('dom-ready', () => {
      loginWin.webContents.executeJavaScript(`
        try {
          Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        } catch (e) {}
      `);
    });

    const checkLogin = async (url) => {
      console.log('[Aura Auth] Navigated to:', url);
      const sess = session.fromPartition(SESSION_PARTITION);
      const profile = await getUserProfile(sess);
      if (profile && profile.loggedIn) {
        console.log('[Aura Auth] Google login detected! User:', profile.name);
        if (mainWindow) {
          mainWindow.webContents.send('auth:success');
        }
        setTimeout(() => {
          if (!loginWin.isDestroyed()) loginWin.close();
          resolve(true);
        }, 1000);
      }
    };

    loginWin.webContents.on('did-navigate', (_, url) => checkLogin(url));
    loginWin.webContents.on('did-redirect-navigation', (_, url) => checkLogin(url));

    loginWin.on('closed', () => {
      resolve(true);
    });
  });
});

// Logout: clears session partition
ipcMain.handle('auth:logout', async () => {
  const sess = session.fromPartition(SESSION_PARTITION);
  await sess.clearStorageData();
  console.log('[Aura Auth] User logged out. Session cleared.');
  if (mainWindow) {
    mainWindow.webContents.send('auth:success');
  }
  return true;
});

ipcMain.handle('window:toggle-mini', async () => {
  if (!mainWindow) return false;
  if (!isMiniPlayer) {
    previousBounds = mainWindow.getBounds();
    mainWindow.setAlwaysOnTop(true, 'floating');
    mainWindow.setResizable(false);
    mainWindow.setBounds({
      width: 380,
      height: 200,
      x: previousBounds.x + (previousBounds.width - 380),
      y: previousBounds.y,
    });
    isMiniPlayer = true;
  } else {
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setResizable(true);
    if (previousBounds) {
      mainWindow.setBounds(previousBounds);
    } else {
      mainWindow.setBounds({ width: 1140, height: 760 });
    }
    isMiniPlayer = false;
  }
  return isMiniPlayer;
});

ipcMain.handle('window:is-mini', () => isMiniPlayer);
ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:close', () => mainWindow?.close());

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  if (staticServer) staticServer.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
