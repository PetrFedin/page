/**
 * Данные для страницы /stats. Доступ только по логину и паролю (HTTP Basic):
 *   STATS_USER, STATS_PASSWORD — секреты проекта Pages.
 * Ничего не пишет, только читает базу D1 (привязка DB).
 */
const enc = new TextEncoder();

async function same(a, b) {
  const [x, y] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b))
  ]);
  const ax = new Uint8Array(x), ay = new Uint8Array(y);
  let d = 0;
  for (let i = 0; i < ax.length; i++) d |= ax[i] ^ ay[i];
  return d === 0;
}

export async function authorized(request, env) {
  if (!env.STATS_USER || !env.STATS_PASSWORD) return 'unset';
  const h = request.headers.get('authorization') || '';
  if (!h.startsWith('Basic ')) return false;
  let pair;
  try { pair = new TextDecoder().decode(Uint8Array.from(atob(h.slice(6)), (c) => c.charCodeAt(0))); } catch { return false; }
  const i = pair.indexOf(':');
  if (i < 0) return false;
  const okUser = await same(pair.slice(0, i), env.STATS_USER);
  const okPass = await same(pair.slice(i + 1), env.STATS_PASSWORD);
  return okUser && okPass;
}

export function gate(ok) {
  if (ok === 'unset') return new Response('Статистика не настроена: задайте STATS_USER и STATS_PASSWORD.', { status: 503, headers: { 'cache-control': 'no-store' } });
  return new Response('Нужен логин и пароль', {
    status: 401,
    headers: { 'www-authenticate': 'Basic realm="syntha.pro stats", charset="UTF-8"', 'cache-control': 'no-store' }
  });
}

const HEAD = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' };
const MSK = 3 * 3600;

export async function onRequestGet({ request, env }) {
  const ok = await authorized(request, env);
  if (ok !== true) return gate(ok);
  if (!env.DB) return new Response(JSON.stringify({ error: 'no-db' }), { status: 500, headers: HEAD });

  const url = new URL(request.url);
  const q = async (sql, ...args) => (await env.DB.prepare(sql).bind(...args).all()).results ?? [];

  /* Путь одного человека по сайту. */
  const vid = url.searchParams.get('vid');
  if (vid) {
    const events = await q(`SELECT ts, sid, type, path, target, label, data FROM events WHERE vid = ? ORDER BY ts LIMIT 600`, vid);
    const subs = await q(`SELECT ts, name, email, telegram, phone, entity, topic, message, ok FROM submissions WHERE vid = ? ORDER BY ts`, vid);
    return new Response(JSON.stringify({ events, subs }), { headers: HEAD });
  }

  const days = Math.min(Math.max(Number(url.searchParams.get('days')) || 30, 1), 365);
  const since = Date.now() - days * 864e5;

  const [totals] = await q(`SELECT COUNT(DISTINCT vid) visitors, COUNT(DISTINCT sid) sessions,
      SUM(type='pageview') views FROM events WHERE ts >= ?`, since);
  /* Предыдущий период такой же длины — для сравнения «стало лучше или хуже». */
  const prevSince = since - days * 864e5;
  const [prev] = await q(`SELECT COUNT(DISTINCT vid) visitors, COUNT(DISTINCT sid) sessions,
      SUM(type='pageview') views, COUNT(DISTINCT CASE WHEN type='form_sent' THEN sid END) sent
      FROM events WHERE ts >= ? AND ts < ?`, prevSince, since);
  const [now5] = await q(`SELECT COUNT(DISTINCT vid) n FROM events WHERE ts >= ?`, Date.now() - 5 * 60e3);
  const [now30] = await q(`SELECT COUNT(DISTINCT vid) n FROM events WHERE ts >= ?`, Date.now() - 30 * 60e3);
  const [ret] = await q(`SELECT COUNT(DISTINCT e.vid) n FROM events e WHERE e.ts >= ?
      AND EXISTS (SELECT 1 FROM events o WHERE o.vid = e.vid AND o.ts < ?)`, since, since);
  const hours = await q(`SELECT CAST(strftime('%H', ts/1000 + ${MSK}, 'unixepoch') AS INTEGER) h, COUNT(DISTINCT sid) n
      FROM events WHERE type='pageview' AND ts >= ? GROUP BY h`, since);
  const weekdays = await q(`SELECT CAST(strftime('%w', ts/1000 + ${MSK}, 'unixepoch') AS INTEGER) d, COUNT(DISTINCT sid) n
      FROM events WHERE type='pageview' AND ts >= ? GROUP BY d`, since);
  const live = await q(`SELECT ts, vid, type, path, target, label, data, country, city, device FROM events
      WHERE type NOT IN ('scroll','leave','section','vitals','form_field') ORDER BY ts DESC LIMIT 15`);
  const subCount = await q(`SELECT COUNT(*) n FROM submissions WHERE ts >= ?`, since);
  const [dur] = await q(`SELECT AVG(CAST(json_extract(data,'$.sec') AS REAL)) sec FROM events
      WHERE type='leave' AND ts >= ? AND CAST(json_extract(data,'$.sec') AS REAL) BETWEEN 1 AND 3600`, since);
  const daily = await q(`SELECT strftime('%Y-%m-%d', ts/1000 + ${MSK}, 'unixepoch') d,
      COUNT(DISTINCT vid) visitors, SUM(type='pageview') views FROM events WHERE ts >= ? GROUP BY d ORDER BY d`, since);
  const pages = await q(`SELECT CASE WHEN instr(path,'#')>0 THEN substr(path,1,instr(path,'#')-1) ELSE path END p,
      COUNT(*) n, COUNT(DISTINCT vid) u FROM events WHERE type='pageview' AND ts >= ? GROUP BY p ORDER BY n DESC LIMIT 20`, since);
  const sections = await q(`SELECT target, COUNT(DISTINCT sid) n FROM events WHERE type='section' AND ts >= ? GROUP BY target ORDER BY n DESC`, since);
  const depth = await q(`SELECT target, COUNT(DISTINCT sid) n FROM events WHERE type='scroll' AND ts >= ? GROUP BY target ORDER BY CAST(target AS INTEGER)`, since);
  const clicks = await q(`SELECT type, target, label, COUNT(*) n, COUNT(DISTINCT vid) u FROM events
      WHERE type IN ('click','download') AND ts >= ? GROUP BY type, target, label ORDER BY n DESC LIMIT 80`, since);
  const modals = await q(`SELECT target, label, COUNT(*) n, COUNT(DISTINCT vid) u FROM events WHERE type='modal' AND ts >= ? GROUP BY target, label ORDER BY n DESC LIMIT 40`, since);
  const views = await q(`SELECT target, COUNT(*) n, COUNT(DISTINCT vid) u FROM events WHERE type='view' AND ts >= ? GROUP BY target ORDER BY n DESC LIMIT 40`, since);
  const refs = await q(`SELECT ref, COUNT(DISTINCT vid) n FROM events WHERE type='pageview' AND ts >= ? GROUP BY ref ORDER BY n DESC LIMIT 40`, since);
  const geo = await q(`SELECT country, city, COUNT(DISTINCT vid) n FROM events WHERE ts >= ? AND country != '' GROUP BY country, city ORDER BY n DESC LIMIT 40`, since);
  const tech = {};
  for (const col of ['device', 'browser', 'os', 'lang']) {
    tech[col] = await q(`SELECT ${col} k, COUNT(DISTINCT vid) n FROM events WHERE ts >= ? AND ${col} != '' GROUP BY ${col} ORDER BY n DESC LIMIT 12`, since);
  }
  const vrows = await q(`SELECT json_extract(data,'$.lcp') lcp, json_extract(data,'$.cls') cls, json_extract(data,'$.inp') inp, device
      FROM events WHERE type='vitals' AND ts >= ? LIMIT 5000`, since);
  const p75 = (arr) => { const a = arr.filter((x) => x != null).sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.floor(a.length * 0.75))] : null; };
  const vitals = { n: vrows.length, lcp: p75(vrows.map((r) => r.lcp)), cls: p75(vrows.map((r) => r.cls)), inp: p75(vrows.map((r) => r.inp)) };
  const [fun] = await q(`SELECT
      COUNT(DISTINCT CASE WHEN type='pageview' THEN sid END) visit,
      COUNT(DISTINCT CASE WHEN type='section' AND target='contact' THEN sid END) saw_form,
      COUNT(DISTINCT CASE WHEN type='form_start' THEN sid END) started,
      COUNT(DISTINCT CASE WHEN type='form_sent' THEN sid END) sent,
      SUM(type='form_failed') failed, SUM(type='form_error') errors
      FROM events WHERE ts >= ?`, since);
  const fields = await q(`SELECT target, COUNT(DISTINCT sid) n FROM events WHERE type='form_field' AND ts >= ? GROUP BY target ORDER BY n DESC`, since);
  const errors = await q(`SELECT label, COUNT(*) n FROM events WHERE type='form_error' AND ts >= ? GROUP BY label ORDER BY n DESC LIMIT 20`, since);
  const abandons = await q(`SELECT ts, vid, label, country, city FROM events WHERE type='form_abandon' AND ts >= ? ORDER BY ts DESC LIMIT 30`, since);
  const quiz = await q(`SELECT type, target, label, COUNT(*) n FROM events WHERE type IN ('quiz_step','quiz_result') AND ts >= ? GROUP BY type, target, label ORDER BY type, n DESC LIMIT 60`, since);
  const submissions = await q(`SELECT id, ts, vid, name, email, telegram, phone, entity, topic, message, lang, file_name, country, city, ok
      FROM submissions WHERE ts >= ? ORDER BY ts DESC LIMIT 100`, since);
  const visitors = await q(`SELECT vid, MIN(ts) first, MAX(ts) last, COUNT(*) n, COUNT(DISTINCT sid) sessions,
      MAX(country) country, MAX(city) city, MAX(device) device, MAX(browser) browser, MAX(os) os, MAX(org) org, MAX(ip) ip,
      SUM(type='pageview') views, MAX(CASE WHEN type='pageview' THEN ref END) ref
      FROM events WHERE ts >= ? GROUP BY vid ORDER BY last DESC LIMIT 80`, since);
  const names = await q(`SELECT vid, name FROM submissions WHERE vid != '' AND ts >= ?`, since);
  const editorial = await q(`
    SELECT
      json_extract(data,'$.content.date') post_date,
      MAX(json_extract(data,'$.content.title')) title,
      MAX(json_extract(data,'$.content.tag')) tag,
      MAX(json_extract(data,'$.content.source')) source,
      COUNT(DISTINCT CASE WHEN type='content_open' THEN sid END) readers,
      COUNT(CASE WHEN type='content_open' THEN 1 END) opens,
      COUNT(DISTINCT CASE WHEN type='content_to_project' THEN sid END) to_project,
      COUNT(DISTINCT CASE WHEN type='form_start' THEN sid END) form_starts,
      COUNT(DISTINCT CASE WHEN type='form_sent' THEN sid END) leads
    FROM events
    WHERE ts >= ? AND json_extract(data,'$.content.date') IS NOT NULL
    GROUP BY post_date
    ORDER BY readers DESC, opens DESC
    LIMIT 200`, since);
  const editorialSources = await q(`
    SELECT
      json_extract(data,'$.content.source') source,
      COUNT(DISTINCT CASE WHEN type='content_open' THEN sid END) readers,
      COUNT(DISTINCT CASE WHEN type='content_to_project' THEN sid END) to_project,
      COUNT(DISTINCT CASE WHEN type='form_sent' THEN sid END) leads
    FROM events
    WHERE ts >= ? AND COALESCE(json_extract(data,'$.content.source'),'') != ''
    GROUP BY source
    ORDER BY readers DESC
    LIMIT 80`, since);
  const editorialTopics = await q(`
    SELECT
      json_extract(data,'$.content.tag') tag,
      COUNT(DISTINCT CASE WHEN type='content_open' THEN sid END) readers,
      COUNT(DISTINCT CASE WHEN type='content_to_project' THEN sid END) to_project,
      COUNT(DISTINCT CASE WHEN type='form_sent' THEN sid END) leads
    FROM events
    WHERE ts >= ? AND COALESCE(json_extract(data,'$.content.tag'),'') != ''
    GROUP BY tag
    ORDER BY readers DESC
    LIMIT 40`, since);

  return new Response(JSON.stringify({
    days, totals, prev, online: { m5: now5?.n ?? 0, m30: now30?.n ?? 0 }, returning: ret?.n ?? 0, hours, weekdays, live, leadsCount: subCount[0]?.n ?? 0, generated: Date.now(), avgSec: dur?.sec ?? null, daily, pages, sections, depth, clicks, modals, views, refs, geo, tech,
    funnel: fun, vitals, fields, errors, abandons, quiz, submissions, visitors, names,
    editorial, editorialSources, editorialTopics
  }), { headers: HEAD });
}
