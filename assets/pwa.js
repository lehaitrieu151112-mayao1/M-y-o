(() => {
'use strict';
if('serviceWorker' in navigator && location.protocol==='https:'){
  window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(err=>console.warn('Offline cache unavailable:',err)));
}
})();