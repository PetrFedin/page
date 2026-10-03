/* Собирает sitemap.xml: страницы, дата последнего изменения из git, пары RU/EN для главной.
   Запуск: node scripts/make-sitemap.mjs */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://syntha.pro';
const pages = [
  { url: '/', file: 'index.html', pair: true },
  { url: '/en/', file: 'en/index.html', pair: true },
  ...['syntha', 'chatx', 'renova', 'mfw', 'promomed'].flatMap((id) => [
    { url: `/${id}`, file: `${id}.html`, ru: `/${id}`, en: `/en/${id}` },
    { url: `/en/${id}`, file: `en/${id}.html`, ru: `/${id}`, en: `/en/${id}` }
  ])
];

const lastmod = (file) => {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: root, encoding: 'utf8' }).trim();
  } catch { return ''; }
};

const altFor = (ru, en) => `    <xhtml:link rel="alternate" hreflang="ru" href="${SITE}${ru}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${ru}"/>
`;
const alt = `    <xhtml:link rel="alternate" hreflang="ru" href="${SITE}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>
`;
const body = pages.map((p) => {
  const d = lastmod(p.file);
  return `  <url>\n    <loc>${SITE}${p.url}</loc>\n${d ? `    <lastmod>${d}</lastmod>\n` : ''}${p.pair ? alt : p.ru ? altFor(p.ru, p.en) : ''}  </url>`;
}).join('\n');

writeFileSync(join(root, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`);
console.log('sitemap.xml обновлён:', pages.length, 'страниц');
