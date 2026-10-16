#!/usr/bin/env node
/**
 * Assemble an allowlisted Cloudflare Pages static directory. Run from repo root:
 *   npm run build && node scripts/prepare-pages-release.mjs
 *
 * The Pages Functions live at /functions beside (NOT inside) dist-pages.
 * Wrangler CLI must be launched from this repo root to bundle them.
 */
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dist=join(root,'dist-pages');
const staticFiles=[
 'index.html','privacy.html','analytics.html','economics.html','syntha.html','renova.html','chatx.html',
 'promomed.html','mfw.html','marco-pescarolo.html','favicon.ico',
 'robots.txt','sitemap.xml','feed.xml','feed.json','llms.txt',
 '_headers','_routes.json',
 'effa60696db2628d61a43e4d89f0186c.txt'
];
const staticDirs=['assets','en'];
const mustHave=[
 'index.html','en/index.html','assets/app.js','assets/styles.css',
 'assets/lead-paths.js','assets/portfolio-extensions.js',
 'assets/investor-calculator.js','assets/opportunity-copy.js',
 'assets/opportunity-economics.js','assets/opportunity-studio.js','assets/economics-page.js',
 'analytics.html','economics.html','en/analytics.html','en/economics.html',
 'en/feed.xml','_headers','_routes.json'
];
for(const file of [...staticFiles,...staticDirs,...mustHave]){
 const src=join(root,file);
 assert.ok(existsSync(src),'release input missing: '+file);
 assert.ok(!lstatSync(src).isSymbolicLink(),'unsafe symlink: '+file);
}
assert.ok(existsSync(join(root,'functions/api/contact.js')),
  'Pages Functions must exist adjacent to the static output');

rmSync(dist,{recursive:true,force:true});
mkdirSync(dist,{recursive:true});
for(const file of staticFiles){
 mkdirSync(dirname(join(dist,file)),{recursive:true});
 cpSync(join(root,file),join(dist,file));
}
for(const dir of staticDirs){
 cpSync(join(root,dir),join(dist,dir),{recursive:true,errorOnExist:true,force:false});
}
/* Public release fingerprint: ties the served HTML to the exact source commit.
   No credentials or private release identifiers are emitted. */
const sourceSha=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
assert.match(sourceSha,/^[a-f0-9]{40}$/,'valid Git source SHA');
for(const entry of ['index.html','en/index.html']){
  const file=join(dist,entry),html=readFileSync(file,'utf8');
  assert.ok(!html.includes('name="syntha-build-commit"'),'duplicate release marker');
  assert.ok(html.includes('</head>'),'HTML head present for release marker');
  writeFileSync(file,html.replace('</head>',`<meta name="syntha-build-commit" content="${sourceSha}">\n</head>`));
}
const paths=[];
function list(p){
 for(const item of readdirSync(join(dist,p),{withFileTypes:true})){
  const rel=join(p,item.name);
  assert.ok(!item.isSymbolicLink(),'unsafe output symlink: '+rel);
  if(item.isDirectory())list(rel);
  else {
   assert.ok(item.isFile(),'unsupported output type: '+rel);
   assert.ok(!/(\.env$|\.pem$|\.key$|\/\.|\.secret$)/i.test(rel),'sensitive output: '+rel);
   paths.push(rel);
  }
 }
}
list('');
for(const path of mustHave)assert.ok(paths.includes(path),path);
for(const forbidden of ['functions/','scripts/','docs/','private/','.github/','.claude/','node_modules/']){
 assert.ok(!paths.some(p=>p.startsWith(forbidden)),'forbidden public directory: '+forbidden);
}
assert.ok(!paths.includes('channel-queue.json'),'publication queue must remain private');
assert.ok(!paths.includes('package.json'),'build metadata must not be publicly hosted');
/* Public read-only source marker; does not claim the Cloudflare Function is
   deployed or that production contact/Telegram acceptance has passed. */
const health = {
  source_sha: sourceSha,
  bundle: 'public-static-only',
  functions_bundled: false,
  languages: ['ru','en'],
  asset_count: paths.length + 1
};
writeFileSync(join(dist,'release-health.json'),JSON.stringify(health,null,2)+'\n');
paths.push('release-health.json');
mkdirSync(join(root,'qa-artifacts'),{recursive:true});
writeFileSync(join(root,'qa-artifacts','pages-release-manifest.json'),
 JSON.stringify({sourceSha,files:paths.length,includesFunctions:false,assets:paths},null,2)+'\n');
console.log('PASS: Cloudflare Pages public-only bundle ('+paths.length+' files) for '+sourceSha+', private sources excluded');
console.log('IMPORTANT: Deploy with Wrangler from repository root to bundle /functions separately.');
