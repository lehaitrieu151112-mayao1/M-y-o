import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const required = [
  'index.html','pc.html','manifest.webmanifest','sw.js','assets/pwa.js','assets/app-icon.svg',
  'cloud-pc/Caddyfile','cloud-pc/Caddyfile.example','cloud-pc/WINDOWS-VPS.md',
  'scripts/bootstrap-windows-pc.sh','.env.example','compose.yaml',
  'server/index.mjs','server/package.json','server/Dockerfile','server/test/api.test.mjs',
  'downloads/software-catalog.json'
];
for (const file of required) assert.ok(fs.existsSync(path.join(root,file)), 'Missing '+file);
const read = file => fs.readFileSync(path.join(root,file),'utf8');

for (const file of ['index.html','pc.html']) {
  const scripts = [...read(file).matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const match of scripts) assert.doesNotThrow(() => new Function(match[1]), 'Invalid inline script in '+file);
}
assert.doesNotThrow(() => new Function(read('assets/pwa.js')));
assert.ok(read('scripts/bootstrap-windows-pc.sh').includes('/dev/kvm'));
assert.ok(read('scripts/bootstrap-windows-pc.sh').includes('ensure_env MYO_VM_RAM 16G'));
assert.ok(read('compose.yaml').includes('16G') && read('compose.yaml').includes('256G'));
assert.ok(read('compose.yaml').includes(':-6}'));
assert.equal(JSON.parse(read('manifest.webmanifest')).name,'M-Y-O Windows VPS');

const index = read('index.html');
assert.ok(index.includes('VPS Windows') && index.includes('KVM') && index.includes('connectForm'));
assert.ok(index.includes('GitHub/Vercel chỉ lưu') && index.includes('16 GB RAM'));
const pc = read('pc.html');
assert.ok(pc.includes('pcEndpoint') && pc.includes('location.assign(url)') && pc.includes('KVM / QEMU'));
assert.ok(pc.includes('WINDOWS VPS') && pc.includes('Trang chủ VPS'));
const compose = read('compose.yaml');
assert.ok(compose.includes('dockurr/windows') && compose.includes('/dev/kvm:/dev/kvm') && compose.includes('myo_windows_storage:/storage'));
assert.ok(!compose.includes('8006:8006'),'Do not publish the console port');
const caddy = read('cloud-pc/Caddyfile');
assert.ok(caddy.includes('basic_auth') && caddy.includes('reverse_proxy windows-vm:8006'));
assert.ok(read('cloud-pc/WINDOWS-VPS.md').includes('host home/Downloads folders'));
assert.ok(read('.gitignore').includes('.env'));

const catalog = JSON.parse(read('downloads/software-catalog.json'));
assert.ok(Array.isArray(catalog.apps) && catalog.apps.length >= 8);
for (const app of catalog.apps) assert.ok(app.source.startsWith('https://') && app.name);
for (const id of ['steam','epic','riot','ea','ubisoft','battlenet','gog']) assert.ok(!catalog.apps.some(app => app.id===id),'Game launcher remains: '+id);

for (const file of [
  'assets/games.js','assets/app.js','assets/styles.css','downloads/games-catalog.json',
  'downloads/games/apex.url','downloads/games/cs2.url','downloads/games/dota2.url',
  'downloads/games/fortnite.url','downloads/games/genshin.url','downloads/games/lol.url',
  'downloads/games/minecraft.url','downloads/games/pubg.url','downloads/games/roblox.url',
  'downloads/games/trackmania.url','downloads/games/valorant.url','downloads/games/warframe.url',
  'downloads/apps/steam.url','downloads/apps/epic.url','scripts/bootstrap-cloud-pc.sh'
]) assert.ok(!fs.existsSync(path.join(root,file)),'Obsolete game/legacy file remains: '+file);

const sw = read('sw.js');
const start = sw.indexOf('const CORE = ');
const open = sw.indexOf('[',start);
const end = sw.indexOf('];',open);
assert.ok(start>=0 && open>start && end>open,'Service worker core cache list missing');
for (const item of JSON.parse(sw.slice(open,end+1))) {
  const file = item==='/' ? 'index.html' : item.startsWith('/') ? item.slice(1) : item;
  assert.ok(fs.existsSync(path.join(root,file)),'Missing cached file '+file);
}
console.log('M-Y-O smoke checks passed: Windows VPS portal, protected KVM guest, persistent storage, and no game hub.');
