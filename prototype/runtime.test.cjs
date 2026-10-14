const assert = require('node:assert/strict');
const test = require('node:test');
const { createHarness } = require('./test-support/harness.cjs');

test('experience cannot revive a dead nearby Conqueror', () => {
  const h = createHarness();
  const result = h.run(`(() => {
    const dead=units.find(u=>u.kind==='hero'&&u.team===0&&u!==selected);
    Object.assign(dead,{x:selected.x,y:selected.y,xp:130});
    hurt(dead,10000,units.find(u=>u.team===1&&u.kind==='hero'));
    const minion=add({x:selected.x+40,y:selected.y,team:1,kind:'minion',hp:1,radius:13});
    hurt(minion,100,selected);
    return {hp:dead.hp,respawn:dead.respawn,xp:dead.xp};
  })()`);
  assert.equal(result.hp, 0);
  assert.equal(result.respawn, 10);
  assert.equal(result.xp, 25, "existing experience and level-up rewards are preserved");
});

test('damage cancels recall for a Conqueror after selection changes', () => {
  const h = createHarness();
  assert.equal(h.run(`(() => {
    const recalling=selected;recalling.recall=4;chooseHero(0);
    hurt(recalling,10,units.find(u=>u.team===1&&u.kind==='hero'));
    return recalling.recall;
  })()`), 0);
});

test('death clears transient movement and channel state', () => {
  const h = createHarness();
  assert.deepEqual(JSON.parse(h.run(`(() => {
    const hero=selected;hero.recall=4;hero.dash={x:1,y:0,left:100};
    hero.order={point:{x:1800,y:1600}};hero.path=[{x:1800,y:1600}];
    hurt(hero,10000,units.find(u=>u.team===1&&u.kind==='hero'));
    return JSON.stringify({recall:hero.recall,dash:hero.dash,order:hero.order,path:hero.path});
  })()`)), { recall: 0, dash: null, order: null, path: [] });
});

test('Flash cannot teleport a dead Conqueror or consume its cooldown', () => {
  const h = createHarness();
  h.run('selected.hp=0;selected.respawn=10;mouse.x=selected.x+250;mouse.y=selected.y;');
  const before = h.run('JSON.stringify([selected.x,selected.y,flashCd])');
  h.event('keydown', { code: 'KeyF' });
  assert.equal(h.run('JSON.stringify([selected.x,selected.y,flashCd])'), before);
});

test('Flash cancels a recall and attack windup when it moves the Conqueror', () => {
  const h = createHarness();
  h.run('selected.recall=4;selected.pending={time:.18,target:units[0]};mouse.x=selected.x+150;mouse.y=selected.y;');
  h.event('keydown', { code: 'KeyF' });
  assert.equal(h.run('selected.recall===0&&selected.pending===null&&flashCd===25'), true);
});

test('restart clears references and input state from the previous battle', () => {
  const h = createHarness();
  h.run('hover=selected;attackMove=true;shake=3;keys.add("ArrowLeft");init();');
  assert.equal(h.run('hover===null&&!attackMove&&shake===0&&keys.size===0'), true);
});

test('losing focus clears held movement and attack-move inputs', () => {
  const h = createHarness();
  h.run('keys.add("ArrowLeft");attackMove=true;');
  h.event('blur');
  assert.equal(h.run('keys.size===0&&!attackMove'), true);
});

test('world terrain is reused when the viewport resizes', () => {
  const h = createHarness();
  h.run('draw();globalThis.firstTerrain=terrainCache;canvas.clientWidth=900;draw();');
  assert.equal(h.run('terrainCache===firstTerrain'), true);
});

test('render culling retains tall structures near the visible edge', () => {
  const h = createHarness();
  assert.equal(h.run(`(() => {
    camera.x=1600;camera.y=1600;camera.zoom=1.1;
    const edge=camera.y+canvas.clientHeight/(camera.zoom*.83)/2;
    const roof=add({x:camera.x,y:edge+150,team:0,kind:'castle',hp:6500,radius:70});
    const far=add({x:camera.x,y:edge+220,team:0,kind:'castle',hp:6500,radius:70});
    const original=drawUnit,seen=[];drawUnit=u=>seen.push(u.id);draw();drawUnit=original;
    return seen.includes(roof.id)&&!seen.includes(far.id);
  })()`), true);
});

test('finished combat tones release their audio graph connections', () => {
  const h = createHarness();
  assert.equal(h.run(`(() => {
    let disconnected=0,oscillator;
    const param={setValueAtTime(){},exponentialRampToValueAtTime(){}};
    audio={currentTime:0,destination:{},
      createOscillator(){return oscillator={frequency:param,connect(){},start(){},stop(){},disconnect(){disconnected++}}},
      createGain(){return {gain:param,connect(){},disconnect(){disconnected++}}}};
    tone(440);oscillator.onended();return disconnected;
  })()`), 2);
});

test('collision checks match the original circle predicate, including boundaries', () => {
  const h = createHarness();
  assert.equal(h.run(`(() => {
    for(let i=0;i<10000;i++) {
      const x=rand(0,W),y=rand(0,H),r=rand(-160,100);
      const expected=x<70||y<70||x>W-70||y>H-70||
        obstacles.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+r);
      if(blocked(x,y,r)!==expected)return false;
    }
    const o=obstacles[0];
    return !blocked(o.x+o.r+22,o.y,22)&&blocked(o.x+o.r+22-.001,o.y,22);
  })()`), true);
});

test('lane interpolation and progress agree along all lane segments', () => {
  const h = createHarness();
  assert.equal(h.run(`(() => {
    for(let lane=0;lane<lanes.length;lane++)for(let i=0;i<=100;i++) {
      const progress=i/100,p=pointOnLane(lane,progress);
      if(Math.abs(nearestProgress(p,lane)-progress)>1e-12)return false;
    }
    return true;
  })()`), true);
});

test('routes remain collision free across repeated searches and a structure opening', () => {
  const h = createHarness();
  assert.equal(h.run(`(() => {
    const points=[selected,...units.filter(u=>u.team===2),...bases].map(p=>walkablePoint(p));
    for(let repeat=0;repeat<2;repeat++) {
      for(const a of points)for(const b of points) {
        const steps=route(a,b);if(!steps.length)return false;
        let previous=a;
        for(const step of steps){if(!lineClear(previous,step))return false;previous=step}
      }
      const tower=units.filter(u=>u.kind==='tower'&&u.team===1&&u.lane===1).sort((a,b)=>dist(b,bases[1])-dist(a,bases[1]))[0];
      hurt(tower,10000,selected);
    }
    return true;
  })()`), true);
});
