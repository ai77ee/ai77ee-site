// src/pages/api/fetch-lastfm.ts
import { LastFm } from '@imikailoby/lastfm-ts';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.UPSTASH_REDIS_REST_URL,
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: {},
});

const lastFm = new LastFm(import.meta.env.LASTFM_API_KEY);

export async function GET({ request }: { request: Request }) {
  // Validar el header con el CRON_SECRET para seguridad
  const auth = request.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const response = await lastFm.user.getRecentTracks({
      user: import.meta.env.LASTFM_USER,
      limit: '1',
      page: '1',
    });

    const recentTrack = response?.recenttracks?.track?.[0];

    if (!recentTrack) {
      return new Response(JSON.stringify({ error: 'No track found' }), { status: 404 });
    }

    const data = {
      song: recentTrack?.name ?? '',
      artist: recentTrack.artist?.['#text'] ?? '',
      image: recentTrack?.image?.[2]?.['#text'] ?? '',
      listening: recentTrack?.['@attr']?.['nowplaying'] ?? false,
      timestamp: recentTrack?.date?.['uts'] ?? 'Unknown',
    };

    await redis.set('lastfm', JSON.stringify(data), 'EX', 30);

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Fetch LastFM error:', error);
    return new Response(JSON.stringify({ error: 'Internal Error' }), { status: 500 });
  }
}
