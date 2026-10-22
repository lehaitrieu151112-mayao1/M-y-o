import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(process.env.MYO_DATA_DIR||path.join(path.dirname(fileURLToPath(import.meta.url)),'data'));
const PORT=Number(process.env.PORT||8787);
const TOKEN=process.env.MYO_SERVER_TOKEN||'';
const MAX_FILE_BYTES=Math.max(1024,Number(process.env.MYO_MAX_FILE_BYTES||64*1024*1024));
const DEFAULT_QUOTA=Math.max(1024*1024,Number(process.env.MYO_DEFAULT_DISK_QUOTA_BYTES||1024*1024*1024));
const CORS_ORIGIN=process.env.MYO_CORS_ORIGIN||'';
const JSON_HEADERS={'content-type':'application/json; charset=utf-8','x-content-type-options':'nosniff','cache-control':'no-store'};
const idPattern=/^[a-f0-9-]{36}$/i;

function json(res,status,obj,extra={}){res.writeHead(status,{...JSON_HEADERS,...extra});res.end(JSON.stringify(obj))}
function error(res,status,message){json(res,status,{ok:false,error:message})}
function safeEqual(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)}
function authorized(req){const h=req.headers.authorization||'';const provided=h.startsWith('Bearer ')?h.slice(7):'';return TOKEN.length>=24&&provided.length>=24&&safeEqual(provided,TOKEN)}
function normalizeVirtualPath(raw='/'){let s=String(raw||'/').replace(/\\/g,'/');if(!s.startsWith('/'))s='/'+s;const parts=s.split('/').filter(Boolean);if(parts.some(p=>p==='.'||p==='..'||p.includes('\0')||p.includes(':')||p.includes('\\')))throw new Error('Invalid virtual path');if(parts.some(p=>Buffer.byteLength(p,'utf8')>180))throw new Error('Path component too long');return '/'+parts.join('/')}
function diskDir(id){if(!idPattern.test(id))throw new Error('Invalid disk id');return path.join(ROOT,'disks',id)}
function resolveFile(diskId,vpath){const normalized=normalizeVirtualPath(vpath);const base=diskDir(diskId);const target=path.resolve(base,'.'+normalized);if(target!==base&&!target.startsWith(base+path.sep))throw new Error('Path traversal rejected');return {base,target,virtualPath:normalized}}
async function readDisk(id){const file=path.join(diskDir(id),'disk.json');const d=JSON.parse(await fs.readFile(file,'utf8'));if(d.id!==id)throw new Error('Disk metadata mismatch');return d}
async function writeDisk(disk){const dir=diskDir(disk.id);await fs.mkdir(dir,{recursive:true});const tmp=path.join(dir,'disk.json.tmp');await fs.writeFile(tmp,JSON.stringify(disk,null,2),{mode:0o600});await fs.rename(tmp,path.join(dir,'disk.json'))}
async function listDisks(){const dir=path.join(ROOT,'disks');await fs.mkdir(dir,{recursive:true});const entries=await fs.readdir(dir,{withFileTypes:true});const out=[];for(const e of entries){if(!e.isDirectory()||!idPattern.test(e.name))continue;try{const d=await readDisk(e.name);out.push({id:d.id,name:d.name,createdAt:d.createdAt,quotaBytes:d.quotaBytes})}catch{}}return out}
async function ensureQuota(disk,base){let used=0;async function walk(dir){let list=[];try{list=await fs.readdir(dir,{withFileTypes:true})}catch{return}for(const e of list){if(e.name==='disk.json'||e.name.endsWith('.tmp'))continue;const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else if(e.isFile()){const st=await fs.stat(p);used+=st.size}}}await walk(base);disk.usedBytes=used;return used}
async function readBody(req,limit){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>limit){const e=new Error('Request body exceeds upload limit');e.status=413;throw e}chunks.push(chunk)}return Buffer.concat(chunks)}
async function handle(req,res){
 const origin=req.headers.origin;
 if(CORS_ORIGIN&&origin===CORS_ORIGIN)res.setHeader('access-control-allow-origin',origin);
 res.setHeader('vary','Origin');res.setHeader('access-control-allow-methods','GET,POST,PUT,DELETE,OPTIONS');res.setHeader('access-control-allow-headers','Authorization,Content-Type');
 if(req.method==='OPTIONS'){res.writeHead(204);res.end();return}
 const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
 if(url.pathname==='/health'&&req.method==='GET'){json(res,200,{ok:true,service:'myo-virtual-disk-api',storage:'persistent-volume',authenticatedApi:TOKEN.length>=24,windowsGamingHost:'not-provisioned',time:new Date().toISOString()});return}
 if(!url.pathname.startsWith('/api/v1/')){error(res,404,'Not found');return}
 if(!authorized(req)){error(res,401,'Missing or invalid server token');return}
 if(url.pathname==='/api/v1/disks'&&req.method==='GET'){json(res,200,{ok:true,disks:await listDisks()});return}
 if(url.pathname==='/api/v1/disks'&&req.method==='POST'){
  const body=JSON.parse((await readBody(req,64*1024)).toString('utf8')||'{}');const name=String(body.name||'MYO Virtual Disk').trim().slice(0,100);const quota=Math.min(Math.max(Number(body.quotaBytes||DEFAULT_QUOTA),1024*1024),10*1024*1024*1024);const disk={id:crypto.randomUUID(),name:name||'MYO Virtual Disk',quotaBytes:quota,createdAt:new Date().toISOString(),version:1};await fs.mkdir(diskDir(disk.id),{recursive:true});await writeDisk(disk);json(res,201,{ok:true,disk});return
 }
 const m=url.pathname.match(/^\/api\/v1\/disks\/([a-f0-9-]{36})(?:\/(files|folders))?$/i);
 if(!m){error(res,404,'Unknown API route');return}
 const id=m[1],resource=m[2]||'';
 let disk;try{disk=await readDisk(id)}catch{error(res,404,'Virtual disk not found');return}
 const base=diskDir(id);
 if(resource==='files'&&req.method==='GET'){
  let vpath;try{vpath=normalizeVirtualPath(url.searchParams.get('path')||'/')}catch(e){error(res,400,e.message);return}
  const {target}=resolveFile(id,vpath);let st;try{st=await fs.stat(target)}catch{error(res,404,'File or directory not found');return}
  if(st.isDirectory()){const items=[];for(const e of await fs.readdir(target,{withFileTypes:true})){if(e.name==='disk.json'||e.name.endsWith('.tmp'))continue;const full=path.join(target,e.name),st=await fs.stat(full);items.push({name:e.name,type:e.isDirectory()?'directory':'file',size:e.isFile()?st.size:0,updatedAt:st.mtime.toISOString()})}json(res,200,{ok:true,disk:{id:disk.id,name:disk.name},path:vpath,items});return}
  if(!st.isFile()){error(res,400,'Unsupported filesystem object');return}
  res.writeHead(200,{'content-type':'application/octet-stream','content-length':st.size,'content-disposition':`attachment; filename*=UTF-8''${encodeURIComponent(path.basename(target))}`,'x-content-type-options':'nosniff','cache-control':'no-store'});res.end(await fs.readFile(target));return
 }
 if(resource==='files'&&req.method==='PUT'){
  let vpath;try{vpath=normalizeVirtualPath(url.searchParams.get('path')||'/file.bin')}catch(e){error(res,400,e.message);return}
  if(vpath==='/'){error(res,400,'File path cannot be root');return}
  const contentLength=Number(req.headers['content-length']||0);if(contentLength>MAX_FILE_BYTES){error(res,413,'File exceeds configured per-file upload limit');return}
  const body=await readBody(req,MAX_FILE_BYTES);const {base:diskBase,target}=resolveFile(id,vpath);await fs.mkdir(path.dirname(target),{recursive:true});
  const parent=path.dirname(vpath),siblings=await fs.readdir(path.dirname(target),{withFileTypes:true}).catch(()=>[]);const old=await fs.stat(target).catch(()=>null);const used=await ensureQuota(disk,diskBase);
  if(used-(old?.size||0)+body.length>disk.quotaBytes){error(res,413,'Virtual disk quota exceeded');return}
  const tmp=target+'.'+crypto.randomUUID()+'.tmp';await fs.writeFile(tmp,body,{mode:0o600});await fs.rename(tmp,target);await fs.chmod(target,0o600).catch(()=>{});const st=await fs.stat(target);json(res,200,{ok:true,file:{path:vpath,name:path.basename(target),size:st.size,updatedAt:st.mtime.toISOString()},usedBytes:used-(old?.size||0)+body.length,quotaBytes:disk.quotaBytes,contentType:req.headers['content-type']||'application/octet-stream'});return
 }
 if(resource==='folders'&&req.method==='POST'){
  const body=JSON.parse((await readBody(req,32*1024)).toString('utf8')||'{}');let vpath;try{vpath=normalizeVirtualPath(body.path)}catch(e){error(res,400,e.message);return}const {target}=resolveFile(id,vpath);await fs.mkdir(target,{recursive:true,mode:0o700});json(res,201,{ok:true,path:vpath});return
 }
 if(resource==='files'&&req.method==='DELETE'){
  let vpath;try{vpath=normalizeVirtualPath(url.searchParams.get('path'))}catch(e){error(res,400,e.message);return}if(vpath==='/'){error(res,400,'Cannot delete disk root');return}const {target}=resolveFile(id,vpath);try{await fs.rm(target,{recursive:false})}catch{error(res,404,'File not found');return}json(res,200,{ok:true,deleted:vpath});return
 }
 if(!resource&&req.method==='DELETE'){await fs.rm(base,{recursive:true,force:true});json(res,200,{ok:true,deleted:id});return}
 error(res,405,'Method not allowed')
}
const server=http.createServer(async(req,res)=>{try{await handle(req,res)}catch(e){if(res.headersSent){res.destroy();return}json(res,e.status||400,{ok:false,error:e.status===413?'Payload too large':process.env.NODE_ENV==='production'?'Request failed':String(e.message||e)})}});
server.requestTimeout=120_000;server.headersTimeout=15_000;server.keepAliveTimeout=5_000;
await fs.mkdir(path.join(ROOT,'disks'),{recursive:true});
server.listen(PORT,'0.0.0.0',()=>console.log(`M-Y-O disk API listening on :${PORT}; data dir: ${ROOT}`));
