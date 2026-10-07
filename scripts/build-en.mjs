#!/usr/bin/env node
/* Собирает en/index.html из index.html.
 *
 * Английская страница отличается только языком, заголовками и canonical —
 * содержимое одинаковое и наполняется скриптом. Руками их уже разносило:
 * в разметку главной добавлялся элемент, английская про него не знала,
 * и сценарий падал на обращении к отсутствующему узлу. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ЗАМЕНЫ = [
  ['<html lang="ru" data-preview="v2">', '<html lang="en" data-preview="v2">'],
  ['/assets/photo/petr-portrait.webp', '/assets/photo/petr-ny.webp'],
  ['<title>Пётр Федин — фэшн-консалтинг и проекты</title>',
   '<title>Petr Fedin — fashion advisory and projects</title>'],
  ['content="Консультирую фэшн-бренды и разрабатываю собственные IT-продукты: Syntha, ChatX, Renova, MFW+BFS+Made in Moscow, Promomed, Moscow и Antiqua."',
   'content="I advise fashion brands and build my own IT products: Syntha, ChatX, Renova, MFW+BFS+Made in Moscow, Promomed, Moscow and Antiqua."'],
  ['<meta property="og:url" content="https://syntha.pro/">',
   '<meta property="og:url" content="https://syntha.pro/en/">'],
  ['content="Пётр Федин — фэшн-консалтинг и проекты"',
   'content="Petr Fedin — fashion advisory and projects"'],
  ['<meta property="og:locale" content="ru_RU">', '<meta property="og:locale" content="en_GB">'],
  ['alt="Пётр Федин"', 'alt="Petr Fedin"'],
  ['<link rel="alternate" type="application/rss+xml" title="Пётр Федин — лента" href="/feed.xml">', '<link rel="alternate" type="application/rss+xml" title="Petr Fedin — feed" href="/en/feed.xml">'],
  ['<link rel="alternate" type="application/feed+json" title="Пётр Федин — лента" href="/feed.json">', '<link rel="alternate" type="application/feed+json" title="Petr Fedin — feed" href="/en/feed.json">'],
  ['{"prefetch":[{"urls":["/syntha","/chatx","/renova","/mfw","/promomed"]', '{"prefetch":[{"urls":["/en/syntha","/en/chatx","/en/renova","/en/mfw","/en/promomed"]'],
  ['<meta property="og:site_name" content="Пётр Федин">', '<meta property="og:site_name" content="Petr Fedin">'],
  ['>К содержанию</a>', '>Skip to content</a>'],
  ['>Подробно о проекте</a>', '>Project page</a>'],
  ['alt="QR-код"', 'alt="QR code"'],
  ['<link rel="canonical" href="https://syntha.pro/">',
   '<link rel="canonical" href="https://syntha.pro/en/">'],
];

let html = readFileSync(join(root, 'index.html'), 'utf8');
for (const [из, в] of ЗАМЕНЫ) {
  if (!html.includes(из)) {
    console.error(`не найдено в index.html: ${из.slice(0, 60)}`);
    process.exit(1);
  }
  html = html.replaceAll(из, в);
}
/* разметка schema.org для английской страницы */
const LD = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Person', '@id': 'https://syntha.pro/#person', name: 'Petr Fedin', alternateName: 'Пётр Федин', url: 'https://syntha.pro/en/', jobTitle: 'Fashion-business consultant and founder of IT products', image: 'https://syntha.pro/assets/photo/petr-ny.webp', sameAs: ['https://t.me/sheqel', 'https://t.me/syntha_pro'], knowsAbout: ['Buying and assortment', 'Product and production in fashion', 'Markets and finance for fashion businesses', 'Fashion retail', 'IT products for the fashion industry'] },
    { '@type': 'WebSite', '@id': 'https://syntha.pro/#site', url: 'https://syntha.pro/en/', name: 'Petr Fedin', inLanguage: ['en', 'ru'], publisher: { '@id': 'https://syntha.pro/#person' } },
    { '@type': 'ProfessionalService', name: 'Petr Fedin — fashion advisory', url: 'https://syntha.pro/en/', provider: { '@id': 'https://syntha.pro/#person' }, serviceType: 'Advisory for fashion businesses' }
  ]
};
html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, () => `<script type="application/ld+json">${JSON.stringify(LD)}</script>`);
writeFileSync(join(root, 'en', 'index.html'), html);
console.log('en/index.html пересобран');
