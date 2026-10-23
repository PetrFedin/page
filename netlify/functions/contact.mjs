/**
 * Netlify-only V2 contact adapter.
 * Reuses the audited consent, Turnstile and private-Telegram delivery logic.
 * No lead is stored or delivered if the three required secrets are absent.
 */
import { onRequestPost } from '../../functions/api/contact.js';

const MAX_FILE_BYTES = 3 * 1024 * 1024;
const MAX_REQUEST_BYTES = 4 * 1024 * 1024;

function configEnv() {
  const read = (name) => {
    try { return globalThis.Netlify?.env?.get?.(name) || process.env[name] || ''; }
    catch { return ''; }
  };
  return {
    TURNSTILE_SECRET_KEY: read('TURNSTILE_SECRET_KEY'),
    TELEGRAM_BOT_TOKEN: read('TELEGRAM_BOT_TOKEN'),
    TELEGRAM_CHAT_ID: read('TELEGRAM_CHAT_ID')
  };
}
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}
function ready(env) {
  // Direct private chat IDs are positive; negative chat IDs indicate groups/channels.
  return !!env.TURNSTILE_SECRET_KEY && !!env.TELEGRAM_BOT_TOKEN &&
    /^[1-9]\d{2,19}$/.test(String(env.TELEGRAM_CHAT_ID));
}

export default async function contact(request, context) {
  const env = configEnv();
  if (request.method === 'GET') {
    return json({ ready: ready(env), maxFileBytes: MAX_FILE_BYTES }, ready(env) ? 200 : 503);
  }
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  if (!ready(env)) return json({ error: 'contact_not_configured' }, 503);
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return json({ error: 'cross_origin_rejected' }, 403);
      }
    } catch { return json({ error: 'invalid_origin' }, 403); }
  }
  const length = Number(request.headers.get('content-length') || 0);
  if (!Number.isFinite(length) || length > MAX_REQUEST_BYTES) {
    return json({ error: 'request_too_large' }, 413);
  }
  const ct = request.headers.get('content-type') || '';
  if (!ct.includes('application/json') && !ct.includes('multipart/form-data')) {
    return json({ error: 'unsupported_content_type' }, 415);
  }
  if (ct.includes('multipart/form-data')) {
    try {
      const fields = await request.clone().formData();
      const file = fields.get('file');
      if (file && (typeof file.size !== 'number' || file.size > MAX_FILE_BYTES)) {
        return json({ error: 'file_too_large' }, 413);
      }
    } catch { return json({ error: 'invalid_multipart' }, 400); }
  } else if (length > 64 * 1024) {
    return json({ error: 'json_too_large' }, 413);
  }
  // Cloudflare-specific D1 is intentionally absent. Nothing is saved to public site storage.
  // Telegram getChat is independently verified as type=private in the shared handler.
  try {
    const response = await onRequestPost({ request, env });
    return new Response(response.body, { status: response.status, headers: {
      'cache-control': 'no-store', 'content-type': 'text/plain; charset=utf-8'
    }});
  } catch {
    return json({ error: 'delivery_unavailable' }, 503);
  }
}
export const config = {
  path: '/api/contact',
  method: ['GET', 'POST'],
  rateLimit: { action: 'rate_limit', aggregateBy: 'ip', windowSize: 60, windowLimit: 5 }
};