/* Current section and a session-only record of side trails visited. */
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
var walk=document.getElementById('trailWalk');if(!walk)return;
var stops=Array.prototype.slice.call(document.querySelectorAll('[data-trail-stop]'));
var position=document.getElementById('trailPosition');
var pending=false,current='';
var motion=window.matchMedia('(prefers-reduced-motion: reduce)');
function update(){
 pending=false;
 var reading=window.innerHeight*.4,active=stops[0];
 stops.forEach(function(stop){if(stop.getBoundingClientRect().top<=reading)active=stop});
 if(active.id!==current){current=active.id;position.textContent='You are here: '+active.dataset.trailStop}
 if(!motion.matches){var hero=document.getElementById('trailhead');var drift=Math.max(0,Math.min(35,-hero.getBoundingClientRect().top*.055));hero.style.setProperty('--landscape-drift',drift+'px')}
}
function schedule(){if(!pending){pending=true;requestAnimationFrame(update)}}
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',schedule);
window.addEventListener('pageshow',function(){renderVisited();update()});
if(motion.addEventListener)motion.addEventListener('change',function(){if(motion.matches)document.getElementById('trailhead').style.removeProperty('--landscape-drift');update()});
if(window.ResizeObserver)new ResizeObserver(schedule).observe(walk);
if(document.fonts)document.fonts.ready.then(update);
update();
})();
