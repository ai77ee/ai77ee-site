import { LastFm } from '@imikailoby/lastfm-ts';

const lastFm = new LastFm(import.meta.env.LASTFM_API_KEY);
export const prerender = false;

// Simple in-memory cache
let cachedData: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 1000; // 30 segundos

export async function GET() {
  const now = Date.now();

  // Sirve desde el caché si no ha expirado
  if (cachedData && now - lastFetchTime < CACHE_DURATION) {
    return new Response(JSON.stringify(cachedData), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }

  try {
    const response = await lastFm.user.getRecentTracks({
      user: import.meta.env.LASTFM_USER,
      limit: '1',
      page: '1'
    });

    const recentTrack = response?.recenttracks?.track?.[0];

    if (!recentTrack) {
      return new Response(JSON.stringify({ error: 'No recent track found' }), { status: 404 });
    }

    const isNowPlaying = recentTrack['@attr']?.nowplaying === 'true';
    const timestamp = isNowPlaying
      ? Math.floor(now / 1000)
      : Number(recentTrack?.date?.uts) || Math.floor(now / 1000);

    // Preparar la respuesta
    cachedData = {
      song: recentTrack.name || 'Unknown',
      artist: recentTrack.artist?.['#text'] || 'Unknown',
      image: recentTrack.image?.[2]?.['#text'] || '',
      listening: isNowPlaying,
      timestamp
    };

    lastFetchTime = now;

    return new Response(JSON.stringify(cachedData), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });

  } catch (err) {
    console.error('Error fetching from Last.fm:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}