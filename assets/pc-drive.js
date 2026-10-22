(() => {
'use strict';
const DB_NAME='myo-drive-files-v2',DB_VERSION=1,STORE='objects';
const QUOTA_BYTES=512*1024*1024,MAX_FILE_BYTES=128*1024*1024;
let dbPromise;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function cleanName(raw){const s=String(raw||'').trim().replace(/[\\/:*?"<>|\0]/g,'-').replace(/[. ]+$/,'').slice(0,180);if(!s||s==='.'||s==='..')throw new Error('Tên tệp/thư mục không hợp lệ');return s}
function cleanPath(raw='C:'){
 let p=String(raw||'C:').replace(/\\/g,'/').trim();
 if(p==='C:'||/^C:\\/?$/i.test(p)||p==='/')return 'C:';
 p=p.replace(/^\/+/, '');
 if(/^C:/i.test(p))p=p.slice(2);
 const parts=p.split('/').filter(Boolean);
 if(parts.some(x=>x==='.'||x==='..'||x.includes(':')||x.includes('\0')))throw new Error('Đường dẫn ổ C: ảo không hợp lệ');
 return parts.length?'C:/'+parts.map(cleanName).join('/'):'C:';
}
function join(base,...parts){let p=cleanPath(base);for(const part of parts){const n=String(part??'').replace(/^[/\\]+|[/\\]+$/g,'');if(n)p=cleanPath(p==='C:'?'C:/'+n:p+'/'+n)}return p}
function parent(path){const p=cleanPath(path);if(p==='C:')return null;const i=p.lastIndexOf('/');return i<=2?'C:':p.slice(0,i)}
function nameOf(path){const p=cleanPath(path);return p==='C:'?'MYO-C:':p.slice(p.lastIndexOf('/')+1)}
function openDb(){
 if(dbPromise)return dbPromise;
 dbPromise=new Promise((resolve,reject)=>{
  if(!('indexedDB' in window)){reject(new Error('Trình duyệt không hỗ trợ kho ổ đĩa ảo'));return}
  const req=indexedDB.open(DB_NAME,DB_VERSION);
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE)){const s=db.createObjectStore(STORE,{keyPath:'path'});s.createIndex('parent','parent',{unique:false});s.createIndex('kind','kind',{unique:false})}};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('Không mở được ổ đĩa ảo'));
 });
 return dbPromise;
}
function txDone(tx){return new Promise((resolve,reject)=>{tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error||new Error('Giao dịch ổ đĩa lỗi'));tx.onabort=()=>reject(tx.error||new Error('Giao dịch ổ đĩa bị huỷ'))})}
async function all(){const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(STORE,'readonly').objectStore(STORE).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})}
function publicMeta(obj){const {blob,...rest}=obj;return rest}
async function get(path){const db=await openDb(),p=cleanPath(path);return new Promise((resolve,reject)=>{const r=db.transaction(STORE,'readonly').objectStore(STORE).get(p);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
async function init(){const db=await openDb();const root=await get('C:');if(!root){const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put({path:'C:',name:'MYO-C:',kind:'dir',mime:'inode/directory',size:0,parent:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});await txDone(tx)}return true}
async function mkdir(path){await init();const p=cleanPath(path);if(p==='C:')return publicMeta(await get(p));const par=parent(p);await ensureDir(par);const existing=await get(p);if(existing?.kind==='dir')return publicMeta(existing);if(existing)throw new Error('Đường dẫn đã có tệp cùng tên');const db=await openDb(),tx=db.transaction(STORE,'readwrite'),obj={path:p,name:nameOf(p),kind:'dir',mime:'inode/directory',size:0,parent:par,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};tx.objectStore(STORE).put(obj);await txDone(tx);return publicMeta(obj)}
async function ensureDir(path){await init();const p=cleanPath(path);if(p==='C:')return true;const par=parent(p);if(par&&par!==p)await ensureDir(par);const ex=await get(p);if(ex&&ex.kind!=='dir')throw new Error('Một tệp đã dùng tên thư mục: '+p);if(!ex)await mkdir(p);return true}
async function saveBlob(path,blob,meta={}){
 await init();const p=cleanPath(path);if(p==='C:')throw new Error('Không thể ghi tệp vào gốc đĩa');
 if(!(blob instanceof Blob))blob=new Blob([blob],{type:meta.mime||'application/octet-stream'});
 if(blob.size>MAX_FILE_BYTES)throw new Error('Mỗi tệp giới hạn 128 MB trong sandbox hiện tại');
 const par=parent(p);await ensureDir(par);const old=await get(p);if(old?.kind==='dir')throw new Error('Đường dẫn này là thư mục');
 const objects=await all(),used=objects.reduce((n,x)=>n+(x.kind==='file'?(Number(x.size)||0):0),0);
 if(used+blob.size-(old?.size||0)>QUOTA_BYTES)throw new Error('Ổ C: ảo demo đầy (512 MB). Cloud storage cần backend riêng.');
 const db=await openDb(),tx=db.transaction(STORE,'readwrite');
 const obj={path:p,name:nameOf(p),kind:'file',mime:meta.mime||blob.type||'application/octet-stream',size:blob.size,parent:par,blob,source:meta.source||meta.sourceUrl||null,recordType:meta.recordType||null,metadata:meta.metadata||{},createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
 tx.objectStore(STORE).put(obj);await txDone(tx);return publicMeta(obj);
}
async function saveText(path,text,meta={}){return saveBlob(path,new Blob([String(text??'')],{type:meta.mime||'text/plain;charset=utf-8'}),meta)}
async function saveFile({name,path='C:/Downloads',blob,text,kind='file',mime,sourceUrl,metadata={}}){return saveBlob(join(path,name),blob??new Blob([String(text??'')],{type:mime||'text/plain;charset=utf-8'}),{kind,mime,source:sourceUrl,metadata})}
async function list(path='C:'){await init();const p=cleanPath(path),objects=await all();return objects.filter(x=>x.parent===p&&x.path!==p).sort((a,b)=>a.kind===b.kind?a.name.localeCompare(b.name):a.kind==='dir'?-1:1).map(publicMeta)}
async function listAll(){await init();return (await all()).map(publicMeta)}
async function getBlob(path){const obj=await get(path);if(!obj||obj.kind!=='file')throw new Error('Không tìm thấy tệp trong ổ C: ảo');return obj.blob}
async function readText(path){const obj=await get(path);if(!obj||obj.kind!=='file')throw new Error('Không tìm thấy tệp văn bản');if(obj.size>2*1024*1024)throw new Error('Tệp trên 2 MB không mở trong Notepad nội bộ');return obj.blob.text()}
async function remove(path){await init();const p=cleanPath(path);if(p==='C:')throw new Error('Không thể xóa gốc ổ C: ảo');const objects=await all(),targets=objects.filter(o=>o.path===p||o.path.startsWith(p+'/'));if(!targets.length)throw new Error('Không tìm thấy tệp/thư mục');const db=await openDb(),tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE);for(const obj of targets)store.delete(obj.path);await txDone(tx);return true}
async function exportFile(path){const obj=await get(path);if(!obj||obj.kind!=='file')throw new Error('Không tìm thấy tệp');const url=URL.createObjectURL(obj.blob),a=document.createElement('a');a.href=url;a.download=obj.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2500);return true}
async function stats(){const objects=await all(),files=objects.filter(x=>x.kind==='file'),dirs=objects.filter(x=>x.kind==='dir'),bytes=files.reduce((n,x)=>n+(x.size||0),0);return {fileCount:files.length,dirCount:dirs.length,count:objects.length,bytes,quotaBytes:QUOTA_BYTES,usedPercent:Math.min(100,Math.round(bytes/QUOTA_BYTES*100)),diskName:'MYO-C: Virtual Disk',backend:'IndexedDB sandbox theo trình duyệt',cloudReady:false}}
async function seedCatalogues(){await init();for(const p of ['C:/Downloads','C:/Downloads/Links','C:/Games','C:/Programs','C:/Programs/Installers','C:/Documents','C:/System','C:/Users','C:/Users/Player','C:/Users/Player/Desktop'])await ensureDir(p);const existing=await all();const entries=[...(window.MYO_SOFTWARE||[]).map(x=>({...x,itemKind:'software'})),...(window.MYO_GAMES||[]).map(x=>({...x,itemKind:'game'}))];for(const item of entries){const folder=item.itemKind==='game'?'C:/Games':'C:/Programs/Installers',p=join(folder,item.name+'.url');if(!existing.some(o=>o.path===p))await saveText(p,'[InternetShortcut]\r\nURL='+item.source+'\r\n',{mime:'application/internet-shortcut',source:item.source,recordType:'official-source-shortcut',metadata:{catalogId:item.id,publisher:item.publisher,kind:item.itemKind,shortcutOnly:true}})}return true}
function validatePublicUrl(raw){let u;try{u=new URL(raw)}catch{throw new Error('Cần URL trực tiếp đến tệp, không phải trang cửa hàng.')}if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw new Error('Chỉ cho phép URL HTTP/HTTPS hợp lệ.');const h=u.hostname.toLowerCase();if(h==='localhost'||h.endsWith('.local')||h==='::1'||/^127\./.test(h)||/^10\./.test(h)||/^192\.168\./.test(h)||/^169\.254\./.test(h)||/^172\.(1[6-9]|2\d|3[01])\./.test(h)||/^0\./.test(h))throw new Error('Không tải từ localhost hoặc IP mạng riêng.');return u.href}
async function downloadDirect(raw,name,dest='C:/Downloads'){
 const url=validatePublicUrl(raw);name=cleanName(name||'download.bin');if(!navigator.onLine)throw new Error('Không có kết nối Internet.');
 let response;try{response=await fetch(url,{method:'GET',mode:'cors',credentials:'omit',redirect:'follow',cache:'no-store',signal:AbortSignal.timeout(90000)})}catch{throw new Error('Không thể tải URL vào ổ ảo: nguồn không cho phép CORS hoặc không hỗ trợ tải trong trình duyệt. Nhiều cửa hàng game chặn tải trực tiếp.')}
 if(!response.ok)throw new Error('Nguồn trả về HTTP '+response.status);
 const type=response.headers.get('content-type')||'application/octet-stream',len=Number(response.headers.get('content-length')||0);
 if(type.toLowerCase().includes('text/html'))throw new Error('URL trả về một trang web HTML, không phải bộ cài/tệp trực tiếp.');
 if(len>MAX_FILE_BYTES)throw new Error('Tệp vượt quá giới hạn 128 MB của sandbox.');
 const blob=await response.blob();if(blob.size>MAX_FILE_BYTES)throw new Error('Tệp vượt quá giới hạn 128 MB của sandbox.');
 const obj=await saveBlob(join(dest,name),blob,{mime:type,source:url,recordType:'direct-download'});return {...obj,size:blob.size,mime:type,path:obj.path};
}
async function saveGameShortcut({id,name,url,kind='game',publisher=''}){const u=validatePublicUrl(url),p=join('C:/Downloads/Links',cleanName(name||id)+'.url');return saveText(p,'[InternetShortcut]\r\nURL='+u+'\r\n',{mime:'application/internet-shortcut',source:u,recordType:'official-link',metadata:{catalogId:id,catalogKind:kind,publisher}})}
async function readBlob(path){return getBlob(path)}
async function fileExists(path){return Boolean(await get(path))}
window.MYOVirtualDisk={init,join,parent,nameOf,ensureDir,mkdir,saveText,saveBlob,saveFile,list,listAll,get,getMeta:get,readText,readBlob,getBlob,remove,exportFile,stats,seedCatalogues,downloadDirect,saveGameShortcut,fileExists,quotaBytes:QUOTA_BYTES};
window.MYOPCVirtualDisk=window.MYOVirtualDisk;
})();