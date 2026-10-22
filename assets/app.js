(() => {
'use strict';
const games=window.MYO_GAMES||[];
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const grid=$('gameGrid'),search=$('gameSearch'),genre=$('genreFilter'),modal=$('gameModal');
function render(){
 const q=search.value.trim().toLowerCase(),g=genre.value;
 const visible=games.filter(x=>(g==='all'||x.genre===g)&&(!q||(x.name+' '+x.genre+' '+x.description+' '+x.publisher).toLowerCase().includes(q)));
 $('gameCount').textContent=visible.length+' game';
 grid.innerHTML=visible.length?visible.map(x=>'<article class="game-card"><div class="game-art" style="--art-a:'+x.tone[0]+';--art-b:'+x.tone[1]+'"><span class="game-tag">PC WINDOWS</span><span>'+x.icon+'</span></div><div class="game-body"><h3>'+esc(x.name)+'</h3><div class="game-genre">'+esc(x.genre)+'</div><p>'+esc(x.description)+'</p><button class="button button-secondary" type="button" data-game="'+x.id+'">Xem giới thiệu →</button></div></article>').join(''):'<div class="no-results">Không tìm thấy game phù hợp với bộ lọc.</div>';
}
[...new Set(games.map(g=>g.genre))].sort().forEach(g=>{const o=document.createElement('option');o.value=g;o.textContent=g;genre.appendChild(o)});
function show(id){const g=games.find(x=>x.id===id);if(!g)return;$('modalIcon').textContent=g.icon;$('modalTitle').textContent=g.name;$('modalDescription').textContent=g.description;$('modalGenre').textContent=g.genre;$('modalPublisher').textContent=g.publisher;$('modalRequirements').textContent=g.requirements;modal.hidden=false}
grid.addEventListener('click',e=>{const b=e.target.closest('[data-game]');if(b)show(b.dataset.game)});
search.addEventListener('input',render);genre.addEventListener('change',render);
$('modalClose').addEventListener('click',()=>modal.hidden=true);modal.addEventListener('click',e=>{if(e.target===modal)modal.hidden=true});document.addEventListener('keydown',e=>{if(e.key==='Escape')modal.hidden=true});
render();
})();