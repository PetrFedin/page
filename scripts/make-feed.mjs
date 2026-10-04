#!/usr/bin/env node
/* Ленты публикаций для подписки и агрегаторов: RSS и JSON Feed из assets/news.js.
 * feed.xml / feed.json — русская лента, en/feed.xml / en/feed.json — английская (только посты с переводом). */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://syntha.pro';
const { NEWS } = await import(pathToFileURL(join(root, 'assets/news.js')).href);
const today = new Date().toISOString().slice(0, 10);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LABEL = /^(О чём материал|Разбор|Мнение аналитика|Выводы|Что изменилось|Что это даёт|What the piece covers|The breakdown|Analyst’s take|Takeaways|What changed|What it gives you):\s*/;

for (const lang of ['ru', 'en']) {
  const base = lang === 'en' ? `${SITE}/en/` : `${SITE}/`;
  const posts = NEWS.filter((p) => p.site !== false && p.date <= today && p[lang]).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
  const items = posts.map((p) => {
    const t = p[lang];
    const body = t.body.split('\n\n').filter((x) => !/^https?:\/\//.test(x.trim()))
      .map((x) => x.replace(LABEL, '').replace(/\n•\s+/g, ' · ').trim());
    return { id: `${base}#post-${p.date}`, title: t.title, summary: body[0] ?? '', content: body.join('\n\n'), date: p.date, tags: t.tags ?? [] };
  });
  const title = lang === 'en' ? 'Petr Fedin — feed' : 'Пётр Федин — лента';
  const descr = lang === 'en' ? 'Fashion-industry analysis and news from my products.' : 'Разборы фэшн-индустрии и новости моих продуктов.';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(title)}</title>
<link>${base}</link>
<description>${esc(descr)}</description>
<language>${lang}</language>
<atom:link href="${base}feed.xml" rel="self" type="application/rss+xml"/>
${items.map((i) => `<item>
<title>${esc(i.title)}</title>
<link>${i.id}</link>
<guid isPermaLink="true">${i.id}</guid>
<pubDate>${new Date(i.date + 'T09:00:00Z').toUTCString()}</pubDate>
<description>${esc(i.summary)}</description>
${i.tags.map((t) => `<category>${esc(t)}</category>`).join('')}
</item>`).join('\n')}
</channel>
</rss>
`;
  const json = {
    version: 'https://jsonfeed.org/version/1.1', title, home_page_url: base, feed_url: `${base}feed.json`, description: descr, language: lang,
    authors: [{ name: lang === 'en' ? 'Petr Fedin' : 'Пётр Федин', url: base }],
    items: items.map((i) => ({ id: i.id, url: i.id, title: i.title, summary: i.summary, content_text: i.content, date_published: `${i.date}T09:00:00Z`, tags: i.tags }))
  };
  const dir = lang === 'en' ? join(root, 'en') : root;
  writeFileSync(join(dir, 'feed.xml'), xml);
  writeFileSync(join(dir, 'feed.json'), JSON.stringify(json, null, 2));
  console.log(`${lang === 'en' ? 'en/' : ''}feed.xml и feed.json: ${items.length} записей`);
}
