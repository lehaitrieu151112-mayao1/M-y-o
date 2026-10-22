import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverFile=fileURLToPath(new URL('../index.mjs',import.meta.url));
let child,root,base,token;
before(async()=>{
  root=await mkdtemp(path.join(os.tmpdir(),'myo-disk-api-'));
  token='test-token-'+Array.from({length:40},()=>Math.floor(Math.random()*16).toString(16)).join('');
  const port=23000+Math.floor(Math.random()*20000);
  base='http://127.0.0.1:'+port;
  child=spawn(process.execPath,[serverFile],{cwd:path.dirname(serverFile),env:{...process.env,PORT:String(port),MYO_DATA_DIR:root,MYO_SERVER_TOKEN:token,MYO_CORS_ORIGIN:''},stdio:['ignore','pipe','pipe']});
  let last='';
  for(let i=0;i<80;i++){
    if(child.exitCode!==null)throw new Error('Disk API exited before startup: '+last);
    try{const res=await fetch(base+'/health');if(res.ok)return}catch(e){last=String(e)}
    await new Promise(r=>setTimeout(r,100));
  }
  throw new Error('Disk API failed to start: '+last);
});
after(async()=>{
  if(child&&!child.killed)child.kill('SIGTERM');
  if(child)await new Promise(resolve=>{if(child.exitCode!==null)return resolve();child.once('exit',resolve);setTimeout(resolve,1000)});
  if(root)await rm(root,{recursive:true,force:true});
});
function call(route,opts={}){const headers=new Headers(opts.headers||{});if(opts.auth!==false)headers.set('authorization','Bearer '+token);headers.set('connection','close');return fetch(base+route,{...opts,headers})}

test('health is public but virtual-disk routes require auth and persist file bytes',async()=>{
  const health=await fetch(base+'/health');assert.equal(health.status,200);
  const hi=await health.json();assert.equal(hi.ok,true);assert.equal(hi.windowsGamingHost,'not-provisioned');
  assert.equal((await call('/api/v1/disks',{method:'GET',auth:false})).status,401);

  const made=await call('/api/v1/disks',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'MYO-C',quotaBytes:1048576})});
  assert.equal(made.status,201);const {disk}=await made.json();assert.ok(disk.id);
  const folder=await call('/api/v1/disks/'+disk.id+'/folders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({path:'/Downloads'})});
  assert.equal(folder.status,201);

  const body='persisted inside virtual disk';
  const write=await call('/api/v1/disks/'+disk.id+'/files?path=%2FDownloads%2Fhello.txt',{method:'PUT',headers:{'content-type':'text/plain'},body});
  assert.equal(write.status,200);assert.equal((await write.json()).file.size,Buffer.byteLength(body));
  const listing=await call('/api/v1/disks/'+disk.id+'/files?path=%2FDownloads');assert.equal(listing.status,200);
  const items=(await listing.json()).items;assert.equal(items.length,1);assert.equal(items[0].name,'hello.txt');
  const read=await call('/api/v1/disks/'+disk.id+'/files?path=%2FDownloads%2Fhello.txt');assert.equal(await read.text(),body);
  const traversal=await call('/api/v1/disks/'+disk.id+'/files?path=%2F..%2Fsecret.txt');assert.equal(traversal.status,400);
  const removed=await call('/api/v1/disks/'+disk.id+'/files?path=%2FDownloads%2Fhello.txt',{method:'DELETE'});assert.equal(removed.status,200);
  const missing=await call('/api/v1/disks/'+disk.id+'/files?path=%2FDownloads%2Fhello.txt');assert.equal(missing.status,404);
});
