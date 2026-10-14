// Isolate target scanning from damage, spawn waves, terrain/pathfinding and attack windups.
const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const { createHarness } = require('./test-support/harness.cjs');
const path=require('node:path');
const root=process.argv[2]?path.resolve(process.argv[2]):undefined;
const results = [];
for (const count of [80, 160, 320, 640]) {
  const times = [];
  let visits;
  for (let sample = 0; sample < 3; sample++) {
    const h = createHarness({ root,transform: (name, source) => {
      if (name !== 'play.js') return source;
      const match=source.includes('const consider=t=>{')?'const consider=t=>{':'let best=Infinity;for(const t of units){';
      assert.equal(source.split(match).length-1,1);
      return source.replace(match,match+'globalThis.candidateVisits++;');
    } });
    h.run(`units=[];selected=null;nextWave=Infinity;obstacles=[];buildNav();globalThis.candidateVisits=0;
      for(let i=0;i<${count};i++){const u=add({x:1000+(i%20)*30,y:1000+Math.floor(i/20)*30,
        team:i%2,kind:'minion',hp:1000000,damage:0,range:5000,radius:13,speed:0,lane:1});u.cd=1000;}`);
    const start = performance.now();
    h.run('for(let i=0;i<100;i++)update(.02);');
    times.push(performance.now()-start);
    visits = h.run('candidateVisits');
    assert.ok(visits>0&&visits<=100*count*count);
  }
  results.push({units:count,updates:100,candidateVisits:visits,timesMs:times,
    medianMs:[...times].sort((a,b)=>a-b)[1]});
}
console.log(JSON.stringify({results,note:'Instrumented candidate visits for the selected prototype (optional directory argument). Timings include the counter and Node VM overhead; use this for scaling assessment, not browser FPS.'},null,2));
