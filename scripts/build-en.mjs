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
  ['<html lang="ru">', '<html lang="en">'],
  ['/assets/photo/petr-portrait.webp', '/assets/photo/petr-ny.webp'],
  ['<title>Пётр Федин — фэшн-консалтинг и проекты</title>',
   '<title>Petr Fedin — fashion advisory and projects</title>'],
  ['content="Консультирую фэшн-бренды и разрабатываю собственные IT-продукты: Syntha, ChatX, Renova, MFW+BFS, Promomed."',
   'content="I advise fashion brands and build my own IT products: Syntha, ChatX, Renova, MFW+BFS, Promomed."'],
  ['<meta property="og:url" content="https://syntha.pro/">',
   '<meta property="og:url" content="https://syntha.pro/en/">'],
  ['content="Пётр Федин — фэшн-консалтинг и проекты"',
   'content="Petr Fedin — fashion advisory and projects"'],
  ['<meta property="og:locale" content="ru_RU">', '<meta property="og:locale" content="en_US">'],
  ['alt="Пётр Федин"', 'alt="Petr Fedin"'],
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
writeFileSync(join(root, 'en', 'index.html'), html);
console.log('en/index.html пересобран');
