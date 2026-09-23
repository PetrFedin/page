#!/usr/bin/env node
/**
 * Публикация следующего поста из очереди. Запускается таймером, без человека,
 * поэтому единственное, что он делает сам, — берёт УЖЕ УТВЕРЖДЁННЫЙ текст и отправляет.
 * Ничего не сочиняет и не меняет порядок.
 *
 *   node scripts/tg-queue.mjs            опубликовать следующий
 *   node scripts/tg-queue.mjs --status   показать очередь и что уже вышло
 *   node scripts/tg-queue.mjs --dry-run  показать следующий, не отправляя
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const CONFIG_DIR = join(homedir(), '.config', 'syntha-pro');
const ENV_PATH = join(CONFIG_DIR, 'telegram.env');
const STATE_PATH = join(CONFIG_DIR, 'published.json');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const stamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
const say = (...m) => console.log(`[${stamp()}]`, ...m);

async function loadEnv() {
  const raw = await readFile(ENV_PATH, 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return env;
}

async function loadState() {
  try {
    return JSON.parse(await readFile(STATE_PATH, 'utf8'));
  } catch {
    return { published: [] };
  }
}

const esc = (s) => s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

const env = await loadEnv();
const state = await loadState();
const queue = JSON.parse(await readFile(join(ROOT, 'channel-queue.json'), 'utf8'));
const { NEWS } = await import(pathToFileURL(join(ROOT, 'assets', 'news.js')).href);

const byDate = new Map(NEWS.map((p) => [p.date, p]));
const pending = queue.order.filter((d) => !state.published.includes(d));

if (has('--status')) {
  console.log(`Окно публикации: ${queue.windowStart}:00–${queue.windowEnd}:00`);
  for (const d of queue.order) {
    const p = byDate.get(d);
    const mark = state.published.includes(d) ? '✓ вышел ' : '· в очереди';
    console.log(`${mark}  ${d}  ${p ? (p.tg?.ru ?? p.ru).title : 'ПОСТ НЕ НАЙДЕН'}`);
  }
  console.log(`\nОсталось в очереди: ${pending.length}`);
  process.exit(0);
}

if (!pending.length) {
  say('Очередь пуста — публиковать нечего.');
  process.exit(0);
}

const hour = new Date().getHours();
if (!has('--dry-run') && (hour < queue.windowStart || hour >= queue.windowEnd)) {
  say(`Вне окна публикации (${hour}:00, окно ${queue.windowStart}:00–${queue.windowEnd}:00) — пропускаю.`);
  process.exit(0);
}

const date = pending[0];
const post = byDate.get(date);
if (!post) {
  say(`В очереди стоит ${date}, но такого поста нет в assets/news.js — остановка.`);
  process.exit(1);
}

const c = post.tg?.ru ?? post.ru;
/* Теги отдельной строкой: по ним пост потом находится в канале. */
const tags = post.tags?.length ? `\n\n${post.tags.map((t) => `#${esc(t)}`).join(' ')}` : '';
const text = `<b>${esc(c.title)}</b>\n\n${esc(c.body)}${tags}`;

if (has('--dry-run')) {
  console.log(`--- следующий в очереди: ${date} ---\n`);
  console.log(text);
  console.log('\n--- ничего не отправлено ---');
  process.exit(0);
}

/* Сеть до Telegram бывает недоступна. Пост не помечается опубликованным,
   пока Telegram не подтвердил приём, поэтому неудача просто откладывает его
   до следующего срабатывания таймера — потерять пост нельзя. */
async function send(attempt = 1) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHANNEL,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
      signal: AbortSignal.timeout(20000)
    });
    return await res.json();
  } catch (e) {
    if (attempt >= 3) return { ok: false, description: `сеть недоступна: ${e.cause?.code ?? e.name}` };
    say(`Попытка ${attempt} не прошла, повтор через 15 с…`);
    await new Promise((r) => setTimeout(r, 15000));
    return send(attempt + 1);
  }
}

const data = await send();
if (!data.ok) {
  say(`Не отправилось (${date}): ${data.description ?? 'ошибка'}. Пост остаётся в очереди.`);
  process.exit(1);
}

state.published.push(date);
await mkdir(CONFIG_DIR, { recursive: true });
await writeFile(STATE_PATH, JSON.stringify(state, null, 2));
say(`Опубликовано ${date}: https://t.me/${env.TELEGRAM_CHANNEL.replace('@', '')}/${data.result.message_id}`);
say(`Осталось в очереди: ${pending.length - 1}`);
