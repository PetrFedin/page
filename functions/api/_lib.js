/* Общие помощники кабинета: схема базы, публикация постов по расписанию, отправка в Telegram.
   Таблицы создаются при первом обращении — вручную ничего делать не нужно. */

const DAY = 864e5;
const MSK = 3 * 3600e3;

let ready = null;
export function ensureSchema(env) {
  if (!env.DB) return Promise.resolve(false);
  ready ??= env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      publish_at INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      site INTEGER NOT NULL DEFAULT 1,
      tg INTEGER NOT NULL DEFAULT 0,
      tag TEXT NOT NULL DEFAULT 'analysis',
      ru_title TEXT, ru_body TEXT, ru_tags TEXT,
      en_title TEXT, en_body TEXT, en_tags TEXT,
      source TEXT,
      post_date TEXT,
      tg_ids TEXT, error TEXT,
      created_at INTEGER, updated_at INTEGER, published_at INTEGER
    )`),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS posts_due ON posts (status, publish_at)'),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT, updated_at INTEGER)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS crawls (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, bot TEXT, kind TEXT, path TEXT, status INTEGER)`),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS crawls_ts ON crawls (ts)')
  ]).then(() => true).catch((e) => { ready = null; console.error('schema failed', String(e)); return false; });
  return ready;
}

export const mskDate = (ms) => new Date(ms + MSK).toISOString().slice(0, 10);

const esc = (s) => String(s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

/* Текст поста для канала: заголовок жирным, затем текст и теги отдельной строкой.
   Telegram принимает до 4096 знаков — длинное режем по абзацу и даём ссылку на полный текст. */
export function tgText(p) {
  const tags = (JSON.parse(p.ru_tags || '[]') || []).map((t) => `#${String(t).replace(/\s+/g, '')}`).join(' ');
  const link = `https://syntha.pro/#post-${p.post_date}`;
  let body = String(p.ru_body || '');
  const head = `<b>${esc(p.ru_title)}</b>\n\n`;
  const tail = (tags ? `\n\n${esc(tags)}` : '');
  const full = `${head}${esc(body)}${tail}`;
  if (full.length <= 4000) return full;
  const room = 4000 - head.length - tail.length - 80;
  const cut = body.slice(0, room);
  const para = cut.lastIndexOf('\n\n');
  body = cut.slice(0, para > room * 0.5 ? para : room);
  return `${head}${esc(body)}\n\n<a href="${link}">Читать целиком</a>${tail}`;
}

export async function sendTg(env, text) {
  const token = env.CHANNEL_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN;
  const chat = env.TELEGRAM_CHANNEL;
  if (!token || !chat) return { ok: false, error: 'Не заданы CHANNEL_BOT_TOKEN и TELEGRAM_CHANNEL' };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true })
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.ok) return { ok: false, error: j.description || `Telegram ${res.status}` };
    return { ok: true, id: j.result?.message_id };
  } catch (e) {
    return { ok: false, error: `сеть: ${String(e).slice(0, 80)}` };
  }
}

/* Публикует всё, что назначено на время не позже «сейчас». Возвращает число обработанных. */
export async function publishDue(env, { onlyId } = {}) {
  if (!(await ensureSchema(env))) return 0;
  const now = Date.now();
  const due = onlyId
    ? (await env.DB.prepare(`SELECT * FROM posts WHERE id = ? AND status IN ('draft','scheduled','failed')`).bind(onlyId).all()).results
    : (await env.DB.prepare(`SELECT * FROM posts WHERE status = 'scheduled' AND publish_at <= ? ORDER BY publish_at LIMIT 5`).bind(now).all()).results;
  let n = 0;
  for (const p of due) {
    /* захватываем пост: второй параллельный вызов его уже не получит */
    const claim = await env.DB.prepare(`UPDATE posts SET status = 'publishing', updated_at = ? WHERE id = ? AND status IN ('draft','scheduled','failed')`).bind(now, p.id).run();
    if (!claim.meta?.changes) continue;
    const date = p.post_date || mskDate(Math.max(p.publish_at, now));
    p.post_date = date;
    let tgIds = [], error = '';
    if (p.tg) {
      const r = await sendTg(env, tgText(p));
      if (r.ok) tgIds.push(r.id); else error = r.error;
    }
    const failed = p.tg && error;
    await env.DB.prepare(`UPDATE posts SET status = ?, post_date = ?, tg_ids = ?, error = ?, published_at = ?, updated_at = ? WHERE id = ?`)
      .bind(failed ? 'failed' : 'published', date, JSON.stringify(tgIds), error, failed ? null : now, now, p.id).run();
    n++;
  }
  return n;
}

/* Посты для ленты на сайте — в том же виде, что и записи assets/news.js. */
export async function sitePosts(env) {
  if (!(await ensureSchema(env))) return [];
  const rows = (await env.DB.prepare(`SELECT * FROM posts WHERE status = 'published' AND site = 1 ORDER BY published_at DESC LIMIT 200`).all()).results;
  return rows.map((p) => {
    const src = p.source ? JSON.parse(p.source) : null;
    const side = (lang) => ({
      tags: JSON.parse(p[`${lang}_tags`] || '[]'),
      title: p[`${lang}_title`] || '',
      body: p[`${lang}_body`] || ''
    });
    const post = { date: p.post_date, tag: p.tag, dynamic: true, ru: side('ru') };
    if (p.en_title && p.en_body) post.en = side('en');
    if (src?.outlet) post.source = { outlet: src.outlet, author: src.author || null, original: src.original || null };
    return post;
  });
}
export { DAY };
