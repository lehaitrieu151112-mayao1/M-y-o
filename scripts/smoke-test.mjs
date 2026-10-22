import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=process.cwd();
const required=[
  'index.html','pc.html','manifest.webmanifest','sw.js','assets/pwa.js','assets/app-icon.svg',
  'cloud-pc/Caddyfile','cloud-pc/Caddyfile.example','cloud-pc/WINDOWS-VPS.md',
  'cloud-pc/manager/manager.mjs','cloud-pc/manager/index.html','cloud-pc/manager/Dockerfile',
  'install-vps.sh','scripts/bootstrap-windows-pc.sh','.env.example','compose.yaml'
];
for(const file of required)assert.ok(fs.existsSync(path.join(root,file)),'Missing '+file);
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

for(const file of ['index.html','pc.html','cloud-pc/manager/index.html']){
  const scripts=[...read(file).matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  for(const match of scripts)assert.doesNotThrow(()=>new Function(match[1]),'Invalid inline script in '+file);
}
assert.doesNotThrow(()=>new Function(read('assets/pwa.js')));
assert.ok(read('install-vps.sh').includes('/dev/kvm'));
assert.ok(read('install-vps.sh').includes('install-vps.sh pc.example.com'));
assert.ok(read('install-vps.sh').includes('docker-ce'));
assert.ok(read('scripts/bootstrap-windows-pc.sh').includes('/dev/kvm'));
assert.ok(read('scripts/bootstrap-windows-pc.sh').includes('ensure_env MYO_VM_RAM 16G'));

const manifest=JSON.parse(read('manifest.webmanifest'));
assert.equal(manifest.name,'M-Y-O Windows VPS');
const index=read('index.html');
assert.ok(index.includes('VPS Windows')&&index.includes('KVM')&&index.includes('connectForm'));
assert.ok(index.includes('install-vps.sh')&&index.includes('16 GB RAM'));
assert.ok(index.includes('id="addPcBtn"')&&index.includes('id="pcManagerStatus"'));
assert.ok(index.includes("location.assign(url + '/manage/')"));
assert.ok(!index.includes('myo_pc_configurations_v1'),'Do not store pretend PC cards in localStorage');
const manager=read('cloud-pc/manager/manager.mjs');
assert.ok(manager.includes('/var/run/docker.sock')&&manager.includes('/containers/create'));
assert.ok(manager.includes('myo.managed')&&manager.includes('MYO_MANAGER_TOKEN'));
assert.ok(manager.includes('MYO_DOMAIN')&&manager.includes('myo_windows_'));
const managerUi=read('cloud-pc/manager/index.html');
assert.ok(managerUi.includes("fetch('/api'+p")&&managerUi.includes('Tạo PC thật'));
assert.ok(managerUi.includes("method:'DELETE'")&&managerUi.includes("data-action"));

const pc=read('pc.html');
assert.ok(pc.includes('pcEndpoint')&&pc.includes('location.assign(url)')&&pc.includes('KVM / QEMU'));
assert.ok(pc.includes('install-vps.sh')&&pc.includes('Chưa có host KVM'));

const compose=read('compose.yaml');
assert.ok(compose.includes('dockurr/windows')&&compose.includes('/dev/kvm:/dev/kvm')&&compose.includes('myo_windows_storage:/storage'));
assert.ok(compose.includes('pc-manager')&&compose.includes('/var/run/docker.sock')&&compose.includes('myo_caddy_sites'));
assert.ok(compose.includes('${MYO_VM_RAM:-16G}')&&compose.includes('${MYO_VM_CPU_CORES:-6}')&&compose.includes('${MYO_VM_DISK_SIZE:-256G}'));
assert.ok(!compose.includes('8006:8006'),'Do not publish the Windows console port directly');
assert.ok(!compose.includes('myo-disk-server'),'Only run the Windows VM and secure gateway');
const caddy=read('cloud-pc/Caddyfile');
assert.ok(caddy.includes('basic_auth')&&caddy.includes('reverse_proxy windows-vm:8006'));
assert.ok(caddy.includes('handle_path /api/*')&&caddy.includes('handle_path /manage/*')&&caddy.includes('MYO_MANAGER_TOKEN'));
assert.ok(read('cloud-pc/manager/Dockerfile').includes('CMD ["node","manager.mjs"]'));
assert.ok(read('cloud-pc/WINDOWS-VPS.md').includes('curl -fsSLO'));
assert.ok(read('.gitignore').includes('.env'));

for(const file of [
  'assets/pc-drive-ui.js','assets/pc-virtual-disk.js',
  'docs/DATA-MODEL.md','server/index.mjs','server/Dockerfile','server/package.json','server/test/api.test.mjs'
])assert.ok(!fs.existsSync(path.join(root,file)),'Unused prototype code remains: '+file);

const sw=read('sw.js');
const start=sw.indexOf('const CORE = ');
const open=sw.indexOf('[',start);
const end=sw.indexOf('];',open);
assert.ok(start>=0&&open>start&&end>open,'Service worker core cache list missing');
for(const item of JSON.parse(sw.slice(open,end+1))){
  const file=item==='/'?'index.html':item.startsWith('/')?item.slice(1):item;
  assert.ok(fs.existsSync(path.join(root,file)),'Missing cached file '+file);
}
console.log('M-Y-O checks passed: host KVM Windows VM, authenticated multi-PC manager API, persistent guest disks, and no browser OS simulator.');
