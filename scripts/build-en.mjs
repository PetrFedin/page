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
  ['content="Фэшн-консалтинг, экономика закупок и цифровые платформы: Syntha, ChatX, Renova, Antiqua, IGRA, Marco Pescarolo и другие проекты. Пилоты, партнёрство, инвестиции."',
   'content="Fashion advisory, buying economics and digital platforms: Syntha, ChatX, Renova, Antiqua, IGRA, Marco Pescarolo and more. Pilots, partnerships and investment."'],
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
/* Preserve English static fallback for the commercial paths. */
const routeStart='<!--LEAD_ROUTES_START-->',routeEnd='<!--LEAD_ROUTES_END-->';
const ruStart=html.indexOf(routeStart),ruEnd=html.indexOf(routeEnd,ruStart);
if(ruStart<0||ruEnd<0){console.error('Commercial paths missing from source HTML');process.exit(1);}
const enRoutes="<!--LEAD_ROUTES_START-->\n  <section class=\"section lead-routes\" id=\"work-with-me\" aria-labelledby=\"lead-paths-title\">\n    <div class=\"section-head\"><p class=\"eyebrow\" id=\"lead-paths-eyebrow\">Choose how to work together</p><h2 id=\"lead-paths-title\">From a question to a concrete next step</h2><p class=\"sub\" id=\"lead-paths-sub\">Clear journeys for prospective clients, partners and investors.</p></div>\n    <div class=\"lead-routes-grid\" id=\"lead-routes-grid\">\n      <article class=\"lead-route-card\" data-route-card=\"client\"><span class=\"svc-n\">01</span><h3>For clients</h3><p>Buying economics, commercial strategy, operational processes and transformation.</p><button class=\"btn btn-sm\" type=\"button\" data-lead-start=\"client\">Discuss your challenge</button></article>\n      <article class=\"lead-route-card\" data-route-card=\"pilot\"><span class=\"svc-n\">02</span><h3>For partners</h3><p>Explore a pilot, technical integration or co-development on a real workflow.</p><button class=\"btn btn-sm\" type=\"button\" data-lead-start=\"pilot\">Propose a pilot</button></article>\n      <article class=\"lead-route-card\" data-route-card=\"investor\"><span class=\"svc-n\">03</span><h3>For investors</h3><p>Review product maturity, risks and hypothetical economics before a focused conversation.</p><button class=\"btn btn-sm\" type=\"button\" data-lead-start=\"investor\">Discuss participation</button></article>\n    </div>\n  </section>\n<!--LEAD_ROUTES_END-->";
html=html.slice(0,ruStart)+enRoutes+html.slice(ruEnd+routeEnd.length);
html=html.replaceAll('Когда планируете начать? (необязательно)','When would you like to start? (optional)')
  .replaceAll('Срок пока не определён','Timing undecided')
  .replaceAll('В течение месяца','Within a month')
  .replaceAll('В течение 1–3 месяцев','In 1–3 months')
  .replaceAll('В течение 3–6 месяцев','In 3–6 months')
  .replaceAll('Позднее</option>','Later</option>')
  .replaceAll('>Предложить пилот</button>','>Propose a pilot</button>')
  .replaceAll('>Инвестору</button>','>Investor enquiry</button>');
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
