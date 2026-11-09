/* Gentle trail progress and a session-only record of side trails visited. */
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
var guideLinks=Array.prototype.slice.call(document.querySelectorAll('.trail-guide a'));
var position=document.getElementById('trailPosition');
var track=document.getElementById('trailTrack'),edge=document.getElementById('trailTrackEdge'),dashes=document.getElementById('trailTrackDashes'),walker=document.getElementById('trailWalker');
var route=walk.querySelector('svg.walking-route'),length=0,pending=false,current='';
var motion=window.matchMedia('(prefers-reduced-motion: reduce)');
function drawRoute(){
 var rect=walk.getBoundingClientRect(),width=walk.clientWidth,height=walk.scrollHeight;
 var narrow=window.matchMedia('(max-width:600px)').matches;
 route.setAttribute('viewBox','0 0 '+width+' '+height);
 var points=[{x:width*.53,y:0}];
 Array.prototype.forEach.call(walk.querySelectorAll('.route-anchor'),function(anchor){var r=anchor.getBoundingClientRect();points.push({x:narrow?23:width*Number(anchor.dataset.routeX)/100,y:r.top-rect.top})});
 points.push({x:narrow?23:width*.55,y:height});
 var path='M'+points[0].x+','+points[0].y;
 for(var i=1;i<points.length;i++){var a=points[i-1],b=points[i],bend=(b.y-a.y)*.5;path+=' C'+a.x+','+(a.y+bend)+' '+b.x+','+(b.y-bend)+' '+b.x+','+b.y}
 [track,edge,dashes].forEach(function(p){p.setAttribute('d',path)});
 length=track.getTotalLength();update();
}
function update(){
 pending=false;
 var reading=window.innerHeight*.4,active=stops[0];
 stops.forEach(function(stop){if(stop.getBoundingClientRect().top<=reading)active=stop});
 if(active.id!==current){current=active.id;guideLinks.forEach(function(a){if(a.getAttribute('href')==='#'+current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});position.textContent='You are here: '+active.dataset.trailStop}
 var r=walk.getBoundingClientRect(),targetY=Math.max(0,Math.min(walk.scrollHeight,reading-r.top));
 if(length){var low=0,high=length;for(var n=0;n<12;n++){var middle=(low+high)/2;if(track.getPointAtLength(middle).y<targetY)low=middle;else high=middle}var point=track.getPointAtLength((low+high)/2);walker.setAttribute('cx',point.x);walker.setAttribute('cy',point.y);walker.style.display=motion.matches?'none':''}
 if(!motion.matches){var hero=document.getElementById('trailhead');var drift=Math.max(0,Math.min(35,-hero.getBoundingClientRect().top*.055));hero.style.setProperty('--landscape-drift',drift+'px')}
}
function schedule(){if(!pending){pending=true;requestAnimationFrame(update)}}
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',drawRoute);
window.addEventListener('pageshow',function(){renderVisited();drawRoute()});
if(motion.addEventListener)motion.addEventListener('change',function(){if(motion.matches)document.getElementById('trailhead').style.removeProperty('--landscape-drift');update()});
if(window.ResizeObserver)new ResizeObserver(drawRoute).observe(walk);
if(document.fonts)document.fonts.ready.then(drawRoute);
drawRoute();
})();
