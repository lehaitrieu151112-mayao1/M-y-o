(() => {
'use strict';
const D=()=>window.MYOPCVirtualDisk;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtBytes=n=>n>=1073741824?(n/1073741824).toFixed(2)+' GB':n>=1048576?(n/1048576).toFixed(1)+' MB':n>=1024?(n/1024).toFixed(1)+' KB':n+' B';
let currentPath='/',boundRoot=null;
const ROOT_FOLDERS=['Desktop','Documents','Downloads','Games','Programs','Temp'];
async function seed(){
 const fs=await D().list('/');
 for(const n of ROOT_FOLDERS)if(!fs.some(x=>x.name===n&&x.kind==='folder'))await D().makeFolder(n,'/');
 const programFiles=await D().list('/Programs');
 const sw=window.MYO_SOFTWARE||[];
 const g=window.MYO_GAMES||[];
 for(const a of sw){const file=a.name+'.url';if(!programFiles.some(x=>x.name===file))await D().saveText(file,'[InternetShortcut]\r\nURL='+a.source+'\r\n',{path:'/Programs',kind:'shortcut',sourceUrl:a.source,metadata:{softwareId:a.id,publisher:a.publisher,preloadedShortcut:true,notInstalled:true}})}
 const gameFiles=await D().list('/Games');
 for(const a of g){const file=a.name+'.url';if(!gameFiles.some(x=>x.name===file))await D().saveText(file,'[InternetShortcut]\r\nURL='+a.source+'\r\n',{path:'/Games',kind:'shortcut',sourceUrl:a.source,metadata:{gameId:a.id,publisher:a.publisher,preloadedShortcut:true,notInstalled:true}})}
}
function formatPath(p){return p==='/'?'MYO-C:':('MYO-C:'+p)}
function html(){return '<div class="drive-shell"><div class="drive-top"><div><div class="drive-eyebrow">MYO VIRTUAL DISK</div><h2 class="window-heading">Ổ đĩa ảo C:</h2><p class="subtext">Kho tệp riêng của PC Workspace · Không truy cập ổ C: thật của máy tính.</p></div><span class="drive-badge">● WORKSPACE SANDBOX</span></div><div class="drive-metrics"><div><span>Ổ đĩa</span><strong>MYO-C:</strong></div><div><span>Số mục</span><strong id="driveItemCount">…</strong></div><div><span>Dung lượng dùng</span><strong id="driveUsed">…</strong></div><div><span>Giới hạn demo</span><strong id="driveQuota">512 MB</strong></div></div><div class="drive-space"><div id="driveUsageBar" class="drive-space-fill" style="width:0%"></div></div><div class="drive-toolbar"><button class="mini-button primary" data-drive-action="new-folder">＋ Thư mục</button><button class="mini-button" data-drive-action="new-text">＋ Tệp văn bản</button><button class="mini-button" data-drive-action="import-file">⬆ Nhập tệp vào ổ ảo</button><button class="mini-button" data-drive-action="refresh">⟳ Làm mới</button><button class="mini-button" data-drive-action="root">⌂ Gốc C:</button></div><div class="drive-breadcrumb" id="driveBreadcrumb">MYO-C:</div><div class="drive-file-list" id="driveFileList"><div class="empty-state">Đang mở ổ đĩa ảo…</div></div><input id="driveUploadInput" type="file" multiple hidden><div class="drive-footnote">Các tệp nằm trong kho IndexedDB riêng theo website này (không nằm trong File Explorer của Windows). Hiện tại đây là sandbox bền vững trong trình duyệt hiện tại, chưa đồng bộ giữa thiết bị/máy chủ. Khi được kết nối cloud backend thật, tệp sẽ được lưu từ xa.</div></div>'}
function icon(f){if(f.kind==='folder')return '📁';if(f.kind==='shortcut')return f.metadata?.softwareId?'📦':'🎮';if((f.mime||'').startsWith('image/'))return '🖼️';if((f.mime||'').includes('zip')||/\.zip$|\.7z$|\.rar$/i.test(f.name))return '🗜️';if((f.mime||'').includes('executable')||/\.exe$|\.msi$/i.test(f.name))return '📦';if(/\.json$/.test(f.name))return '🧾';if(/\.txt$|\.md$/i.test(f.name))return '📝';return '📄'}
async function render(e){
 if(!e)e=window.MYOPC?.getWindowElement('drive');if(!e)return;
 const grid=e.querySelector('#driveFileList');if(!grid)return;
 e.querySelector('#driveBreadcrumb').textContent=formatPath(currentPath);
 try{
  const [files,stats]=await Promise.all([D().list(currentPath),D().stats()]);
  e.querySelector('#driveItemCount').textContent=String(stats.count);
  e.querySelector('#driveUsed').textContent=fmtBytes(stats.bytes);
  e.querySelector('#driveQuota').textContent=fmtBytes(stats.quotaBytes);
  e.querySelector('#driveUsageBar').style.width=stats.usedPercent+'%';
  if(!files.length){grid.innerHTML='<div class="empty-state">Thư mục trống. Tạo thư mục hoặc nhập tệp để bắt đầu.</div>';return}
  grid.innerHTML=files.map(f=>'<article class="drive-file-card"><button type="button" class="drive-file-main" data-drive-open="'+esc(f.id)+'" data-drive-kind="'+esc(f.kind)+'"><span class="drive-file-icon">'+icon(f)+'</span><span class="drive-file-name">'+esc(f.name)+'</span><small>'+esc(f.kind==='folder'?'Thư mục':f.kind==='shortcut'?'Shortcut / liên kết chính thức':f.kind==='imported-file'?'Tệp đã nhập':'Tệp')+' · '+esc(f.size===0?'':fmtBytes(f.size))+'</small></button><div class="drive-file-actions">'+(f.kind==='folder'?'<button type="button" data-drive-open="'+esc(f.id)+'" data-drive-kind="folder" title="Mở thư mục">Mở</button>':(f.sourceUrl?'<button type="button" data-drive-source="'+esc(f.id)+'" title="Xem trang bên trong Chrome workspace">Xem</button>':'<button type="button" data-drive-read="'+esc(f.id)+'" title="Mở văn bản">Mở</button>'))+'<button type="button" data-drive-delete="'+esc(f.id)+'" title="Xóa khỏi ổ ảo">×</button></div></article>').join('');
 }catch(err){grid.innerHTML='<div class="empty-state">Không mở được ổ đĩa ảo: '+esc(err.message||err)+'</div>'}
}
async function newFolder(e){const name=prompt('Tên thư mục trong MYO-C:');if(!name)return;await D().makeFolder(name,currentPath);await render(e);window.MYOPC?.notify('Đã tạo thư mục trong ổ đĩa ảo.')}
async function newText(e){const name=(prompt('Tên tệp văn bản:','ghi-chu.txt')||'').trim();if(!name)return;const text=prompt('Nội dung tệp:','Tệp mới trong MYO Virtual Disk')||'';await D().saveText(name,text,{path:currentPath,kind:'text'});await render(e);window.MYOPC?.notify('Đã tạo tệp trong ổ đĩa ảo.')}
async function importFiles(e){const input=e.querySelector('#driveUploadInput');input.value='';input.onchange=async()=>{try{const files=Array.from(input.files||[]);if(!files.length)return;const imported=await D().importFiles(files,currentPath);await render(e);window.MYOPC?.notify('Đã nhập '+imported.length+' tệp vào MYO-C:. Tệp được lưu trong kho nội bộ của ứng dụng, không đưa vào ổ C: thật.')}catch(err){window.MYOPC?.notify('Không nhập được tệp: '+err.message)}};input.click()}
async function openFile(e,id,kind){const f=await D().readFile(id);if(kind==='folder'){currentPath=(currentPath==='/'?'':currentPath)+'/'+f.name;currentPath=D().path(currentPath);await render(e);return}if(f.sourceUrl){window.MYOPC?.openUrlInside?.(f.sourceUrl,f.name);return}if(f.size>2*1024*1024){window.MYOPC?.notify('Tệp lớn hơn 2 MB, có thể tải ra ngoài bằng nút xuất nếu cần.');return}if((f.mime||'').startsWith('text/')||/\.txt$|\.md$|\.json$|\.csv$|\.url$/i.test(f.name)){const text=await f.blob.text();window.MYOPC?.setOpenFile({name:f.name,text,virtualDiskId:f.id,virtualDiskPath:f.path});window.MYOPC?.open('notepad');return}window.MYOPC?.notify('Đã chọn '+f.name+' trong ổ đĩa ảo. Dạng tệp này chưa có ứng dụng đọc nội bộ.')}
async function bind(e){await seed();await render(e);e.addEventListener('click',async ev=>{const b=ev.target.closest('button');if(!b)return;try{
 if(b.dataset.driveAction){switch(b.dataset.driveAction){case'new-folder':await newFolder(e);return;case'new-text':await newText(e);return;case'import-file':await importFiles(e);return;case'refresh':await render(e);return;case'root':currentPath='/';await render(e);return}}
 if(b.dataset.driveOpen){await openFile(e,b.dataset.driveOpen,b.dataset.driveKind);return}
 if(b.dataset.driveRead){await openFile(e,b.dataset.driveRead,'file');return}
 if(b.dataset.driveSource){await openFile(e,b.dataset.driveSource,'shortcut');return}
 if(b.dataset.driveDelete){const f=await D().readFile(b.dataset.driveDelete);if(confirm('Xóa '+f.name+' khỏi ổ đĩa ảo?')){await D().removeFile(f.id);await render(e);window.MYOPC?.notify('Đã xóa tệp khỏi kho MYO-C:.')}return}
 }catch(err){window.MYOPC?.notify(err.message||String(err))}
 })}
window.MYOPCDriveUI={html,bind,render,getCurrentPath:()=>currentPath,setCurrentPath:p=>{currentPath=D().path(p)}};
})();