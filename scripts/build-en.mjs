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
  ['<title>Пётр Федин — фэшн-консалтинг и проекты</title>',
   '<title>Petr Fedin — fashion advisory and ventures</title>'],
  ['content="Стратегия, экономика и трансформация фэшн-бизнеса. Проекты Syntha, Renova и ChatX."',
   'content="Strategy, economics and transformation for fashion businesses. Ventures: Syntha, ChatX and Renova."'],
  ['content="Пётр Федин — фэшн-консалтинг и проекты"',
   'content="Petr Fedin — fashion advisory and ventures"'],
  ['<meta property="og:locale" content="ru_RU">', '<meta property="og:locale" content="en_US">'],
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
