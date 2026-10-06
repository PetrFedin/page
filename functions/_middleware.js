/* Учёт заходов поисковых и ИИ-роботов на публичные страницы: видно, кто и когда читал сайт.
   Людей здесь не считаем (их считает track.js), страницы не меняем. */
import { ensureSchema } from './api/_lib.js';
import { languageRedirect } from './_language.js';

const BOTS = [
  [/googlebot|google-inspectiontool|adsbot-google|apis-google/i, 'Googlebot', 'search'],
  [/bingbot|bingpreview|msnbot/i, 'Bingbot', 'search'],
  [/yandex(bot|images|mobilebot|accessibilitybot|direct)|yandex\.com\/bots/i, 'YandexBot', 'search'],
  [/duckduckbot/i, 'DuckDuckBot', 'search'],
  [/baiduspider/i, 'Baiduspider', 'search'],
  [/applebot/i, 'Applebot', 'search'],
  [/oai-searchbot/i, 'OAI-SearchBot (ChatGPT)', 'ai'],
  [/gptbot/i, 'GPTBot (OpenAI)', 'ai'],
  [/chatgpt-user/i, 'ChatGPT-User', 'ai'],
  [/claude-searchbot|claude-user|claudebot|anthropic-ai/i, 'Claude (Anthropic)', 'ai'],
  [/perplexity/i, 'Perplexity', 'ai'],
  [/google-extended|gemini/i, 'Google AI', 'ai'],
  [/bytespider|ccbot|amazonbot|meta-externalagent|cohere|mistral/i, 'Другие ИИ-роботы', 'ai'],
  [/telegrambot/i, 'Telegram (превью)', 'social'],
  [/whatsapp/i, 'WhatsApp (превью)', 'social'],
  [/facebookexternalhit|linkedinbot|twitterbot|slackbot|discordbot/i, 'Соцсети (превью)', 'social']
];

export async function onRequest(context) {
  const { request, env, next } = context;
  const redirect = languageRedirect(request);
  if (redirect) return redirect;
  const res = await next();
  try {
    const path = new URL(request.url).pathname;
    if (request.method !== 'GET' || path.startsWith('/api/') || path.startsWith('/stats') || !env.DB) return res;
    const ua = request.headers.get('user-agent') || '';
    const hit = BOTS.find(([re]) => re.test(ua));
    if (!hit) return res;
    context.waitUntil((async () => {
      if (!(await ensureSchema(env))) return;
      await env.DB.prepare('INSERT INTO crawls (ts, bot, kind, path, status) VALUES (?,?,?,?,?)').bind(Date.now(), hit[1], hit[2], path.slice(0, 120), res.status).run();
    })());
  } catch { /* учёт не должен ломать страницы */ }
  return res;
}
