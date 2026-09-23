/**
 * Cloudflare Pages Function: приём заявки → сообщение в Telegram.
 * Секреты задаются в настройках проекта Pages:
 *   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
 *   TELEGRAM_CHAT_ID   — id чата получателя
 * Ничего не сохраняем: заявка только пересылается.
 */

const LIMIT = { name: 120, contact: 160, message: 4000 };

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

  const name = clean(body.name, LIMIT.name);
  const contact = clean(body.contact, LIMIT.contact);
  const message = clean(body.message, LIMIT.message);
  if (!name || !contact || !message) return new Response('missing fields', { status: 400 });

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return new Response('not configured', { status: 500 });
  }

  const topic = clean(body.topicLabel || body.topic, 60) || '—';
  const text = [
    '<b>Заявка с syntha.pro</b>',
    '',
    `<b>Тема:</b> ${esc(topic)}`,
    `<b>Имя:</b> ${esc(name)}`,
    `<b>Контакт:</b> ${esc(contact)}`,
    `<b>Язык:</b> ${esc(clean(body.lang, 4) || '—')}`,
    '',
    esc(message)
  ].join('\n');

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

  if (!tg.ok) return new Response('telegram failed', { status: 502 });
  return new Response('ok', { status: 200 });
}
