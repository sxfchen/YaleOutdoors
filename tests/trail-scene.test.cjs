const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const sceneAt = require('../site/trail-scene.js');

test('all four seasons have complete day and night scenes', () => {
  for (const [month, season, dawn, dusk] of [[0,'winter',7.3,16.7],[3,'spring',5.7,18.3],[6,'summer',4.7,19.3],[9,'autumn',6.3,17.7]]) {
    for (const [hour, phase] of [[0,'night'],[12,'day'],[23,'night']]) {
      const scene = sceneAt(new Date(2026, month, 15, Math.floor(hour), Math.round(hour % 1 * 60)));
      assert.deepEqual(scene, { season, phase });
      const svg = fs.readFileSync(`site/img/trail-${season}-${phase}.svg`, 'utf8');
      assert.ok(svg.includes('<svg') && svg.endsWith('</svg>'));
      if (phase === 'night') {
        assert.ok(svg.includes('M1294 120'));
        assert.ok(svg.includes('#1b2d44'));
        assert.ok(!svg.includes('M0 650h1600v400H0z'));
      }
    }
  }
});

test('season boundaries use local calendar months', () => {
  assert.equal(sceneAt(new Date(2026, 11, 1, 12)).season, 'winter');
  assert.equal(sceneAt(new Date(2026, 2, 1, 12)).season, 'spring');
  assert.equal(sceneAt(new Date(2026, 5, 1, 12)).season, 'summer');
  assert.equal(sceneAt(new Date(2026, 8, 1, 12)).season, 'autumn');
});
