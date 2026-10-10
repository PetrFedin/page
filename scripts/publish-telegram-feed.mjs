import { execFileSync } from 'node:child_process';
import { NEWS } from '../assets/news.js';

const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
const channelId = process.env.TELEGRAM_CHANNEL_ID || '';
const publicUrl = process.env.PUBLIC_FEED_URL || 'https://syntha-v2-preview-petr.netlify.app/?v=2';

if (!botToken || !channelId) {
  console.log('Telegram publisher skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID is not configured.');
  process.exit(0);
}

let previous = '';
try {
  previous = execFileSync('git', ['show', 'HEAD^:assets/news.js'], { encoding: 'utf8' });
} catch {
  previous = '';
}
const oldIds = new Set([...previous.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]));
const fresh = NEWS.filter((post) => post.id && !oldIds.has(post.id));

if (!fresh.length) {
  console.log('No new feed posts to send to Telegram.');
  process.exit(0);
}

const escape = (text) => String(text || '').replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
const excerpt = (body) => String(body || '').split('\n\n')[0].slice(0, 900);

for (const post of fresh.reverse()) {
  const title = post.ru?.title || post.en?.title || post.id;
  const body = excerpt(post.ru?.body || post.en?.body || '');
  const link = `${publicUrl}#post-${encodeURIComponent(post.id)}`;
  const text = `<b>${escape(title)}</b>\n\n${escape(body)}\n\n<a href="${escape(link)}">Читать в ленте syntha.pro</a>`;
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: channelId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: false
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) {
    throw new Error(`Telegram publish failed for ${post.id}: ${response.status} ${JSON.stringify(payload)}`);
  }
  console.log(`Telegram published: ${post.id}`);
}
