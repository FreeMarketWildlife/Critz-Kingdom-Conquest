const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const { createHarness } = require('./test-support/harness.cjs');
if (!global.gc) throw Error('Run with node --expose-gc prototype/soak.cjs');
const h = createHarness();
const start = performance.now();
const samples = [];
h.run('selected=null;');
for (let minute = 0; minute <= 15; minute++) {
  if (minute) h.run('for(let i=0;i<3000;i++)update(.02);');
  global.gc();
  const state = JSON.parse(h.run(`JSON.stringify({clock,winner,units:units.length,
    projectiles:projectiles.length,skillshots:skillshots.length,effects:effects.length,
    particles:particles.length,floats:floats.length,decals:decals.length,
    finite:units.every(u=>[u.x,u.y,u.hp].every(Number.isFinite))})`));
  assert.equal(state.finite, true);
  assert.ok(state.units < 1000, 'unit population stays bounded');
  samples.push({ minute, heapMiB: process.memoryUsage().heapUsed / 1048576, ...state });
  if (state.winner !== null) break;
}
const restartHeap = [];
for (let battle = 0; battle < 20; battle++) {
  h.run('init();draw();for(let i=0;i<250;i++)update(.02);');
  global.gc();
  restartHeap.push(process.memoryUsage().heapUsed / 1048576);
}
const restartGrowthMiB = restartHeap.at(-1) - restartHeap[5];
assert.ok(restartGrowthMiB < 2, 'restart does not retain whole old battles');
console.log(JSON.stringify({ elapsedMs: performance.now() - start,
  maxRssMiB: process.resourceUsage().maxRSS / 1024,
  samples, restartHeapMiB: restartHeap, restartGrowthMiB,
  note: 'Node VM simulation with stubbed canvas; heap excludes native browser canvas/GPU memory.' }, null, 2));
