/* Проверка индексируемости сайта и список действий для поисковиков и ИИ-ассистентов.
   Страницы читаются так, как их видит робот: без выполнения скриптов. */
import { authorized, gate } from './stats.js';
import { ensureSchema } from './_lib.js';

const SITE = 'https://syntha.pro';
const PROJECTS = ['syntha', 'chatx', 'renova', 'mfw', 'promomed'];
const PAGES = [
  { path: '/', lang: 'ru', twin: '/en/' },
  { path: '/en/', lang: 'en', twin: '/' },
  ...PROJECTS.flatMap((id) => [
    { path: `/${id}`, lang: 'ru', twin: `/en/${id}` },
    { path: `/en/${id}`, lang: 'en', twin: `/${id}` }
  ])
];
const J = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const get = async (path) => {
  try {
    return await fetch(SITE + path, { headers: { 'user-agent': 'syntha-seo-audit/1.0' }, redirect: 'follow', cf: { cacheTtl: 0 } });
  } catch { return null; }
};
const one = (html, re) => (html.match(re) || [])[1] || '';

function audit(html, page, status) {
  const title = one(html, /<title>([^<]*)<\/title>/).trim();
  const desc = one(html, /<meta name="description" content="([^"]*)"/).trim();
  const canonical = one(html, /<link rel="canonical" href="([^"]*)"/);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  const hreflang = (html.match(/<link rel="alternate" hreflang=/g) || []).length;
  const robotsMeta = one(html, /<meta name="robots" content="([^"]*)"/);
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>|<svg[\s\S]*?<\/svg>|<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text ? text.split(' ').length : 0;
  const imgs = html.match(/<img\b[^>]*>/g) || [];
  const noAlt = imgs.filter((i) => !/\balt="[^"]+"/.test(i)).length;
  const expected = SITE + page.path;
  const checks = [
    ['Страница отвечает 200', status === 200],
    ['Заголовок 20–70 знаков', title.length >= 20 && title.length <= 70, `${title.length} знаков`],
    ['Описание 70–200 знаков', desc.length >= 70 && desc.length <= 200, `${desc.length} знаков`],
    ['Канонический адрес верный', canonical === expected, canonical || 'нет'],
    ['Один заголовок h1', h1 === 1, `найдено ${h1}`],
    ['Ссылки на язык-двойник (hreflang)', hreflang >= 3, `${hreflang}`],
    ['Картинка для превью ссылки', /property="og:image"/.test(html) && /name="twitter:image"/.test(html)],
    ['Разметка schema.org', /application\/ld\+json/.test(html)],
    ['Не закрыта от индексации', !/noindex/i.test(robotsMeta)],
    ['Текст виден без скриптов (150+ слов)', words >= 150, `${words} слов`],
    ['У картинок есть описание (alt)', noAlt === 0, noAlt ? `без alt: ${noAlt}` : '']
  ].map(([name, ok, note]) => ({ name, ok: !!ok, note: note || '' }));
  return { path: page.path, lang: page.lang, title, words, checks, score: Math.round(checks.filter((c) => c.ok).length / checks.length * 100) };
}

async function siteChecks() {
  const out = [];
  const robots = await get('/robots.txt'); const rt = robots?.ok ? await robots.text() : '';
  out.push({ name: 'robots.txt открыт и указывает на sitemap', ok: !!rt && /sitemap:/i.test(rt), note: rt ? '' : 'не найден' });
  out.push({ name: 'robots.txt не закрывает сайт целиком', ok: !!rt && !/^\s*disallow:\s*\/\s*$/im.test(rt) });
  const aiBots = ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot'];
  out.push({ name: 'ИИ-роботам разрешено читать сайт', ok: aiBots.every((b) => new RegExp(`user-agent:\\s*${b}`, 'i').test(rt)), note: 'GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot' });
  const sm = await get('/sitemap.xml'); const st = sm?.ok ? await sm.text() : '';
  const urls = (st.match(/<loc>/g) || []).length;
  out.push({ name: 'sitemap.xml открыт', ok: urls > 0, note: urls ? `${urls} адресов` : 'не найден' });
  out.push({ name: 'В sitemap есть пары RU/EN (hreflang)', ok: /hreflang="en"/.test(st) });
  const llms = await get('/llms.txt');
  out.push({ name: 'llms.txt — краткая карточка сайта для ИИ', ok: !!llms?.ok });
  const www = await fetch('https://www.syntha.pro/', { redirect: 'manual', cf: { cacheTtl: 0 } }).catch(() => null);
  out.push({ name: 'Адрес с www ведёт на основной (или не используется)', ok: !www || www.status === 301 || www.status === 308 || www.status >= 400, note: www ? `ответ ${www.status}` : 'не открывается' });
  const http = await fetch('http://syntha.pro/', { redirect: 'manual', cf: { cacheTtl: 0 } }).catch(() => null);
  out.push({ name: 'HTTP перенаправляет на HTTPS', ok: !http || [301, 302, 307, 308].includes(http.status), note: http ? `ответ ${http.status}` : '' });
  return out;
}

const STEPS = [
  { id: 'google', group: 'Поисковики', title: 'Google Search Console: подтвердить сайт и отправить карту сайта', url: 'https://search.google.com/search-console',
    how: ['Откройте search.google.com/search-console и войдите аккаунтом Google.', 'Нажмите «Добавить ресурс», выберите «Домен» и введите syntha.pro.', 'Google покажет TXT-запись. Добавьте её в DNS домена (Cloudflare → ваш домен → DNS → Add record: Type TXT, Name @, Content — запись от Google) и нажмите «Подтвердить».', 'В левом меню откройте «Файлы Sitemap», введите sitemap.xml, нажмите «Отправить».', 'В «Проверке URL» вставьте https://syntha.pro/ и нажмите «Запросить индексирование». Повторите для /en/ и страниц проектов.'] },
  { id: 'yandex', group: 'Поисковики', title: 'Яндекс Вебмастер: добавить сайт (важно для России и СНГ)', url: 'https://webmaster.yandex.ru',
    how: ['Откройте webmaster.yandex.ru и войдите аккаунтом Яндекса.', 'Нажмите «Добавить сайт», введите https://syntha.pro и подтвердите права: проще всего через DNS-запись TXT в Cloudflare (как у Google).', 'В разделе «Индексирование» → «Файлы Sitemap» добавьте https://syntha.pro/sitemap.xml.', 'В «Переобход страниц» отправьте главную и страницы проектов.', 'В «Региональность» укажите регион — Россия, если основной рынок здесь.'] },
  { id: 'bing', group: 'Поисковики', title: 'Bing Webmaster Tools: добавить сайт (питает ChatGPT-поиск и Copilot)', url: 'https://www.bing.com/webmasters',
    how: ['Откройте bing.com/webmasters, войдите аккаунтом Microsoft или Google.', 'Выберите «Импорт из Google Search Console» — это самый быстрый путь: сайт и sitemap перенесутся сами.', 'Проверьте, что sitemap.xml появился в «Карты сайта».', 'IndexNow уже подключён на сайте: после каждой выкладки Bing и Яндекс узнают об изменениях сами (команда npm run indexnow).'] },
  { id: 'llms', group: 'ИИ-ассистенты', title: 'llms.txt и открытый robots.txt для ИИ-роботов', url: '/llms.txt', auto: true,
    how: ['Уже сделано: сайт отдаёт /llms.txt с кратким описанием проектов и ссылками, а robots.txt разрешает GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot и другим.', 'Когда появятся новые проекты или страницы — добавляйте их в llms.txt.'] },
  { id: 'entity', group: 'ИИ-ассистенты', title: 'Единое имя и профили: чтобы ИИ понимал, что это один человек', url: '',
    how: ['Пишите имя одинаково: «Пётр Федин» по-русски и «Petr Fedin» по-английски — на сайте, в Telegram, LinkedIn, GitHub.', 'В профилях LinkedIn, GitHub и описании Telegram-канала укажите ссылку на https://syntha.pro и одну и ту же фразу о себе (например, «Фэшн-консалтинг и IT-продукты Syntha, ChatX, Renova»).', 'Если есть LinkedIn или GitHub, напишите мне ссылки — добавлю их в разметку сайта (sameAs), так связь станет явной для роботов.'] },
  { id: 'links', group: 'Ссылки на сайт', title: 'Внешние ссылки: они сильнее всего поднимают сайт в выдаче', url: '',
    how: ['Пост в Telegram-канале @syntha_pro со ссылкой на сайт закрепите, а в описание канала добавьте https://syntha.pro.', 'Опубликуйте 1–2 разбора на vc.ru, Habr, Medium или LinkedIn со ссылкой «подробнее на syntha.pro» — это бесплатно и даёт постоянные ссылки.', 'Попросите организаторов и издания, где вы выступали (Grazia, BRICS+ Fashion Summit), поставить ссылку на ваш сайт на странице с упоминанием.', 'Добавьте ссылку на сайт в подпись писем и в профили во всех соцсетях и каталогах.'] },
  { id: 'content', group: 'Содержание', title: 'Регулярные публикации: свежие страницы возвращают роботов', url: '',
    how: ['Планируйте в календаре кабинета 1–2 публикации в неделю: разбор рынка, обновление по проектам.', 'Каждый разбор пишите по схеме сайта: что произошло, разбор, мнение, выводы — такие тексты ИИ охотно цитирует.', 'Отвечайте на частые вопросы клиентов отдельными короткими материалами (форматы работы, сроки, как проходит диагностика).'] },
  { id: 'speed', group: 'Содержание', title: 'Скорость и мобильная версия', url: 'https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fsyntha.pro%2F',
    how: ['Проверьте главную на pagespeed.web.dev раз в месяц: нужны зелёные значения LCP, INP, CLS.', 'Реальные замеры у посетителей смотрите на вкладке «Техника» этого кабинета.'] }
];

export async function onRequestGet({ request, env }) {
  const ok = await authorized(request, env);
  if (ok !== true) return gate(ok);
  const [pages, site] = await Promise.all([
    Promise.all(PAGES.map(async (p) => {
      const r = await get(p.path);
      if (!r) return audit('', p, 0);
      return audit(await r.text(), p, r.status);
    })),
    siteChecks()
  ]);
  let done = {};
  let crawls = [], crawlRecent = [];
  if (env.DB && await ensureSchema(env)) {
    const row = await env.DB.prepare(`SELECT v FROM kv WHERE k = 'seo_steps'`).first();
    try { done = row ? JSON.parse(row.v) : {}; } catch { done = {}; }
    const since = Date.now() - 90 * 864e5;
    crawls = (await env.DB.prepare(`SELECT bot, kind, COUNT(*) n, MAX(ts) last FROM crawls WHERE ts >= ? GROUP BY bot, kind ORDER BY n DESC`).bind(since).all()).results;
    crawlRecent = (await env.DB.prepare(`SELECT ts, bot, kind, path, status FROM crawls ORDER BY ts DESC LIMIT 20`).all()).results;
  }
  return J({ generated: Date.now(), pages, site, steps: STEPS, done, crawls, crawlRecent });
}

export async function onRequestPost({ request, env }) {
  const ok = await authorized(request, env);
  if (ok !== true) return gate(ok);
  if (!env.DB || !(await ensureSchema(env))) return J({ error: 'no-db' }, 500);
  let b; try { b = await request.json(); } catch { return J({ error: 'bad json' }, 400); }
  const row = await env.DB.prepare(`SELECT v FROM kv WHERE k = 'seo_steps'`).first();
  let done = {}; try { done = row ? JSON.parse(row.v) : {}; } catch { done = {}; }
  if (STEPS.some((s) => s.id === b.id)) done[b.id] = !!b.done;
  await env.DB.prepare(`INSERT INTO kv (k, v, updated_at) VALUES ('seo_steps', ?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v, updated_at = excluded.updated_at`).bind(JSON.stringify(done), Date.now()).run();
  return J({ ok: true, done });
}
