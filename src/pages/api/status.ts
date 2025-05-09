import { LastFm } from '@imikailoby/lastfm-ts';

let cachedData: any = null;
let lastFetchTime = 0;
// Initialize LastFm API
const lastFm = new LastFm(import.meta.env.LASTFM_API_KEY);
export const prerender = false;
export async function GET() {
      const now = Date.now();
  // Cache valid for 30 seconds
  if (cachedData && now - lastFetchTime < 30 * 1000) {
    return new Response(JSON.stringify(cachedData), {
      headers: { 'content-type': 'application/json' },
    });
  }
      
  try {
    // Fetch the recent track data from LastFM
    const response = await lastFm.user.getRecentTracks({
      user: 'aiimeee', 
      limit: '1',
      page: '1',
    });

    const { recenttracks } = response;
    const recentTrack = recenttracks?.track?.[0];

        // If there's no recent track data, return an error
    if (!recentTrack) {
      return new Response(
        JSON.stringify({ error: 'No recent track data found' }),
        { status: 404 }
      );
    }

    cachedData = {
      song:  recentTrack?.name ?? '',
      artist: recentTrack.artist?.['#text'] ?? '',
      image: recentTrack?.image[2]['#text'] ?? '',
      listening: recentTrack?.['@attr']?.['nowplaying'] ?? false,
      timestamp: recentTrack?.date?.['uts'] ?? 'Unknown',
    };

    lastFetchTime = now;


return new Response(JSON.stringify(cachedData), {
      headers: { 'content-type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching data from LastFM:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch now-playing data' }),
      { status: 500 }
    );
  }
}
