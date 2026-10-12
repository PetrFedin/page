/**
 * Cloudflare Pages Function: приём заявки → сообщение в Telegram.
 * Секреты задаются в настройках проекта Pages:
 *   TELEGRAM_BOT_TOKEN   — токен бота от @BotFather
 *   TELEGRAM_CHAT_ID     — id чата получателя
 *   TURNSTILE_SECRET_KEY — обязательный секрет Turnstile (при отсутствии отправка закрыта)
 * Заявка пересылается ТОЛЬКО в приватный Telegram-чат; опционально сохраняется в закрытой D1.
 * Без реальной конфигурации Cloudflare Pages и успешного Turnstile LIVE приёмка остаётся HOLD.
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

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return new Response('invalid payload', { status: 400 });
  }
  if (clean(body.company, 50)) return new Response('ok', { status: 200 }); // honeypot

  /* Fail closed: there must be a verified Turnstile token before any private lead is forwarded. */
  if (!env.TURNSTILE_SECRET_KEY) return new Response('captcha not configured', { status: 503 });
  const token = clean(body['cf-turnstile-response'], 2000);
  if (!token) return new Response('captcha required', { status: 400 });
  let challenge;
  try {
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: request.headers.get('cf-connecting-ip') || undefined
      })
    });
    if (!verify.ok) return new Response('captcha service unavailable', { status: 503 });
    challenge = await verify.json();
  } catch (err) {
    console.error('turnstile verification unavailable');
    return new Response('captcha service unavailable', { status: 503 });
  }
  if (challenge?.success !== true) return new Response('captcha failed', { status: 400 });

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
  const leadContext = {
    route: clean(body.leadRoute, 40),
    project: clean(body.leadProject, 40),
    timing: clean(body.leadTiming, 80),
    goal: clean(body.leadGoal, 160),
    scope: clean(body.leadScope, 300),
    contribution: clean(body.leadContribution, 160),
    format: clean(body.leadFormat, 160),
    firstCase: clean(body.leadFirstCase, 300),
    investorType: clean(body.leadInvestorType, 160),
    investorFocus: clean(body.leadInvestorFocus, 160),
    nextStep: clean(body.leadNextStep, 300),
    diligencePurpose: clean(body.leadDiligencePurpose, 160),
    accessLevel: clean(body.leadAccessLevel, 160),
    questions: clean(body.leadQuestions, 500),
    brief: clean(body.leadBrief, 1600)
  };
  const line = (cond, v) => (cond ? v : null);
  const capHtml = (input, maxChars = 240) => {
    let out = '';
    for (const char of String(input)) {
      const encoded = esc(char);
      if (out.length + encoded.length > maxChars) return out + '…';
      out += encoded;
    }
    return out;
  };
  const header = [
    '<b>Заявка с syntha.pro</b>',
    '',
    `<b>Тема:</b> ${capHtml(topic, 140)}`,
    `<b>Имя:</b> ${capHtml(name, 280)}`,
    line(email, `<b>Email:</b> ${capHtml(email, 200)}`),
    line(telegram, `<b>Telegram:</b> ${capHtml(telegram, 200)}`),
    line(phone, `<b>Телефон:</b> ${capHtml(phone, 200)}`),
    line(isEntity, `<b>Юрлицо:</b> ${capHtml([entity.name, entity.inn && `ИНН ${entity.inn}`].filter(Boolean).join(', ') || '—', 240)}`),
    line(entity.address, `<b>Адрес:</b> ${capHtml(entity.address, 240)}`),
    line(entity.site, `<b>Сайт:</b> ${capHtml(entity.site, 240)}`),
    `<b>Язык:</b> ${capHtml(clean(body.lang, 4), 8) || '—'}`,
    line(leadContext.route, `<b>Маршрут:</b> ${capHtml(leadContext.route, 60)}`),
    line(leadContext.project, `<b>Проект:</b> ${capHtml(leadContext.project, 80)}`),
    line(leadContext.timing, `<b>Срок:</b> ${capHtml(leadContext.timing, 120)}`),
    line(leadContext.goal, `<b>Цель:</b> ${capHtml(leadContext.goal, 200)}`)
  ].filter(l => l !== null).join('\n');
  /* Telegram limits formatted text to 4096; bound encoded payloads to 3800.
     Split only between complete Unicode code points, never inside an HTML entity. */
  const chunks = [];
  let part = '';
  for (const char of message) {
    const encoded = esc(char);
    if (part.length + encoded.length > 3000 && part) {
      chunks.push(part); part = '';
    }
    part += encoded;
  }
  if (part) chunks.push(part);
  const whole = header + '\n\n' + esc(message);
  const messages = whole.length <= 3800 ? [whole] : [header, ...chunks.map((p, i) => `<b>Сообщение ${i + 1}/${chunks.length}:</b>\n${p}`)];
  /* Even if the configured ID is a group/channel, never expose contact details to it. */
  let recipient;
  try {
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getChat`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID })
    });
    if (!response.ok) return new Response('private recipient unavailable', { status: 503 });
    recipient = await response.json();
  } catch { return new Response('private recipient unavailable', { status: 503 }); }
  if (!recipient?.ok || recipient.result?.type !== 'private') {
    console.error('telegram recipient must be a private chat');
    return new Response('private recipient required', { status: 503 });
  }

  const api = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/`;
  const deliver = async (method, init) => {
    try {
      const res = await fetch(api + method, init);
      if (!res.ok) {
        console.error('telegram delivery failed', method, res.status);
        return false;
      }
      const outcome = await res.json();
      if (outcome?.ok !== true) {
        console.error('telegram delivery rejected', method);
        return false;
      }
      return true;
    } catch {
      console.error('telegram network delivery failure', method);
      return false;
    }
  };
  let delivered = true;
  if (file) {
    const fd = new FormData();
    fd.append('chat_id', env.TELEGRAM_CHAT_ID);
    fd.append('caption', Array.from(`Заявка с syntha.pro · ${topic}`).slice(0, 240).join(''));
    fd.append('document', file, file.name || 'file');
    delivered = await deliver('sendDocument', { method: 'POST', body: fd });
  }
  for (const text of messages) {
    if (!delivered) break;
    delivered = await deliver('sendMessage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true })
    });
  }
  if (!delivered) {
    await save(env, request, body, { name, email, telegram, phone, entity, topic, message, file, leadContext, ok: 0 });
    return new Response('telegram failed or partially delivered', { status: 502 });
  }
  await save(env, request, body, { name, email, telegram, phone, entity, topic, message, file, leadContext, ok: 1 });
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
      d.topic, JSON.stringify({ file: d.file?.name ?? null, lead: d.leadContext || null }), cf.country ?? '', cf.city ?? '').run();
  } catch (err) {
    console.error('stats save failed', String(err));
  }
}
