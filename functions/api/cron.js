/* Публикует посты, у которых наступило время. Вызывается раз в несколько минут
   внешним таймером (Cloudflare Cron Worker или любой бесплатный сервис) с секретным ключом. */
import { publishDue, editorialPublishingEnabled } from './_lib.js';

export async function onRequest({ request, env }) {
  const key = new URL(request.url).searchParams.get('key') || request.headers.get('x-cron-key') || '';
  if (!env.CRON_KEY || key !== env.CRON_KEY) return new Response('forbidden', { status: 403 });
  if (!editorialPublishingEnabled(env)) return new Response(JSON.stringify({published:0,enabled:false}),{
    status:503,headers:{'content-type':'application/json','cache-control':'no-store'}
  });
  const n = await publishDue(env);
  return new Response(JSON.stringify({ published: n }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
