/**
 * Приём событий статистики: посещения, разделы, нажатия, форма.
 * Пишет в базу D1 (привязка DB). Нет базы — тихо отвечает 204, сайту это не мешает.
 */
const BOT = /bot|crawl|spider|slurp|bing|yandex|baidu|duckduck|facebookexternalhit|preview|monitor|headless|lighthouse|pingdom|uptime|curl|wget|python|go-http|httpclient|axios|node-fetch/i;
const ALLOWED = /(^|\.)(syntha\.pro|syntha-pro-landing\.pages\.dev)$/;

const cut = (v, n) => String(v ?? '').slice(0, n);

function ua(s) {
  const device = /ipad|tablet/i.test(s) ? 'tablet' : /mobi|iphone|android/i.test(s) ? 'phone' : 'desktop';
  const browser = /edg\//i.test(s) ? 'Edge' : /opr\/|opera/i.test(s) ? 'Opera' : /yabrowser/i.test(s) ? 'Yandex'
    : /firefox|fxios/i.test(s) ? 'Firefox' : /chrome|crios/i.test(s) ? 'Chrome' : /safari/i.test(s) ? 'Safari' : 'other';
  const os = /windows/i.test(s) ? 'Windows' : /iphone|ipad|ios/i.test(s) ? 'iOS' : /android/i.test(s) ? 'Android'
    : /mac os|macintosh/i.test(s) ? 'macOS' : /linux/i.test(s) ? 'Linux' : 'other';
  return { device, browser, os };
}

import { publishDue } from './_lib.js';

export async function onRequestPost({ request, env, waitUntil }) {
  const done = () => new Response(null, { status: 204 });
  if (!env.DB) return done();

  const origin = request.headers.get('origin') || request.headers.get('referer') || '';
  try { if (origin && !ALLOWED.test(new URL(origin).hostname)) return done(); } catch { return done(); }

  const agent = request.headers.get('user-agent') || '';
  if (!agent || BOT.test(agent)) return done();

  let body;
  try { body = JSON.parse(await request.text()); } catch { return done(); }
  const events = Array.isArray(body?.events) ? body.events.slice(0, 40) : [];
  if (!events.length) return done();

  const cf = request.cf || {};
  const { device, browser, os } = ua(agent);
  const vid = cut(body.vid, 40);
  const sid = cut(body.sid, 40);
  const lang = cut(body.lang, 8);
  const ip = request.headers.get('cf-connecting-ip') || '';
  const now = Date.now();

  const stmt = env.DB.prepare(
    `INSERT INTO events (ts, vid, sid, type, path, target, label, data, lang, country, city, org, device, browser, os, ref, ip)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  );
  const rows = events.map((e) => {
    const type = cut(e?.type, 24);
    const ts = Number(e?.t) > now - 36e5 && Number(e?.t) <= now + 6e4 ? Number(e.t) : now;
    const isView = type === 'pageview';
    return stmt.bind(
      ts, vid, sid, type, cut(e?.path, 200), cut(e?.target, 120), cut(isView ? '' : e?.label, 200),
      e?.data ? cut(JSON.stringify(e.data), 400) : '', lang,
      cf.country ?? '', cf.city ?? '', cut(cf.asOrganization, 80), device, browser, os,
      isView ? cut(e?.label, 200) : '', isView ? ip : ''
    );
  });
  /* Статистика хранится не дольше года: изредка чистим старое. */
  if (Math.random() < 0.01) rows.push(env.DB.prepare('DELETE FROM events WHERE ts < ?').bind(now - 365 * 864e5));
  try { await env.DB.batch(rows); } catch (err) { console.error('t insert failed', String(err)); }
  /* Посты, у которых подошло время, выходят при ближайшем визите — отдельный таймер не обязателен. */
  try { waitUntil?.(publishDue(env)); } catch { /* не критично */ }
  return done();
}
