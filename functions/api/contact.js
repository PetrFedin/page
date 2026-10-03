/**
 * Cloudflare Pages Function: приём заявки → сообщение в Telegram.
 * Секреты задаются в настройках проекта Pages:
 *   TELEGRAM_BOT_TOKEN   — токен бота от @BotFather
 *   TELEGRAM_CHAT_ID     — id чата получателя
 *   TURNSTILE_SECRET_KEY — секретный ключ виджета Turnstile (не задан — проверка пропускается)
 * Ничего не сохраняем: заявка только пересылается.
 */

const LIMIT = { name: 120, contact: 160, message: 4000, entity: 200 };

const clean = (v, max) => String(v ?? '').trim().slice(0, max);
const esc = (s) => s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

const MAX_FILE = 20 * 1024 * 1024;

export async function onRequestPost({ request, env }) {
  /* Заявка приходит либо JSON, либо multipart — когда приложен файл. */
  let body = {};
  let file = null;
  const type = request.headers.get('content-type') ?? '';

  if (type.includes('multipart/form-data')) {
    const form = await request.formData();
    for (const [k, v] of form.entries()) {
      if (k === 'file' && typeof v === 'object') file = v;
      else body[k] = v;
    }
    if (file && file.size > MAX_FILE) return new Response('file too large', { status: 413 });
  } else {
    try {
      body = await request.json();
    } catch {
      return new Response('bad json', { status: 400 });
    }
  }

  if (clean(body.company, 50)) return new Response('ok', { status: 200 }); // honeypot

  /* Turnstile: токен приходит из виджета на странице (поле cf-turnstile-response). */
  if (env.TURNSTILE_SECRET_KEY) {
    const token = clean(body['cf-turnstile-response'], 2000);
    if (!token) return new Response('captcha required', { status: 400 });
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: request.headers.get('cf-connecting-ip') || undefined
      })
    });
    const result = await verify.json().catch(() => ({ success: false }));
    if (!result.success) return new Response('captcha failed', { status: 400 });
  }

  const first = clean(body.name, LIMIT.name);
  const surname = clean(body.surname, LIMIT.name);
  const patronymic = clean(body.patronymic, LIMIT.name);
  const name = [surname, first, patronymic].filter(Boolean).join(' ');
  const email = clean(body.email, LIMIT.contact);
  const telegram = clean(body.telegram, LIMIT.contact);
  const phone = clean(body.phone, LIMIT.contact);
  const message = clean(body.message, LIMIT.message);
  /* Нужны имя, сообщение и хотя бы один способ связи. */
  if (!first || !message || !(email || telegram || phone)) return new Response('missing fields', { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return new Response('bad email', { status: 400 });

  const entity = {
    name: clean(body.entityName, LIMIT.entity),
    inn: clean(body.entityInn, 20),
    address: clean(body.entityAddress, LIMIT.entity),
    site: clean(body.entitySite, LIMIT.entity)
  };
  const isEntity = Object.values(entity).some(Boolean);

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return new Response('not configured', { status: 500 });
  }

  const topic = clean(body.topicLabel || body.topic, 60) || '—';
  const line = (cond, v) => (cond ? v : null);
  const text = [
    '<b>Заявка с syntha.pro</b>',
    '',
    `<b>Тема:</b> ${esc(topic)}`,
    `<b>Имя:</b> ${esc(name)}`,
    line(email, `<b>Email:</b> ${esc(email)}`),
    line(telegram, `<b>Telegram:</b> ${esc(telegram)}`),
    line(phone, `<b>Телефон:</b> ${esc(phone)}`),
    line(isEntity, `<b>Юрлицо:</b> ${esc([entity.name, entity.inn && `ИНН ${entity.inn}`].filter(Boolean).join(', ') || '—')}`),
    line(entity.address, `<b>Адрес:</b> ${esc(entity.address)}`),
    line(entity.site, `<b>Сайт:</b> ${esc(entity.site)}`),
    `<b>Язык:</b> ${esc(clean(body.lang, 4) || '—')}`,
    '',
    esc(message)
  ].filter((l) => l !== null).join('\n');

  /* Файл уходит документом, а текст заявки — подписью к нему:
     так заявка и вложение остаются одним сообщением. */
  let tg;
  if (file) {
    const fd = new FormData();
    fd.append('chat_id', env.TELEGRAM_CHAT_ID);
    fd.append('caption', text.slice(0, 1024));
    fd.append('parse_mode', 'HTML');
    fd.append('document', file, file.name || 'file');
    tg = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendDocument`, {
      method: 'POST', body: fd
    });
    /* Подпись к документу ограничена 1024 знаками — длинное сообщение досылаем отдельно. */
    if (tg.ok && text.length > 1024) {
      await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true })
      });
    }
  } else {
    tg = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
  }

  if (!tg.ok) {
    console.error('telegram api error', tg.status, await tg.text());
    await save(env, request, body, { name, email, telegram, phone, entity, topic, message, file, ok: 0 });
    return new Response('telegram failed', { status: 502 });
  }
  await save(env, request, body, { name, email, telegram, phone, entity, topic, message, file, ok: 1 });
  return new Response('ok', { status: 200 });
}

/* Копия заявки в базе статистики — чтобы видеть текст и путь человека по сайту.
   Ошибка записи заявку не ломает: в Telegram она уже ушла. */
async function save(env, request, body, d) {
  if (!env.DB) return;
  try {
    const cf = request.cf || {};
    await env.DB.prepare(
      `INSERT INTO submissions (ts, vid, sid, name, email, telegram, phone, entity, topic, message, lang, file_name, country, city, ok)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      Date.now(), clean(body.vid, 40), clean(body.sid, 40), d.name, d.email, d.telegram, d.phone,
      Object.values(d.entity).some(Boolean) ? JSON.stringify(d.entity) : '', d.topic, d.message,
      clean(body.lang, 4), d.file?.name ?? '', cf.country ?? '', cf.city ?? '', d.ok
    ).run();
    await env.DB.prepare(
      `INSERT INTO events (ts, vid, sid, type, path, target, label, data, country, city) VALUES (?,?,?,?,?,?,?,?,?,?)`
    ).bind(Date.now(), clean(body.vid, 40), clean(body.sid, 40), d.ok ? 'form_sent' : 'form_failed', '/', 'contact-form',
      d.topic, JSON.stringify({ file: d.file?.name ?? null }), cf.country ?? '', cf.city ?? '').run();
  } catch (err) {
    console.error('stats save failed', String(err));
  }
}
