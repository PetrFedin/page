#!/usr/bin/env node
/**
 * Публикация постов из assets/news.js в Telegram-канал.
 *
 * Секреты читаются из ~/.config/syntha-pro/telegram.env и никогда не живут в репозитории:
 *   TELEGRAM_BOT_TOKEN=123456:AA...
 *   TELEGRAM_CHANNEL=@syntha_pro
 *   SITE_URL=https://syntha.pro          # необязательно, добавляет ссылку под постом
 *
 * Использование:
 *   node scripts/tg-post.mjs --check                 проверить бота и права в канале
 *   node scripts/tg-post.mjs --list                  показать посты и их номера
 *   node scripts/tg-post.mjs --post 1                показать, что будет отправлено (ничего не шлёт)
 *   node scripts/tg-post.mjs --post 1 --send         отправить
 *   node scripts/tg-post.mjs --post 1 --lang en --send
 *
 * Без --send ничего не публикуется: это защита от случайной отправки.
 */

import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ENV_PATH = join(homedir(), '.config', 'syntha-pro', 'telegram.env');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1]; };

async function loadEnv() {
  let raw;
  try {
    raw = await readFile(ENV_PATH, 'utf8');
  } catch {
    console.error(`Не найден файл с доступами: ${ENV_PATH}\nСоздайте его по инструкции в README (раздел «Ведение канала»).`);
    process.exit(1);
  }
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHANNEL) {
    console.error('В файле должны быть TELEGRAM_BOT_TOKEN и TELEGRAM_CHANNEL.');
    process.exit(1);
  }
  if (/сюда_токен|BotFather/.test(env.TELEGRAM_BOT_TOKEN)) {
    console.error(`В ${ENV_PATH} остался текст-заглушка вместо токена.\nОткройте файл, замените строку TELEGRAM_BOT_TOKEN=... на токен от @BotFather и сохраните.`);
    process.exit(1);
  }
  if (!/^\d{6,12}:[A-Za-z0-9_-]{35}$/.test(env.TELEGRAM_BOT_TOKEN)) {
    console.error(`Токен в ${ENV_PATH} не похож на токен Telegram.\nОжидается вид «1234567890:AA...» — число, двоеточие и 35 символов. Скопируйте его из @BotFather целиком, без кавычек и пробелов.`);
    process.exit(1);
  }
  return env;
}

async function api(env, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {})
  });
  const data = await res.json();
  if (!data.ok) {
    const hint = {
      401: 'токен отозван или скопирован не полностью — возьмите новый через /token у @BotFather',
      404: 'токен не распознан Telegram — проверьте, что скопирован целиком',
      400: 'канал не найден или бот не добавлен в него администратором',
      403: 'бот не добавлен в канал администратором с правом «Публикация сообщений»'
    }[res.status];
    throw new Error(`${method}: ${data.description ?? 'ошибка'}${hint ? `\n  → ${hint}` : ''}`);
  }
  return data.result;
}

const esc = (s) => s.replace(/[<>&]/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[ch]));

/* У поста может быть отдельная версия для канала: в ленте первые строки — это
   превью, и текст для Telegram пишется иначе, чем абзац на странице. */
function format(post, lang, env) {
  const c = post.tg?.[lang] ?? post[lang];
  const parts = [`<b>${esc(c.title)}</b>`, '', esc(c.body)];
  /* Теги идут отдельной строкой: по ним пост ищется в канале. */
  const tags = c.tags ?? post.ru.tags;
  if (tags?.length) parts.push('', tags.map((t) => `#${esc(t)}`).join(' '));
  if (env.SITE_URL) parts.push('', `<a href="${env.SITE_URL}/#news">${esc(env.SITE_URL.replace(/^https?:\/\//, ''))}</a>`);
  return parts.join('\n');
}

const env = await loadEnv();
const { NEWS } = await import(pathToFileURL(join(ROOT, 'assets', 'news.js')).href);

if (has('--check')) {
  const me = await api(env, 'getMe');
  console.log(`Бот: @${me.username} (${me.first_name})`);
  const chat = await api(env, 'getChat', { chat_id: env.TELEGRAM_CHANNEL });
  console.log(`Канал: ${chat.title} (${chat.type})`);

  /* Список администраторов закрыт, пока бот сам не админ, — спрашиваем про него самого. */
  let member;
  try {
    member = await api(env, 'getChatMember', { chat_id: env.TELEGRAM_CHANNEL, user_id: me.id });
  } catch {
    console.log('Статус бота в канале: узнать не удалось.');
  }

  if (member?.status === 'administrator' && member.can_post_messages) {
    console.log('Права на публикацию: есть. Можно публиковать.');
    process.exit(0);
  }

  const reason = member?.status === 'administrator'
    ? 'бот администратор, но без права «Публикация сообщений»'
    : `бот не администратор канала (статус: ${member?.status ?? 'неизвестен'})`;
  console.log(`Права на публикацию: НЕТ — ${reason}.`);
  console.log('Исправить: канал @' + env.TELEGRAM_CHANNEL.replace('@', '')
    + ' → Управление каналом → Администраторы → Добавить администратора → выбрать @'
    + me.username + ' → включить «Публикация сообщений».');
  process.exit(1);
}

if (has('--list') || !has('--post')) {
  NEWS.forEach((p, i) => console.log(
    `${String(i + 1).padStart(2)}  ${p.date}  [${p.tag}]${p.tg ? ' ⟨есть версия для канала⟩' : ''}  ${p.ru.title}`));
  if (!has('--post')) console.log('\nОтправить: node scripts/tg-post.mjs --post <номер> --send');
  process.exit(0);
}

const idx = Number(val('--post')) - 1;
const post = NEWS[idx];
if (!post) {
  console.error(`Нет поста с номером ${val('--post')}. Список: --list`);
  process.exit(1);
}

const lang = val('--lang') ?? 'ru';
const text = format(post, lang, env);

if (!has('--send')) {
  console.log(`--- Будет отправлено в ${env.TELEGRAM_CHANNEL} (${lang}) ---\n`);
  console.log(text);
  console.log('\n--- Ничего не отправлено. Добавьте --send для публикации. ---');
  process.exit(0);
}

const sent = await api(env, 'sendMessage', {
  chat_id: env.TELEGRAM_CHANNEL,
  text,
  parse_mode: 'HTML',
  disable_web_page_preview: true
});
console.log(`Опубликовано: https://t.me/${env.TELEGRAM_CHANNEL.replace('@', '')}/${sent.message_id}`);
