(() => {
'use strict';
const keys={config:'myo-pc-config-v1',profiles:'myo-pc-profiles-v1',notes:'myo-pc-notes-v1',recents:'myo-pc-recents-v1'};
const defaults={os:'Windows 11 Pro',region:'Singapore',cpu:'8',gpu:'rtx4070',ram:'16',disk:'512',resolution:'1920x1080',quality:'high',wallpaper:'default'};
function get(key,fallback){try{const v=localStorage.getItem(key);return v===null?fallback:JSON.parse(v)}catch{return fallback}}
function set(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
function getConfig(){return {...defaults,...get(keys.config,{})}}
function setConfig(cfg){return set(keys.config,{...defaults,...cfg})}
function getProfiles(){const v=get(keys.profiles,[]);return Array.isArray(v)?v:[]}
function setProfiles(v){return set(keys.profiles,Array.isArray(v)?v:[])}
function getNotes(){return get(keys.notes,{name:'Ghi chú.txt',text:'Chào mừng đến với M-Y-O PC Workspace.\n\nĐây là tệp ghi chú được lưu cục bộ trong trình duyệt.'})}
function setNotes(v){return set(keys.notes,v)}
function getRecents(){const v=get(keys.recents,[]);return Array.isArray(v)?v:[]}
function addRecent(url,label){const v=getRecents().filter(x=>x.url!==url);v.unshift({url,label,at:new Date().toISOString()});return set(keys.recents,v.slice(0,30))}
window.MYOPCStorage={defaults,keys,getConfig,setConfig,getProfiles,setProfiles,getNotes,setNotes,getRecents,addRecent};
})();