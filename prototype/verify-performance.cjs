// Recreate the performance-only changes from the pinned original, then compare exact workloads.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'kingdom-performance-'));
const original = path.join(scratch, 'original'), optimized = path.join(scratch, 'performance-only');
fs.mkdirSync(original); fs.mkdirSync(optimized);
try {
  for (const name of ['game.js', 'play.js']) {
    const source = execFileSync('git', ['show', `7c189fb:prototype/${name}`], { cwd: __dirname });
    fs.writeFileSync(path.join(original, name), source);
    fs.writeFileSync(path.join(optimized, name), source);
  }
  let source = fs.readFileSync(path.join(optimized, 'play.js'), 'utf8');
  const replace = (before, after) => {
    assert.equal(source.split(before).length - 1, 1, `unambiguous source transformation: ${before}`);
    source = source.replace(before, after);
  };
  replace('const CELL=50,GRID=64;', `const CELL=50,GRID=64;
const navCosts=new Float32Array(GRID*GRID),navParents=new Int32Array(GRID*GRID),navClosed=new Uint8Array(GRID*GRID);
const navSteps=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const laneMetrics=lanes.map(points=>{const lengths=points.slice(1).map((v,i)=>Math.hypot(v[0]-points[i][0],v[1]-points[i][1]));return{lengths,total:lengths.reduce((a,b)=>a+b,0)}});`);
  replace("function blocked(x,y,r=22){if(x<70||y<70||x>W-70||y>H-70)return true;return obstacles.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+r)}",
    "function blocked(x,y,r=22){if(x<70||y<70||x>W-70||y>H-70)return true;for(const o of obstacles){const radius=o.r+r,dx=x-o.x,dy=y-o.y;if(radius>0&&dx*dx+dy*dy<radius*radius)return true}return false}");
  replace('const g=new Float32Array(4096).fill(Infinity),parents=new Int32Array(4096).fill(-1),closed=new Uint8Array(4096),heap=[];',
    'const g=navCosts.fill(Infinity),parents=navParents.fill(-1),closed=navClosed.fill(0),heap=[];');
  replace('for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]])', 'for(const [dx,dy] of navSteps)');
  replace('const p=lanes[l],lengths=p.slice(1).map((v,i)=>Math.hypot(v[0]-p[i][0],v[1]-p[i][1]));let d=clamp(t,0,1)*lengths.reduce((a,b)=>a+b,0);',
    'const p=lanes[l],{lengths,total}=laneMetrics[l];let d=clamp(t,0,1)*total;');
  replace('const p=lanes[l],lengths=p.slice(1).map((v,i)=>Math.hypot(v[0]-p[i][0],v[1]-p[i][1])),total=lengths.reduce((a,b)=>a+b,0);',
    'const p=lanes[l],{lengths,total}=laneMetrics[l];');
  replace('if(u.skills)u.skills=u.skills.map(v=>Math.max(0,v-dt));',
    'if(u.skills)for(let i=0;i<u.skills.length;i++)u.skills[i]=Math.max(0,u.skills[i]-dt);');
  replace('const d=dist(u,t);if(d>detection)continue;let priority=d;',
    'const dx=u.x-t.x,dy=u.y-t.y;if(dx*dx+dy*dy>detection*detection)continue;const d=dist(u,t);if(d>detection)continue;let priority=d;');
  replace('const d=dist(u,t),r=(u.radius+t.radius)*.94;if(d<r&&d>.01)',
    'const r=(u.radius+t.radius)*.94,deltaX=u.x-t.x,deltaY=u.y-t.y;if(deltaX*deltaX+deltaY*deltaY>=r*r)continue;const d=dist(u,t);if(d<r&&d>.01)');
  fs.writeFileSync(path.join(optimized, 'play.js'), source);
  const benchmark = root => JSON.parse(execFileSync(process.execPath,
    [path.join(__dirname, 'benchmark.cjs'), root], { encoding: 'utf8', maxBuffer: 1048576 }));
  const before = benchmark(original), after = benchmark(optimized);
  const comparisons = {};
  for (const name of ['simulation', 'navigation', 'targeting']) {
    const a = before.results[name], b = after.results[name];
    assert.equal(a.workloadSha256, b.workloadSha256);
    assert.equal(a.stateSha256, b.stateSha256);
    assert.equal(before.seed, after.seed);
    comparisons[name] = { beforeMs: a.medianMs, afterMs: b.medianMs,
      speedup: a.medianMs / b.medianMs, equivalentWorkloadAndState: true };
  }
  console.log(JSON.stringify({ baseCommit: '7c189fb', before, after, comparisons,
    note: 'Performance-only code is reconstructed by the explicit transformations in verify-performance.cjs; death/input/render fixes are excluded. State hashes cover the fields listed in benchmark.cjs.' }, null, 2));
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}
