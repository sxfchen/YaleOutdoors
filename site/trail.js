/* A session-only record of side trails visited. */
(function(){
'use strict';
var mapPages=['trips.html','gear.html','join.html','people.html','library.html','history.html'];
var visited=[];
function readVisited(){
 visited=[];
 try{var saved=JSON.parse(sessionStorage.getItem('yoTrailVisited')||'[]');if(Array.isArray(saved))visited=saved.filter(function(p){return mapPages.indexOf(p)!==-1})}catch(e){}
}
readVisited();
var page=location.pathname.split('/').pop();
if(mapPages.indexOf(page)!==-1&&visited.indexOf(page)===-1){visited.push(page);try{sessionStorage.setItem('yoTrailVisited',JSON.stringify(visited))}catch(e){}}
function renderVisited(){
 readVisited();
 Array.prototype.forEach.call(document.querySelectorAll('.map-point'),function(link){
  var seen=visited.indexOf(link.getAttribute('href'))!==-1;
  link.classList.toggle('is-visited',seen);
  if(seen)link.setAttribute('aria-label',link.querySelector('strong').textContent+' — visited this session');else link.removeAttribute('aria-label');
 });
 var key=document.querySelector('.map-visited-key');if(key)key.hidden=!visited.length;
}
renderVisited();
window.addEventListener('pageshow',renderVisited);
})();
