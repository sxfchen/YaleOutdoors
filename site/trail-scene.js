/* Choose a static scene once per page load using the visitor's local clock. */
(function(){
'use strict';
// MANUAL SCENE CONTROLS: leave null for the visitor's current date/time.
// Season: 'spring', 'summer', 'autumn', 'winter'
// Time: 'day', 'night'
var seasonOverride = null;
var timeOverride = null;

function sceneAt(date){
 var month=date.getMonth(),hour=date.getHours()+date.getMinutes()/60;
 var season=month<2||month===11?'winter':month<5?'spring':month<8?'summer':'autumn';
 // Approximate seasonal daylight hours for New Haven, without location access.
 var daylight=12+3*Math.cos((month-5)*Math.PI/6);
 var sunrise=12-daylight/2,sunset=12+daylight/2;
 var phase=hour<sunrise||hour>=sunset?'night':'day';
 return {season:season,phase:phase};
}
if(typeof module!=='undefined'&&module.exports){module.exports=sceneAt;return;}
var scene=sceneAt(new Date());
if(['spring','summer','autumn','winter'].indexOf(seasonOverride)!==-1)scene.season=seasonOverride;
if(['day','night'].indexOf(timeOverride)!==-1)scene.phase=timeOverride;
document.documentElement.dataset.trailPhase=scene.phase;
document.documentElement.dataset.trailSeason=scene.season;
document.documentElement.style.setProperty('--trail-scene','url("img/trail-'+scene.season+'-'+scene.phase+'-sky.svg")');
document.documentElement.style.setProperty('--trail-terrain','url("img/trail-'+scene.season+'-'+scene.phase+'-terrain.svg")');
})();
