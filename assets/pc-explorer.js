(() => {
'use strict';
let rootHandle=null,currentHandle=null,handleStack=[],currentFolder='This PC',pickedFiles=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function msg(e,s){const n=e.querySelector('#explorerFeedback');if(n)n.textContent=s;window.MYOPC?.notify(s)}
function setFolderButtons(e){e.querySelectorAll('[data-explorer-folder]').forEach(b=>b.classList.toggle('active',b.dataset.explorerFolder===currentFolder))}
function virtualItems(){
const games=Array.isArray(window.MYO_GAMES)?window.MYO_GAMES:[];
if(currentFolder==='This PC')return [{name:'📂 Chọn thư mục thật',kind:'action',action:'choose-folder',detail:'Duyệt thư mục bạn cấp quyền'},{name:'Documents',icon:'📄',kind:'folder',target:'Documents',detail:'Tài liệu demo trong trình duyệt'},{name:'Downloads',icon:'⬇️',kind:'folder',target:'Downloads',detail:pickedFiles.length+' tệp đã chọn'},{name:'Games',icon:'🎮',kind:'folder',target:'Games',detail:'Game PC và nguồn chính thức'},{name:'PC Profile.json',icon:'⚙️',kind:'config',detail:'Hồ sơ cấu hình lưu cục bộ'},{name:'Ghi chú.txt',icon:'📝',kind:'note',detail:'Ghi chú trong trình duyệt'}];
if(currentFolder==='Games')return games.map(g=>({name:g.name,icon:g.icon,kind:'game',game:g,detail:g.genre+' · '+g.publisher}));
if(currentFolder==='Recent')return (window.MYOPCStorage?.getRecents()||[]).map(r=>({name:r.label||r.url,icon:'🌐',kind:'url',url:r.url,detail:r.url}));
if(currentFolder==='Downloads')return pickedFiles.map(f=>({name:f.name,icon:f.type.startsWith('image/')?'🖼️':'📄',kind:'picked-file',file:f,detail:(f.size/1024).toFixed(1)+' KB · file được bạn chọn'}));
if(currentFolder==='Documents')return [{name:'Readme.txt',icon:'📄',kind:'readme',detail:'Hướng dẫn M-Y-O Workspace'},{name:'PC Profile.json',icon:'⚙️',kind:'config',detail:'Hồ sơ cấu hình đã lưu'},{name:'Ghi chú.txt',icon:'📝',kind:'note',detail:'Ghi chú lưu cục bộ'}];
if(currentFolder==='Desktop')return [{name:'Google Chrome',icon:'🌐',kind:'app',target:'chrome',detail:'Mở Chrome Workspace'},{name:'Game Hub',icon:'🎮',kind:'app',target:'games',detail:'Thư viện PC'},{name:'Cài đặt',icon:'⚙️',kind:'app',target:'settings',detail:'Cấu hình PC'}];
return [];
}
async function refresh(e){
const grid=e.querySelector('#explorerFiles'),crumb=e.querySelector('#explorerBreadcrumb'),info=e.querySelector('#explorerInfo');if(!grid)return;
setFolderButtons(e);
if(currentHandle){
const path=handleStack.map(h=>h.name).join(' / ');
crumb.textContent=(rootHandle?.name||'Thư mục thật')+' / '+path;
const items=[];
try{for await(const [name,handle] of currentHandle.entries()){let size='Thư mục thật';if(handle.kind==='file'){try{const f=await handle.getFile();size=(f.size/1024).toFixed(1)+' KB'}catch{size='Tệp thật'}}items.push({name,icon:handle.kind==='directory'?'📁':'📄',kind:handle.kind==='directory'?'real-folder':'real-file',handle,detail:size})}}catch(err){msg(e,'Không liệt kê được thư mục: '+err.message)}
items.sort((a,b)=>a.kind===b.kind?a.name.localeCompare(b.name):a.kind==='real-folder'?-1:1);
grid.innerHTML=(handleStack.length?'<button class="file-card" type="button" data-explorer-action="parent"><span class="file-icon">↩️</span><strong>Thư mục cha</strong><small>Quay lại</small></button>':'')+items.map(item=>'<button class="file-card" type="button" data-real-kind="'+item.kind+'" data-real-name="'+esc(item.name)+'"><span class="file-icon">'+item.icon+'</span><strong>'+esc(item.name)+'</strong><small>'+esc(item.detail)+'</small></button>').join('');
info.textContent='Đã cấp quyền duyệt thư mục thật: '+rootHandle.name+'. Có thể đọc tệp trong phạm vi quyền bạn đã cấp; việc ghi tệp yêu cầu thao tác rõ ràng.';
}else{
crumb.textContent=currentFolder;
const items=virtualItems();
grid.innerHTML=items.map((item,i)=>'<button class="file-card" type="button" data-virtual-index="'+i+'"><span class="file-icon">'+(item.icon||'📂')+'</span><strong>'+esc(item.name)+'</strong><small>'+esc(item.detail||'')+'</small></button>').join('');
info.textContent='Các mục hiện tại là thư mục/mục ứng dụng. Để xem tệp trên PC thật, nhấn “Chọn thư mục thật” và tự cấp quyền.';
}
}
async function chooseFolder(e){
if(!window.showDirectoryPicker){msg(e,'Trình duyệt này không hỗ trợ chọn thư mục. Dùng “Chọn tệp thật” để mở file rời.');return}
try{const h=await window.showDirectoryPicker({mode:'readwrite'});rootHandle=h;currentHandle=h;handleStack=[h];currentFolder='Real files';await refresh(e);msg(e,'Đã kết nối thư mục thật: '+h.name)}catch(err){if(err.name!=='AbortError')msg(e,'Không mở được thư mục: '+err.message)}
}
async function openHandleFile(e,name){
try{const h=await currentHandle.getFileHandle(name);const f=await h.getFile();if(f.size>2*1024*1024){msg(e,'Tệp lớn hơn 2 MB. Đã đọc metadata, không hiển thị nội dung vào cửa sổ.');return}const text=await f.text();const ext=name.split('.').pop().toLowerCase();if(['txt','md','json','csv','log','html','css','js','xml','yml','yaml'].includes(ext)){if(window.MYOPC){window.MYOPC.setOpenFile({name,text,handle:h});window.MYOPC.open('notepad')}else msg(e,'Không thể mở Notepad.')}else if(f.type.startsWith('image/')){showPreview(e,name,'Tệp ảnh thật đã được đọc: '+f.type+', '+Math.round(f.size/1024)+' KB.');}else msg(e,'Đã chọn tệp thật '+name+' ('+f.size+' bytes). Loại này không được mở bên trong trình duyệt.')}catch(err){msg(e,'Không đọc được tệp: '+err.message)}
}
function showPreview(e,title,text){let p=e.querySelector('#explorerPreview');if(!p){p=document.createElement('div');p.id='explorerPreview';p.className='config-banner';e.querySelector('.explorer-main')?.appendChild(p)}p.textContent=title+': '+text}
async function createFile(e){
if(!currentHandle||!rootHandle){msg(e,'Trước tiên hãy chọn một thư mục thật có quyền ghi.');return}
let name=prompt('Tên tệp mới (ví dụ: ghi-chu.txt):','ghi-chu.txt');if(!name)return;name=name.trim().replace(/[\\/:*?"<>|]/g,'-');if(!name){msg(e,'Tên tệp không hợp lệ.');return}
try{const h=await currentHandle.getFileHandle(name,{create:true});const w=await h.createWritable();await w.write('Tệp được tạo từ M-Y-O PC Workspace.\nThời gian: '+new Date().toLocaleString('vi-VN')+'\n');await w.close();await refresh(e);msg(e,'Đã tạo tệp thật '+name+' trong thư mục bạn đã chọn.')}catch(err){msg(e,'Không tạo được tệp: '+err.message)}
}
async function openFallback(e){const input=e.querySelector('#explorerFileInput');input.value='';input.onchange=async()=>{pickedFiles=Array.from(input.files||[]);currentFolder='Downloads';await refresh(e);msg(e,'Đã đọc danh sách '+pickedFiles.length+' tệp bạn chọn. Nội dung chỉ được đọc khi bạn mở tệp.');};input.click()}
async function openPickedFile(e,file){if(file.size>2*1024*1024){msg(e,'Tệp lớn hơn 2 MB; chỉ hiển thị tên và kích thước để tránh làm treo trình duyệt.');return}if(file.type.startsWith('text/')||/\.(txt|md|json|csv|log|js|css|html|xml|yml|yaml)$/i.test(file.name)){const text=await file.text();window.MYOPC?.setOpenFile({name:file.name,text});window.MYOPC?.open('notepad')}else{msg(e,'Đã chọn tệp '+file.name+'. Chỉ các loại văn bản phổ biến được mở trong Notepad.');}}
function bind(e){
e.addEventListener('click',async ev=>{
const folder=ev.target.closest('[data-explorer-folder]');
if(folder){currentFolder=folder.dataset.explorerFolder;if(rootHandle&&currentFolder!=='Real files'){rootHandle=null;currentHandle=null;handleStack=[]}await refresh(e);return}
const action=ev.target.closest('[data-explorer-action]');
if(action){switch(action.dataset.explorerAction){case'choose-folder':await chooseFolder(e);return;case'choose-files':await openFallback(e);return;case'new-file':await createFile(e);return;case'refresh':await refresh(e);return;case'parent':if(handleStack.length>1){handleStack.pop();currentHandle=handleStack[handleStack.length-1];await refresh(e)}else msg(e,'Đã ở thư mục gốc đã cấp quyền.');return}}
const real=ev.target.closest('[data-real-kind]');
if(real){const name=real.dataset.realName;if(real.dataset.realKind==='real-folder'){try{currentHandle=await currentHandle.getDirectoryHandle(name);handleStack.push(currentHandle);await refresh(e)}catch(err){msg(e,'Không mở được thư mục: '+err.message)}}else if(real.dataset.realKind==='real-file'){await openHandleFile(e,name)}return}
const virtual=ev.target.closest('[data-virtual-index]');
if(virtual){const item=virtualItems()[Number(virtual.dataset.virtualIndex)];if(!item)return;switch(item.kind){case'folder':currentFolder=item.target;break;case'game':window.MYOPCBrowser?.openUrl(item.game.source,item.game.name);break;case'url':window.MYOPCBrowser?.openUrl(item.url,item.name);break;case'app':window.MYOPC?.open(item.target);break;case'config':if(window.MYOPC){const c=window.MYOPC.getConfig();showPreview(e,'PC Profile.json',JSON.stringify(c,null,2))}break;case'note':case'readme':window.MYOPC?.setOpenFile({name:item.name,text:item.kind==='readme'?'M-Y-O PC Workspace\nỨng dụng web tương tác.':(window.MYOPCStorage?.getNotes()?.text||'')});window.MYOPC?.open('notepad');return;case'picked-file':await openPickedFile(e,item.file);return;case'info':showPreview(e,'Downloads','Tệp sẽ chỉ hiện sau khi bạn chọn qua hộp thoại.');return;case'action':await chooseFolder(e);return}await refresh(e)}
});
e.querySelector('#explorerFileInput')?.addEventListener('change',()=>{});
refresh(e);
}
window.MYOPCExplorer={bind,reset(){rootHandle=null;currentHandle=null;handleStack=[];currentFolder='This PC'},saveToCurrent:async function(name,text){if(!currentHandle)throw new Error('Chưa chọn thư mục thật');const h=await currentHandle.getFileHandle(name,{create:true});const w=await h.createWritable();await w.write(text);await w.close();return h}};
window.MYOPCExplorer.getCurrentFolder=()=>currentFolder;
})();