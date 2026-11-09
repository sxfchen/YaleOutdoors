const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('site/trail.js', 'utf8');

function boot({ path = '/index.html', saved = '[]', storageBlocked = false, homepage = false, reduced = false } = {}) {
  const memory = { yoTrailVisited: saved }, events = {}, links = [], nodes = {};
  const stop = { id: 'clearing', dataset: { trailStop: 'The clearing' }, getBoundingClientRect: () => ({ top: 200 }) };
  const hero = { id: 'trailhead', dataset: { trailStop: 'Trailhead' }, getBoundingClientRect: () => ({ top: -800 }), style: { setProperty() {}, removeProperty() {} } };
  const pathNode = { setAttribute() {}, getTotalLength: () => 3000, getPointAtLength: length => ({ x: 100, y: length }) };
  const walker = { attributes: {}, style: {}, setAttribute(k, v) { this.attributes[k] = v; } };
  const mapLink = {
    visited: false, attributes: {}, textContent: '02GearThe gear room',
    getAttribute: () => 'gear.html', querySelector: () => ({ textContent: 'Gear' }),
    setAttribute(k, v) { this.attributes[k] = v; }, removeAttribute(k) { delete this.attributes[k]; },
    classList: { toggle(k, v) { mapLink.visited = v; } },
  };
  links.push(mapLink);
  const key = { hidden: true };
  if (homepage) {
    Object.assign(nodes, { trailTrack: pathNode, trailTrackEdge: pathNode, trailTrackDashes: pathNode, trailWalker: walker, trailPosition: {}, trailhead: hero });
    nodes.trailWalk = { clientWidth: 1000, scrollHeight: 3000, getBoundingClientRect: () => ({ top: 0 }), querySelector: () => ({ setAttribute() {} }), querySelectorAll: () => [] };
  }
  const document = {
    getElementById: id => nodes[id] || null,
    querySelector: () => key,
    querySelectorAll: selector => selector === '.map-point' ? links : selector === '[data-trail-stop]' ? [hero, stop] : [],
  };
  const context = vm.createContext({
    document, location: { pathname: path },
    sessionStorage: {
      getItem(k) { if (storageBlocked) throw new Error('blocked'); return memory[k]; },
      setItem(k, v) { if (storageBlocked) throw new Error('blocked'); memory[k] = v; },
    },
    window: { innerHeight: 800, matchMedia: q => ({ matches: q.includes('reduced-motion') && reduced, addEventListener() {} }), addEventListener(k, fn) { events[k] = fn; } },
    requestAnimationFrame: fn => fn(),
  });
  vm.runInContext(source, context);
  return { memory, mapLink, key, events, nodes, walker };
}

test('visiting a side page records it once without adding unknown pages', () => {
  const result = boot({ path: '/gear.html', saved: '["trips.html","gear.html","unknown.html"]' });
  assert.equal(result.mapLink.visited, true);
  assert.equal(result.mapLink.attributes['aria-label'], 'Gear — visited this session');
  assert.deepEqual(JSON.parse(boot({ path: '/gear.html', saved: '["trips.html"]' }).memory.yoTrailVisited), ['trips.html', 'gear.html']);
  assert.equal(boot({ path: '/constitution.html' }).memory.yoTrailVisited, '[]');
});

test('a homepage restored from browser history refreshes visited markers', () => {
  const result = boot({ homepage: true });
  assert.equal(result.mapLink.visited, false);
  result.memory.yoTrailVisited = '["gear.html"]';
  result.events.pageshow();
  assert.equal(result.mapLink.visited, true);
  assert.equal(result.key.hidden, false);
});

test('blocked storage and malformed session data leave navigation usable', () => {
  assert.doesNotThrow(() => boot({ homepage: true, storageBlocked: true }));
  assert.equal(boot({ saved: '{broken' }).mapLink.visited, false);
  assert.equal(boot({ saved: '"not an array"' }).mapLink.visited, false);
});

test('reduced motion hides the moving marker while current-stop text still updates', () => {
  const result = boot({ homepage: true, reduced: true });
  assert.equal(result.walker.style.display, 'none');
  assert.equal(result.nodes.trailPosition.textContent, 'You are here: The clearing');
});
