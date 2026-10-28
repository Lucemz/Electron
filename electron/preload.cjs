const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('auraAPI', {
  searchYouTube: (query) => ipcRenderer.invoke('youtube:search', query),
  searchMultipleYouTube: (query, limit) => ipcRenderer.invoke('youtube:search-multiple', query, limit),
  getYouTubeExplore: () => ipcRenderer.invoke('youtube:get-explore'),
  getYouTubeCategory: (browseId, params) => ipcRenderer.invoke('youtube:get-category', browseId, params),
  getUserLikedMusic: () => ipcRenderer.invoke('youtube:get-user-liked'),
  getUserWatchLater: () => ipcRenderer.invoke('youtube:get-user-watch-later'),
  getUserProfile: () => ipcRenderer.invoke('auth:get-profile'),
  openGoogleLogin: () => ipcRenderer.invoke('auth:open-google-login'),
  openBrowserLogin: () => ipcRenderer.invoke('auth:open-browser-login'),
  logout: () => ipcRenderer.invoke('auth:logout'),
  saveCookies: (cookieStr) => ipcRenderer.invoke('auth:save-cookies', cookieStr),
  toggleMiniPlayer: () => ipcRenderer.invoke('window:toggle-mini'),
  isMiniPlayer: () => ipcRenderer.invoke('window:is-mini'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  onAuthSuccess: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('auth:success', listener);
    return () => ipcRenderer.removeListener('auth:success', listener);
  },
  onMediaKey: (action, callback) => {
    const channel = `player:${action}`;
    const listener = () => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
});
