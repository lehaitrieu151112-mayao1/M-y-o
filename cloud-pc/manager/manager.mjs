import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PORT = 3000;
const DOMAIN = String(process.env.MYO_DOMAIN || '').toLowerCase();
const SOCKET = '/var/run/docker.sock';
const SITES = '/sites';
const NETWORK = 'myo_internal';
const MAX_PCS = Math.max(1, Math.min(20, Number(process.env.MYO_MAX_PCS || 10)));
const GB = 1024 ** 3;

if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(DOMAIN)) {
  throw new Error('MYO_DOMAIN must be a valid DNS hostname.');
}
fs.mkdirSync(SITES, { recursive: true });

function docker(method, apiPath, body, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? null : Buffer.from(JSON.stringify(body));
    const req = http.request({
      socketPath: SOCKET, path: apiPath, method, timeout,
      headers: payload ? { 'content-type': 'application/json', 'content-length': payload.length } : {}
    }, res => {
      const chunks = [];
      let size = 0;
      res.on('data', chunk => {
        size += chunk.length;
        if (size > 20 * 1024 * 1024) return req.destroy(new Error('Docker API response too large.'));
        chunks.push(chunk);
      });
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let data = raw;
        try { data = raw ? JSON.parse(raw) : null; } catch {}
        if (res.statusCode >= 400) {
          const err = new Error((data && data.message) || ('Docker API returned ' + res.statusCode));
          err.statusCode = res.statusCode;
          reject(err);
        } else resolve({ statusCode: res.statusCode, data });
      });
    });
    req.on('timeout', () => req.destroy(new Error('Docker API timeout.')));
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}
function send(res, status, value) {
  const body = Buffer.from(JSON.stringify(value));
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'content-length': body.length });
  res.end(body);
}
function validId(id) { return typeof id === 'string' && /^[a-f0-9]{12}$/.test(id); }
function envValue(env, key) {
  const row = (env || []).find(item => item.startsWith(key + '='));
  return row ? row.slice(key.length + 1) : '0';
}
function toGb(value) {
  const match = String(value || '').match(/^(\d+)([GM]?)$/i);
  if (!match) return 0;
  return Number(match[1]) * (match[2].toUpperCase() === 'M' ? 1 / 1024 : match[2].toUpperCase() === 'G' ? 1 : 1 / GB);
}
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '', bytes = 0;
    req.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > 16384) { reject(new Error('Request body too large.')); req.destroy(); }
      else raw += chunk.toString('utf8');
    });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid JSON request.')); } });
    req.on('error', reject);
  });
}
function publicPc(container) {
  const labels = container.Labels || {};
  const id = labels['myo.pc_id'];
  if (!validId(id)) return null;
  const hostname = 'pc-' + id + '.' + DOMAIN;
  return {
    id, name: labels['myo.pc_name'] || 'Windows PC', os: labels['myo.os'] || 'Windows 11',
    cpu: Number(labels['myo.cpu'] || 2), ram: Number(labels['myo.ram_gb'] || 4),
    disk: Number(labels['myo.disk_gb'] || 64), state: container.State || 'unknown',
    status: container.Status || '', hostname, url: 'https://' + hostname + '/'
  };
}
async function listManaged() {
  const filter = encodeURIComponent(JSON.stringify({ label: ['myo.managed=true'] }));
  const result = await docker('GET', '/containers/json?all=1&filters=' + filter);
  return (result.data || []).map(publicPc).filter(Boolean);
}
async function hostUsage() {
  const info = (await docker('GET', '/info')).data;
  const rows = (await docker('GET', '/containers/json?all=1')).data || [];
  let usedRam = 0, usedCpu = 0;
  for (const row of rows) {
    if (row.State !== 'running' || !String(row.Image || '').includes('dockurr/windows')) continue;
    try {
      const inspected = (await docker('GET', '/containers/' + row.Id + '/json')).data;
      const labels = inspected.Config && inspected.Config.Labels || {};
      const env = inspected.Config && inspected.Config.Env || [];
      usedRam += Number(labels['myo.ram_gb'] || toGb(envValue(env, 'RAM_SIZE')));
      usedCpu += Number(labels['myo.cpu'] || envValue(env, 'CPU_CORES'));
    } catch {}
  }
  return {
    totalRamGb: Math.floor(Number(info.MemTotal || 0) / GB), totalCpu: Number(info.NCPU || 0),
    usedRamGb: usedRam, usedCpu
  };
}
function siteConfig(id) {
  return 'pc-' + id + '.' + DOMAIN + ' {\n' +
    '  encode zstd gzip\n  basic_auth {\n' +
    '    {$MYO_PROXY_USER} {$MYO_PROXY_PASSWORD_HASH}\n' +
    '  }\n  reverse_proxy myo-windows-' + id + ':8006\n}\n';
}
async function reloadCaddy() {
  const rows = (await docker('GET', '/containers/json?all=1')).data || [];
  const caddy = rows.find(row => (row.Names || []).includes('/myo-windows-gateway') && row.State === 'running');
  if (!caddy) throw new Error('Caddy gateway is not running.');
  await docker('POST', '/containers/' + caddy.Id + '/restart?t=10', undefined, 30000);
}
async function cleanup(id, volume, sitePath) {
  try {
    const filter = encodeURIComponent(JSON.stringify({ name: ['myo-windows-' + id] }));
    const rows = (await docker('GET', '/containers/json?all=1&filters=' + filter)).data || [];
    for (const row of rows) {
      try { await docker('POST', '/containers/' + row.Id + '/stop?t=5'); } catch {}
      try { await docker('DELETE', '/containers/' + row.Id + '?force=1&v=1'); } catch {}
    }
  } catch {}
  try { await docker('DELETE', '/volumes/' + volume); } catch {}
  try { if (fs.existsSync(sitePath)) fs.unlinkSync(sitePath); } catch {}
  try { await reloadCaddy(); } catch {}
}
function errorStatus(err) {
  if (err.statusCode === 404) return 404;
  if (/connect|unavailable|not running/i.test(err.message)) return 503;
  return 400;
}

const app = http.createServer(async (req, res) => {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname;
  try {
    if (req.method === 'GET' && pathname === '/') {
      const html = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'index.html'));
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(html); return;
    }
    if (req.method === 'GET' && pathname === '/status') {
      try {
        const usage = await hostUsage(), pcs = await listManaged();
        send(res, 200, { ok: true, host: DOMAIN, maxPcs: MAX_PCS, totalPcs: pcs.length, ...usage, canCreate: pcs.length < MAX_PCS });
      } catch (err) { send(res, 503, { ok: false, error: 'Docker backend unavailable: ' + err.message }); }
      return;
    }
    if (req.method === 'GET' && pathname === '/pcs') {
      send(res, 200, { pcs: await listManaged() }); return;
    }
    if (req.method === 'POST' && pathname === '/pcs') {
      const body = await readBody(req);
      const name = String(body.name || '').trim().slice(0, 48);
      const os = String(body.os || 'Windows 11');
      const cpu = Number(body.cpu), ram = Number(body.ram), disk = Number(body.disk);
      if (!name) return send(res, 400, { error: 'Enter a PC name.' });
      if (!['Windows 11', 'Windows Server 2022'].includes(os)) return send(res, 400, { error: 'Unsupported Windows edition.' });
      if (![2, 4, 6, 8].includes(cpu) || ![4, 8, 16, 32].includes(ram) || ![64, 128, 256, 512].includes(disk)) {
        return send(res, 400, { error: 'Unsupported CPU, RAM or disk size.' });
      }
      if ((await listManaged()).length >= MAX_PCS) return send(res, 409, { error: 'This host reached its ' + MAX_PCS + '-PC limit.' });
      const usage = await hostUsage();
      if (!usage.totalCpu || !usage.totalRamGb) return send(res, 503, { error: 'Docker did not report host capacity.' });
      if (usage.usedCpu + cpu > usage.totalCpu) return send(res, 409, { error: 'Not enough CPU. Windows VMs currently use ' + usage.usedCpu + '/' + usage.totalCpu + ' vCPU.' });
      if (usage.usedRamGb + ram > usage.totalRamGb - 3) return send(res, 409, { error: 'Not enough RAM. ' + usage.usedRamGb + ' GB of ' + usage.totalRamGb + ' GB is in use; 3 GB is reserved for the host.' });

      const id = crypto.randomBytes(6).toString('hex');
      const volume = 'myo_windows_' + id;
      const sitePath = path.join(SITES, id + '.caddy');
      const password = crypto.randomBytes(18).toString('base64url');
      try {
        await docker('POST', '/images/create?fromImage=dockurr%2Fwindows&tag=latest', undefined, 900000);
        await docker('POST', '/volumes/create', { Name: volume, Labels: { 'myo.managed': 'true', 'myo.pc_id': id } });
        const labels = {
          'myo.managed': 'true', 'myo.pc_id': id, 'myo.pc_name': name, 'myo.os': os,
          'myo.cpu': String(cpu), 'myo.ram_gb': String(ram), 'myo.disk_gb': String(disk)
        };
        const config = {
          Image: 'dockurr/windows:latest',
          Env: [
            'VERSION=' + (os === 'Windows Server 2022' ? '2022' : '11'),
            'RAM_SIZE=' + ram + 'G', 'CPU_CORES=' + cpu, 'DISK_SIZE=' + disk + 'G',
            'USERNAME=myo', 'PASSWORD=' + password, 'LANGUAGE=English', 'REGION=en-US',
            'KEYBOARD=en-US', 'TPM=Y'
          ],
          Labels: labels,
          HostConfig: {
            Binds: [volume + ':/storage'],
            Devices: [
              { PathOnHost: '/dev/kvm', PathInContainer: '/dev/kvm', CgroupPermissions: 'rwm' },
              { PathOnHost: '/dev/net/tun', PathInContainer: '/dev/net/tun', CgroupPermissions: 'rwm' }
            ],
            CapAdd: ['NET_ADMIN'], ShmSize: 1073741824, Memory: ram * GB, NanoCpus: cpu * 1000000000,
            RestartPolicy: { Name: 'unless-stopped' }, NetworkMode: NETWORK
          },
          NetworkingConfig: { EndpointsConfig: { [NETWORK]: { Aliases: ['myo-windows-' + id] } } }
        };
        const result = await docker('POST', '/containers/create?name=myo-windows-' + id, config);
        if (!result.data || !result.data.Id) throw new Error('Docker did not return a VM ID.');
        await docker('POST', '/containers/' + result.data.Id + '/start');
        fs.writeFileSync(sitePath, siteConfig(id), { mode: 0o600, flag: 'wx' });
        await reloadCaddy();
        send(res, 201, {
          pc: { id, name, os, cpu, ram, disk, state: 'running', status: 'starting', url: 'https://pc-' + id + '.' + DOMAIN + '/' },
          guestUsername: 'myo', guestPassword: password,
          message: 'The KVM host accepted the VM. First Windows boot may take several minutes.'
        });
      } catch (err) { await cleanup(id, volume, sitePath); throw err; }
      return;
    }
    const action = pathname.match(/^\/pcs\/([a-f0-9]{12})\/(start|stop|restart)$/);
    if (req.method === 'POST' && action) {
      const id = action[1], verb = action[2];
      const filter = encodeURIComponent(JSON.stringify({ label: ['myo.pc_id=' + id, 'myo.managed=true'] }));
      const rows = (await docker('GET', '/containers/json?all=1&filters=' + filter)).data || [];
      const container = rows.find(row => (row.Names || []).includes('/myo-windows-' + id));
      if (!container) return send(res, 404, { error: 'PC not found.' });
      const endpoint = verb === 'stop' ? 'stop?t=30' : verb === 'restart' ? 'restart?t=30' : 'start';
      await docker('POST', '/containers/' + container.Id + '/' + endpoint, undefined, 60000);
      send(res, 200, { ok: true, action: verb }); return;
    }
    const deletion = pathname.match(/^\/pcs\/([a-f0-9]{12})$/);
    if (req.method === 'DELETE' && deletion) {
      const id = deletion[1];
      const filter = encodeURIComponent(JSON.stringify({ label: ['myo.pc_id=' + id, 'myo.managed=true'] }));
      const rows = (await docker('GET', '/containers/json?all=1&filters=' + filter)).data || [];
      const container = rows.find(row => (row.Names || []).includes('/myo-windows-' + id));
      if (!container) return send(res, 404, { error: 'PC not found.' });
      try { await docker('POST', '/containers/' + container.Id + '/stop?t=20'); }
      catch (err) { if (err.statusCode !== 304 && err.statusCode !== 404) throw err; }
      await docker('DELETE', '/containers/' + container.Id + '?force=1&v=1');
      try { await docker('DELETE', '/volumes/myo_windows_' + id); } catch (err) { if (err.statusCode !== 404) throw err; }
      const sitePath = path.join(SITES, id + '.caddy');
      if (fs.existsSync(sitePath)) fs.unlinkSync(sitePath);
      await reloadCaddy();
      send(res, 200, { ok: true, diskDeleted: true }); return;
    }
    send(res, 404, { error: 'Route not found.' });
  } catch (err) { send(res, errorStatus(err), { error: err.message || 'VM manager error.' }); }
});
app.listen(PORT, '0.0.0.0', () => console.log('M-Y-O real Windows VM manager listening on ' + PORT));
