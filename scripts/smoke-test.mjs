import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=process.cwd();
const mustExist=['index.html','pc.html','manifest.webmanifest','sw.js','assets/styles.css','assets/games.js','assets/app.js','assets/pc.css','assets/pc-storage.js','assets/pc-apps.js','assets/pc-browser.js','assets/pc-explorer.js','assets/pc.js','assets/pwa.js','assets/app-icon.svg'];
for(const f of mustExist) assert.ok(fs.existsSync(path.join(root,f)),'Missing project file: '+f);
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
for(const f of mustExist.filter(f=>f.endsWith('.js'))) assert.doesNotThrow(()=>new Function(read(f)),'Invalid JavaScript: '+f);
const manifest=JSON.parse(read('manifest.webmanifest'));
assert.equal(manifest.name,'M-Y-O Game Hub — PC Workspace');
assert.ok(read('index.html').includes('Tạo PC'));
const pc=read('pc.html');
for(const src of ['assets/games.js','assets/pc-storage.js','assets/pc-apps.js','assets/pc-browser.js','assets/pc-explorer.js','assets/pc.js','assets/pwa.js']) assert.ok(pc.includes(src),'PC page must load '+src);
assert.ok(!pc.includes('Tên game muốn chơi'),'Creating a PC must not ask for a game name');
assert.ok(pc.includes('Google Chrome'),'Desktop should include Chrome launcher');
const context={window:{}};vm.runInNewContext(read('assets/games.js'),context);
const games=context.window.MYO_GAMES;
assert.ok(Array.isArray(games)&&games.length>=10,'Expected at least 10 starter PC game records');
for(const game of games){assert.ok(/^https:\/\//.test(game.source),'Game source must be HTTPS: '+game.name);assert.ok(game.name&&game.publisher&&game.genre,'Incomplete game entry: '+game.name)}
for(const line of read('sw.js').matchAll(/'\/(.*?)'/g)){const item=line[1];if(item==='')continue;const mapped=item==='/'?'index.html':item;assert.ok(fs.existsSync(path.join(root,mapped)),'Service worker cache entry missing: '+mapped)}
console.log('M-Y-O smoke checks passed.');
console.log('Validated pages, local assets, JavaScript syntax, manifest and '+games.length+' HTTPS game sources.');
