#!/usr/bin/env node
/* Поисковая разметка страниц проектов (русская и английская копии).
 * Между метками <!--SEO:START--> и <!--SEO:END--> в <head> каждой страницы пишутся:
 *   - ссылки hreflang на двойника на другом языке,
 *   - картинка для превью ссылки (своя у каждого проекта и языка),
 *   - разметка schema.org (SoftwareApplication + хлебные крошки).
 * Заголовок и описание берутся из самой страницы, поэтому после правки текста
 * достаточно запустить:  node scripts/seo-pages.mjs */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://syntha.pro';
const PROJECTS = [
  ['syntha', 'Syntha', 'BusinessApplication'],
  ['chatx', 'ChatX', 'CommunicationApplication'],
  ['renova', 'Renova', 'BusinessApplication'],
  ['mfw', 'MFW+BFS', 'BusinessApplication'],
  ['promomed', 'Promomed + «СОСТОЯНИЕ»', 'BusinessApplication']
];
const attr = (html, re) => (html.match(re) || [])[1] || '';
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

for (const [id, name, category] of PROJECTS) {
  for (const lang of ['ru', 'en']) {
    const file = lang === 'ru' ? `${id}.html` : `en/${id}.html`;
    const path = join(root, file);
    if (!existsSync(path)) { console.warn(`нет ${file}`); continue; }
    let html = readFileSync(path, 'utf8');
    const url = lang === 'ru' ? `${SITE}/${id}` : `${SITE}/en/${id}`;
    const title = decode(attr(html, /<title>([^<]*)<\/title>/));
    const description = decode(attr(html, /<meta name="description" content="([^"]*)"/));
    const image = `${SITE}/assets/og/${id}${lang === 'en' ? '-en' : ''}.jpg`;

    /* старые одиночные теги заменяются блоком */
    html = html
      .replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*">\s*/g, '')
      .replace(/<meta property="og:image" content="[^"]*">\s*/g, '')
      .replace(/<meta name="twitter:image" content="[^"]*">\s*/g, '')
      .replace(/<meta property="og:image:(width|height|alt)" content="[^"]*">\s*/g, '')
      .replace(/<meta name="twitter:card" content="[^"]*">\s*/g, '')
      .replace(/<meta property="og:locale" content="[^"]*">\s*/g, '')
      .replace(/<meta name="twitter:(title|description)" content="[^"]*">\s*/g, '')
      .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '')
      .replace(/<!--SEO:START-->[\s\S]*?<!--SEO:END-->\s*/g, '');

    const ld = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SoftwareApplication', '@id': `${url}#app`, name, url, description, inLanguage: lang,
          applicationCategory: category, operatingSystem: id === 'renova' ? 'iOS' : 'Web',
          image, creator: { '@type': 'Person', '@id': `${SITE}/#person`, name: lang === 'ru' ? 'Пётр Федин' : 'Petr Fedin', url: `${SITE}/` }
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: lang === 'ru' ? 'Пётр Федин' : 'Petr Fedin', item: lang === 'ru' ? `${SITE}/` : `${SITE}/en/` },
            { '@type': 'ListItem', position: 2, name: lang === 'ru' ? 'Проекты' : 'Projects', item: `${lang === 'ru' ? SITE + '/' : SITE + '/en/'}#projects` },
            { '@type': 'ListItem', position: 3, name, item: url }
          ]
        }
      ]
    };
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    const block = `<!--SEO:START-->
<link rel="alternate" hreflang="ru" href="${SITE}/${id}">
<link rel="alternate" hreflang="en" href="${SITE}/en/${id}">
<link rel="alternate" hreflang="x-default" href="${SITE}/${id}">
<meta property="og:locale" content="${lang === 'ru' ? 'ru_RU' : 'en_GB'}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${image}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<!--SEO:END-->
`;
    /* блок кладём перед закрывающим </head> */
    html = html.replace('</head>', `${block}</head>`);

    /* ссылка на двойника в шапке: у русской страницы — EN, у английской уже есть RU */
    if (lang === 'ru' && !html.includes(`href="/en/${id}"`)) {
      html = html.replace('<div class="switches">', `<div class="switches">\n    <a class="lang" href="/en/${id}" hreflang="en" lang="en" aria-label="English version">EN</a>`);
    }
    writeFileSync(path, html);
    console.log(`${file}: разметка обновлена`);
  }
}
