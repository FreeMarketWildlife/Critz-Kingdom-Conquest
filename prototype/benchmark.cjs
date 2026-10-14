// Deterministic CPU benchmark; DOM/canvas are stubbed, so this is not GPU/frame timing.
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { createHarness } = require('./test-support/harness.cjs');
const root = process.argv[2] ? path.resolve(process.argv[2]) : __dirname;
const samples = Number(process.env.KINGDOM_BENCH_SAMPLES || 3);
const scenarios = {
  simulation: `selected=null; for(let i=0;i<5000;i++) update(.02);`,
  navigation: `const start={x:470,y:1670},end={x:780,y:1670}; for(let i=0;i<500;i++) route(start,end);`,
  targeting: `
    selected=null; obstacles=[]; buildNav();
    for(let i=0;i<400;i++) add({x:1300+(i%20)*30,y:1300+Math.floor(i/20)*30,
      team:i%2,kind:'minion',hp:100000,damage:0,range:240,radius:13,speed:0,lane:1});
    for(let i=0;i<250;i++) update(.02);`,
};
const results = {};
for (const [name, source] of Object.entries(scenarios)) {
  const elapsed = [];
  let state;
  for (let sample = 0; sample < samples; sample++) {
    const harness = createHarness({ root });
    const start = performance.now();
    harness.run(source);
    elapsed.push(Number((performance.now() - start).toFixed(3)));
    state = JSON.parse(harness.run(`JSON.stringify({clock,waveNumber,winner,kills,
      units:units.map(u=>[u.id,u.kind,u.hp,u.x,u.y,u.bells,u.cs]),
      projectiles:projectiles.length,skillshots:skillshots.length})`));
  }
  const ordered = [...elapsed].sort((a, b) => a - b);
  results[name] = { samplesMs: elapsed, medianMs: ordered[Math.floor(ordered.length / 2)],
    units: state.units.length, simulatedSeconds: state.clock,
    stateSha256: require('node:crypto').createHash('sha256').update(JSON.stringify(state)).digest('hex') };
}
const harness = createHarness({ root });
harness.run('draw();');
const first = { ...harness.drawingCalls };
harness.run('draw();');
results.render = { warmCanvasCalls: Object.fromEntries(Object.entries(harness.drawingCalls)
  .map(([name, count]) => [name, count - (first[name] || 0)])) };
console.log(JSON.stringify({ node: process.version, platform: `${process.platform}/${process.arch}`,
  samples, maxRssMiB: Number((process.resourceUsage().maxRSS / 1024).toFixed(2)), results }, null, 2));
