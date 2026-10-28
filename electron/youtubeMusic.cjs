const https = require('https');

function fetchInnerTube(browseId, params = null, cookieHeader = '') {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      context: {
        client: {
          clientName: 'WEB_REMIX',
          clientVersion: '1.20241020.01.00',
          hl: 'es',
          gl: 'PE',
        },
      },
      browseId,
      ...(params ? { params } : {}),
    });

    const req = https.request(
      'https://music.youtube.com/youtubei/v1/browse?alt=json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Parses the YouTube Music Explore page (Trending, New Releases, Moods & Genres)
 */
async function getExploreData() {
  try {
    const data = await fetchInnerTube('FEmusic_explore');
    const tabs = data.contents?.singleColumnBrowseResultsRenderer?.tabs || [];
    const secList = tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

    const result = {
      trending: [],
      newReleases: [],
      moodsAndGenres: [],
    };

    for (const sec of secList) {
      const carousel = sec.musicCarouselShelfRenderer || sec.musicShelfRenderer || {};
      const title =
        carousel.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text || '';
      const items = carousel.contents || [];
      const titleLower = title.toLowerCase();

      // 1. Trending Songs
      if (titleLower.includes('tendencias') || titleLower.includes('trending')) {
        for (const it of items) {
          const item = it.musicResponsiveListItemRenderer;
          if (!item) continue;
          const songTitle =
            item.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]
              ?.text;
          const artist =
            item.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]
              ?.text;
          const thumb =
            item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url;
          const videoId =
            item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
              ?.playNavigationEndpoint?.watchEndpoint?.videoId ||
            item.navigationEndpoint?.watchEndpoint?.videoId;

          if (songTitle && videoId) {
            result.trending.push({
              title: songTitle,
              artist: artist || 'Artista Destacado',
              videoId,
              thumbnail: thumb || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            });
          }
        }
      }

      // 2. New Releases (Albums & Singles)
      else if (
        titleLower.includes('lanzamientos') ||
        titleLower.includes('nuevos') ||
        titleLower.includes('álbumes')
      ) {
        for (const it of items) {
          const item = it.musicTwoRowItemRenderer;
          if (!item) continue;
          const albumTitle = item.title?.runs?.[0]?.text;
          const artist = item.subtitle?.runs?.[0]?.text;
          const thumb =
            item.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]
              ?.url;
          const browseId = item.navigationEndpoint?.browseEndpoint?.browseId;
          const videoId = item.navigationEndpoint?.watchEndpoint?.videoId;

          if (albumTitle) {
            result.newReleases.push({
              title: albumTitle,
              artist: artist || 'Nuevo Lanzamiento',
              thumbnail: thumb,
              browseId,
              videoId,
            });
          }
        }
      }

      // 3. Moods & Genres categories
      else if (
        titleLower.includes('ánimo') ||
        titleLower.includes('géneros') ||
        titleLower.includes('moods')
      ) {
        for (const it of items) {
          const btn = it.musicNavigationButtonRenderer;
          if (!btn) continue;
          const moodTitle = btn.buttonText?.runs?.[0]?.text;
          const browseId = btn.clickCommand?.browseEndpoint?.browseId;
          const params = btn.clickCommand?.browseEndpoint?.params;

          if (moodTitle) {
            result.moodsAndGenres.push({
              title: moodTitle,
              browseId,
              params,
            });
          }
        }
      }
    }

    return result;
  } catch (error) {
    console.error('[Aura YTM] Error fetching explore data:', error);
    return { trending: [], newReleases: [], moodsAndGenres: [] };
  }
}

/**
 * Fetches tracks from a specific category (e.g. Moods like Concentración, Fiesta) or Album
 */
async function getCategoryTracks(browseId, params = null) {
  try {
    const data = await fetchInnerTube(browseId, params);

    // If it is an album (twoColumnBrowseResultsRenderer)
    const albumSec =
      data.contents?.twoColumnBrowseResultsRenderer?.secondaryContents?.sectionListRenderer
        ?.contents || [];
    if (albumSec.length > 0) {
      const shelf = albumSec[0]?.musicShelfRenderer?.contents || [];
      const tracks = [];
      for (const it of shelf) {
        const item = it.musicResponsiveListItemRenderer;
        if (!item) continue;
        const title =
          item.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
        const artist =
          item.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
        const videoId =
          item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
            ?.playNavigationEndpoint?.watchEndpoint?.videoId ||
          item.navigationEndpoint?.watchEndpoint?.videoId;
        const thumb =
          item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url;

        if (title && videoId) {
          tracks.push({
            title,
            artist: artist || 'Artista',
            videoId,
            thumbnail: thumb || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          });
        }
      }
      if (tracks.length > 0) return tracks;
    }

    // If it is a mood/genre category with playlists
    const tabs = data.contents?.singleColumnBrowseResultsRenderer?.tabs || [];
    const secList = tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
    const items = [];

    for (const sec of secList) {
      const carousel = sec.musicCarouselShelfRenderer;
      if (!carousel) continue;
      const list = carousel.contents || [];
      for (const it of list) {
        const sample = it.musicTwoRowItemRenderer;
        if (!sample) continue;
        const title = sample.title?.runs?.[0]?.text;
        const subtitle = sample.subtitle?.runs?.[0]?.text;
        const bId = sample.navigationEndpoint?.browseEndpoint?.browseId;
        const vId = sample.navigationEndpoint?.watchEndpoint?.videoId;
        const thumb =
          sample.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]
            ?.url;

        if (title) {
          items.push({
            title,
            artist: subtitle || '',
            browseId: bId,
            videoId: vId,
            thumbnail: thumb,
          });
        }
      }
    }

    return items;
  } catch (err) {
    console.error('[Aura YTM] Error fetching category/album:', err);
    return [];
  }
}

/**
 * Helper to build Cookie header string from Electron session
 */
async function getCookieHeaderFromSession(sess) {
  try {
    if (!sess) return '';
    const cookies = await sess.cookies.get({ url: 'https://music.youtube.com' });
    if (!cookies || cookies.length === 0) return '';
    return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
  } catch (e) {
    return '';
  }
}

/**
 * Fetches User Liked Music from YouTube Music session cookies (playlist VLLM)
 */
async function getUserLikedMusic(sess) {
  try {
    const cookieHeader = await getCookieHeaderFromSession(sess);
    if (!cookieHeader) return [];

    console.log('[Aura YTM] Querying user liked tracks with Google session cookies...');
    const data = await fetchInnerTube('VLLM', null, cookieHeader);

    const tabs = data.contents?.singleColumnBrowseResultsRenderer?.tabs || [];
    const secList = tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
    const tracks = [];

    for (const sec of secList) {
      const shelf = sec.musicShelfRenderer || sec.musicPlaylistShelfRenderer;
      if (!shelf) continue;
      for (const it of shelf.contents || []) {
        const item = it.musicResponsiveListItemRenderer;
        if (!item) continue;
        const title =
          item.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
        const artist =
          item.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
        const videoId =
          item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
            ?.playNavigationEndpoint?.watchEndpoint?.videoId ||
          item.navigationEndpoint?.watchEndpoint?.videoId;
        const thumb =
          item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url;

        if (title && videoId) {
          tracks.push({
            id: `yt-liked-${videoId}`,
            title,
            artist: artist || 'Artista',
            videoId,
            thumbnail: thumb || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            duration: 210,
            durationFormatted: '3:30',
            isLiked: true,
          });
        }
      }
    }

    console.log(`[Aura YTM] Retrieved ${tracks.length} liked tracks from YouTube Music!`);
    return tracks;
  } catch (error) {
    console.warn('[Aura YTM] Failed to fetch user liked tracks:', error);
    return [];
  }
}

/**
 * Fetches User Watch Later from YouTube Music session cookies (playlist VLWL)
 */
async function getUserWatchLater(sess) {
  try {
    const cookieHeader = await getCookieHeaderFromSession(sess);
    if (!cookieHeader) return [];

    console.log('[Aura YTM] Querying user watch later tracks with Google session cookies...');
    const data = await fetchInnerTube('VLWL', null, cookieHeader);

    const tabs = data.contents?.singleColumnBrowseResultsRenderer?.tabs || [];
    const secList = tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
    const tracks = [];

    for (const sec of secList) {
      const shelf = sec.musicShelfRenderer || sec.musicPlaylistShelfRenderer;
      if (!shelf) continue;
      for (const it of shelf.contents || []) {
        const item = it.musicResponsiveListItemRenderer;
        if (!item) continue;
        const title =
          item.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
        const artist =
          item.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
        const videoId =
          item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
            ?.playNavigationEndpoint?.watchEndpoint?.videoId ||
          item.navigationEndpoint?.watchEndpoint?.videoId;
        const thumb =
          item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url;

        if (title && videoId) {
          tracks.push({
            id: `yt-wl-${videoId}`,
            title,
            artist: artist || 'Artista',
            videoId,
            thumbnail: thumb || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            duration: 210,
            durationFormatted: '3:30',
            isSavedWatchLater: true,
          });
        }
      }
    }

    console.log(`[Aura YTM] Retrieved ${tracks.length} watch later tracks from YouTube!`);
    return tracks;
  } catch (error) {
    console.warn('[Aura YTM] Failed to fetch user watch later tracks:', error);
    return [];
  }
}

module.exports = {
  getExploreData,
  getCategoryTracks,
  getUserLikedMusic,
  getUserWatchLater,
};
