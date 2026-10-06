/* Публикации: список для ленты на сайте (публично) и управление календарём (по логину и паролю). */
import { authorized, gate } from './stats.js';
import { ensureSchema, publishDue, sitePosts, mskDate } from './_lib.js';

const J = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra }
});
const clean = (v, n) => String(v ?? '').slice(0, n);
const TAGS = ['analysis', 'market', 'product', 'syntha', 'chatx', 'renova', 'mfw', 'promomed', 'mission', 'investors', 'press'];
const PROJECT_TAGS = new Set(['syntha', 'chatx', 'renova', 'mfw', 'promomed']);
const ANALYSIS_TAGS = new Set(['analysis', 'market', 'press']);

function dayKey(ms) {
  const d = new Date(Number(ms) || Date.now());
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d);
  const o = Object.fromEntries(p.map((x) => [x.type, x.value]));
  return `${o.year}-${o.month}-${o.day}`;
}
function editorialCoverage(rows) {
  const days = {};
  for (const p of rows) {
    if (!['scheduled','publishing','published'].includes(p.status)) continue;
    const day = p.post_date || dayKey(p.publish_at);
    const d = days[day] ||= { project: 0, analysis: 0, synced: 0, total: 0 };
    d.total += 1;
    if (PROJECT_TAGS.has(p.tag)) d.project += 1;
    if (ANALYSIS_TAGS.has(p.tag) && (() => { try { const s = JSON.parse(p.source || '{}'); return !!(s.outlet && s.url); } catch { return false; } })()) d.analysis += 1;
    if (p.site && p.tg) d.synced += 1;
  }
  return Object.entries(days).sort(([a],[b]) => a.localeCompare(b)).map(([date,d]) => ({
    date, ...d,
    complete: d.project >= 1 && d.analysis >= 1 && d.synced >= 2,
    missing: [
      ...(d.project < 1 ? ['project'] : []),
      ...(d.analysis < 1 ? ['analysis'] : []),
      ...(d.synced < 2 ? ['site+telegram'] : [])
    ]
  }));
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  if (!env.DB) return J([]);
  /* публичная часть: только вышедшие посты для сайта */
  if (!url.searchParams.has('all')) {
    const posts = await sitePosts(env);
    return J(posts, 200, { 'cache-control': 'public, max-age=60' });
  }
  const ok = await authorized(request, env);
  if (ok !== true) return gate(ok);
  await ensureSchema(env);
  /* заодно публикуем то, что подошло по времени */
  await publishDue(env);
  const rows = (await env.DB.prepare(`SELECT * FROM posts ORDER BY publish_at DESC LIMIT 500`).all()).results;
  return J({
    posts: rows,
    editorialCoverage: editorialCoverage(rows),
    editorialPolicy: {
      minimumPerDay: 2,
      required: ['project', 'analysis'],
      destinations: ['site', 'telegram'],
      timezone: 'Europe/Moscow'
    },
    now: Date.now(),
    channelReady: !!((env.CHANNEL_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN) && env.TELEGRAM_CHANNEL),
    cronKey: !!env.CRON_KEY
  });
}

export async function onRequestPost({ request, env }) {
  const ok = await authorized(request, env);
  if (ok !== true) return gate(ok);
  if (!env.DB) return J({ error: 'no-db' }, 500);
  await ensureSchema(env);
  let b;
  try { b = await request.json(); } catch { return J({ error: 'bad json' }, 400); }
  const now = Date.now();
  const action = clean(b.action, 20) || 'save';

  if (action === 'delete') {
    await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(Number(b.id)).run();
    return J({ ok: true });
  }

  const publishAt = Number(b.publish_at) || now;
  const tag = TAGS.includes(b.tag) ? b.tag : 'analysis';
  const tags = (arr) => JSON.stringify((Array.isArray(arr) ? arr : String(arr || '').split(',')).map((t) => clean(t, 40).trim()).filter(Boolean).slice(0, 8));
  const src = b.source && (b.source.outlet || b.source.original || b.source.url) ? JSON.stringify({
    outlet: clean(b.source.outlet, 120),
    author: clean(b.source.author, 160),
    original: clean(b.source.original, 300),
    url: clean(b.source.url, 1000)
  }) : '';
  const status = action === 'schedule' ? 'scheduled' : action === 'draft' ? 'draft' : (b.status === 'scheduled' ? 'scheduled' : 'draft');
  const editorialRequired = PROJECT_TAGS.has(tag) || ANALYSIS_TAGS.has(tag);
  const site = editorialRequired && (action === 'schedule' || action === 'now') ? 1 : (b.site ? 1 : 0);
  const tg = editorialRequired && (action === 'schedule' || action === 'now') ? 1 : (b.tg ? 1 : 0);
  const vals = [publishAt, status, site, tg, tag,
    clean(b.ru_title, 300), clean(b.ru_body, 12000), tags(b.ru_tags),
    clean(b.en_title, 300), clean(b.en_body, 12000), tags(b.en_tags), src, now];

  let id = Number(b.id) || 0;
  if (id) {
    await env.DB.prepare(`UPDATE posts SET publish_at=?, status=?, site=?, tg=?, tag=?, ru_title=?, ru_body=?, ru_tags=?, en_title=?, en_body=?, en_tags=?, source=?, error='', updated_at=? WHERE id=? AND status != 'published'`)
      .bind(...vals, id).run();
  } else {
    const r = await env.DB.prepare(`INSERT INTO posts (publish_at, status, site, tg, tag, ru_title, ru_body, ru_tags, en_title, en_body, en_tags, source, updated_at, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(...vals, now).run();
    id = r.meta?.last_row_id;
  }
  if (action === 'now') {
    await env.DB.prepare('UPDATE posts SET publish_at = ? WHERE id = ?').bind(now, id).run();
    await publishDue(env, { onlyId: id });
  }
  const row = (await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first());
  return J({ ok: true, post: row, date: mskDate(publishAt) });
}
