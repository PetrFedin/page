// Product language region; kept explicit so it can be reviewed independently.
export const RUSSIAN_REGION = new Set(['RU', 'BY', 'KZ', 'AM', 'AZ', 'KG', 'MD', 'TJ', 'UZ', 'TM']);

export function languageRedirect(request) {
  const url = new URL(request.url);
  if (!['GET', 'HEAD'].includes(request.method) || !['/', '/index.html'].includes(url.pathname)) return null;
  if (/bot|crawler|spider|preview|facebookexternalhit|chatgpt-user/i.test(request.headers.get('user-agent') || '')) return null;
  const explicit = url.searchParams.get('lang');
  const saved = (request.headers.get('cookie') || '').match(/(?:^|;\s*)syntha_lang=(ru|en)(?:;|$)/)?.[1];
  const country = request.cf?.country;
  const language = ['ru', 'en'].includes(explicit) ? explicit : saved ||
    (country && !['XX', 'T1'].includes(country) ? (RUSSIAN_REGION.has(country) ? 'ru' : 'en') :
      (/^ru\b/i.test(request.headers.get('accept-language') || '') ? 'ru' : 'en'));
  if (language === 'ru') return null;
  url.pathname = '/en/';
  return new Response(null, { status: 302, headers: {
    Location: url.href, 'Cache-Control': 'private, no-store',
    Vary: 'Cookie, Accept-Language',
  }});
}
