export async function GET() {
  try {
    const CLOUDFLARE_ACCOUNT_ID = import.meta.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_NAMESPACE_ID = import.meta.env.CLOUDFLARE_NAMESPACE_ID;
    const CLOUDFLARE_API_TOKEN = import.meta.env.CLOUDFLARE_API_TOKEN;

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_NAMESPACE_ID || !CLOUDFLARE_API_TOKEN) {
      return new Response(JSON.stringify({ error: 'Missing Cloudflare environment variables' }), {
        status: 500,
        headers: {
          'cache-control': 'no-store',
        },
      });
    }

    const KV_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_NAMESPACE_ID}/values/lastfm-data`;

    const res = await fetch(KV_URL, {
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch KV data' }), {
        status: 500,
        headers: {
          'cache-control': 'no-store',
        },
      });
    }

    const data = await res.text();
    console.log('KV data fetched successfully:', data);

    return new Response(data, {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'pragma': 'no-cache',
        'expires': '0',
      },
    });
  } catch (err) {
    console.error('Error in GET function:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: {
        'cache-control': 'no-store',
      },
    });
  }
}
