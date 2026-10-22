import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=process.cwd();
const mustExist=['index.html','pc.html','manifest.webmanifest','sw.js','assets/styles.css','assets/games.js','assets/app.js','assets/pc.css','assets/pc-downloads.css','assets/pc-storage.js','assets/software-apps.js','assets/pc-downloads.js','assets/pc-apps.js','assets/pc-browser.js','assets/pc-explorer.js','assets/pc.js','assets/pwa.js','assets/app-icon.svg'];
for(const f of mustExist) assert.ok(fs.existsSync(path.join(root,f)),'Missing project file: '+f);
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
for(const f of mustExist.filter(f=>f.endsWith('.js'))) assert.doesNotThrow(()=>new Function(read(f)),'Invalid JavaScript: '+f);
const manifest=JSON.parse(read('manifest.webmanifest'));
assert.equal(manifest.name,'M-Y-O Game Hub — PC Workspace');
assert.ok(read('index.html').includes('Tạo PC'));
const pc=read('pc.html');
for(const src of ['assets/games.js','assets/pc-storage.js','assets/pc-downloads.css','assets/software-apps.js','assets/pc-downloads.js','assets/pc-apps.js','assets/pc-browser.js','assets/pc-explorer.js','assets/pc.js','assets/pwa.js']) assert.ok(pc.includes(src),'PC page must load '+src);
assert.ok(!pc.includes('Tên game muốn chơi'),'Creating a PC must not ask for a game name');
assert.ok(pc.includes('Google Chrome'),'Desktop should include Chrome launcher');
assert.ok(pc.includes('assets/pc-downloads.js'),'Desktop should load PC Downloads manager');
assert.ok(pc.includes('data-open-app="software"'),'Desktop should include software catalogue shortcut');
assert.ok(fs.existsSync(path.join(root,'downloads/software-catalog.json')),'Missing GitHub software catalogue');
assert.ok(fs.existsSync(path.join(root,'downloads/games-catalog.json')),'Missing GitHub game catalogue');
const appCatalog=JSON.parse(read('downloads/software-catalog.json'));
const gameCatalog=JSON.parse(read('downloads/games-catalog.json'));
for(const app of appCatalog.apps) assert.ok(fs.existsSync(path.join(root,'downloads/apps',app.id+'.url')),'Missing app shortcut: '+app.id);
for(const game of gameCatalog.games) assert.ok(fs.existsSync(path.join(root,'downloads/games',game.id+'.url')),'Missing game shortcut: '+game.id);
const context={window:{}};vm.runInNewContext(read('assets/games.js'),context);
const games=context.window.MYO_GAMES;
assert.ok(Array.isArray(games)&&games.length>=10,'Expected at least 10 starter PC game records');
const softwareContext={window:{}};vm.runInNewContext(read('assets/software-apps.js'),softwareContext);
const software=softwareContext.window.MYO_SOFTWARE;
assert.ok(Array.isArray(software)&&software.length>=15,'Expected at least 15 official software links');
for(const app of software){assert.ok(/^https:\/\//.test(app.source),'Software URL must be HTTPS: '+app.name);assert.ok(app.name&&app.publisher,'Incomplete software record: '+app.id)}
for(const game of games){assert.ok(/^https:\/\//.test(game.source),'Game source must be HTTPS: '+game.name);assert.ok(game.name&&game.publisher&&game.genre,'Incomplete game entry: '+game.name)}
const coreMatch=read('sw.js').match(/const CORE=\[([\s\S]*?)\];/);
assert.ok(coreMatch,'Service worker CORE cache list not found');
for(const match of coreMatch[1].matchAll(/'([^']+)'/g)){const item=match[1];const mapped=item==='/'?'index.html':item.replace(/^\/+/, '');assert.ok(fs.existsSync(path.join(root,mapped)),'Service worker cache entry missing: '+mapped)}

console.log('M-Y-O smoke checks passed.');
console.log('Validated pages, local assets, JavaScript syntax, manifest and '+games.length+' HTTPS game sources.');
