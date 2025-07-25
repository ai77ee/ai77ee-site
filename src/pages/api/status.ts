// src/pages/api/status.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.UPSTASH_REDIS_REST_URL,
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: {}, // Necesario para Upstash REST API
});

export const prerender = false;

export async function GET() {
  try {
    const cached = await redis.get('lastfm');

    if (!cached) {
      return new Response(
        JSON.stringify({ error: 'No cached data available' }),
        { status: 503 }
      );
    }

    return new Response(cached, {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error reading from Redis:', error);
    return new Response(JSON.stringify({ error: 'Redis error' }), {
      status: 500,
    });
  }
}