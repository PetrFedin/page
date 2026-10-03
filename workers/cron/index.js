/* Таймер публикаций: раз в 5 минут просит сайт выпустить посты, у которых подошло время.
   Секрет CRON_KEY задаётся у воркера командой wrangler secret put CRON_KEY. */
export default {
  async scheduled(_event, env) {
    const res = await fetch(`https://syntha.pro/api/cron?key=${encodeURIComponent(env.CRON_KEY)}`, { headers: { 'user-agent': 'syntha-cron/1.0' } });
    console.log('cron', res.status, await res.text());
  },
  async fetch() { return new Response('syntha-cron: ok', { status: 200 }); }
};
