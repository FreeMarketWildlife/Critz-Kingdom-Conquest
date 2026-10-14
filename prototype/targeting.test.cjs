const assert=require('node:assert/strict'),test=require('node:test'),fs=require('node:fs');
const {createHarness}=require('./test-support/harness.cjs');
const {createReference,snapshotSource}=require('./test-support/reference.cjs');
const reference=createReference();
test.after(()=>reference.close());
const old=fs.readFileSync(reference.root+'/play.js','utf8');
const prefix="if(!target&&u.team!==2&&(!player||u.order?.attack)){";
const start=old.indexOf(prefix),end=old.indexOf('\n  if(target)',start);
assert.ok(start>=0&&end>start);
const oracle=old.slice(start+prefix.length,end).slice(0,-1);
function pair(seed,setup){
 const before=createHarness({root:reference.root,seed}),after=createHarness({seed});
 for(const h of [before,after]){h.run(snapshotSource);h.run(setup)}
 return {before,after};
}
function equalState(p,label){
 assert.equal(p.after.run('snapshotBattle()'),p.before.run('snapshotBattle()'),label);
 assert.deepEqual(p.after.randomState(),p.before.randomState(),label+' RNG stream');
}

test('100 seeded layouts preserve target choice with shuffled ordering and cell/range boundaries',()=>{
 const h=createHarness({seed:42});h.run(`globalThis.referenceTarget=u=>{let target=null;${oracle};return target};`);
 const result=h.run(`(()=>{let queries=0;
  for(let layout=0;layout<100;layout++){
   units=[];for(let i=0;i<200;i++){
    const kind=['hero','minion','siege','tower','castle','camp'][i%6];
    const x=i%7===0?Math.floor(rand(0,17))*200+[-.000001,0,.000001][i%3]:rand(-100,3300);
    const y=i%9===0?Math.floor(rand(0,17))*200:rand(-100,3300);
    add({x,y,kind,kit:i%5,team:i%3,hp:i%11===0?0:500,radius:i%2?13:70,range:[0,100,370,500][i%4]});
   }
   // Shuffle array order independently of IDs to expose accidental ID-based ties.
   for(let i=units.length-1;i>0;i--){const j=Math.floor(rand(0,i+1));[units[i],units[j]]=[units[j],units[i]]}
   prepareTargeting();
   for(const u of units)if(u.team!==2){u.aggro=units[(u.id+31)%units.length];queries++;
    if(chooseEnemyTarget(u)!==referenceTarget(u))return {queries,layout,failed:true};}
  }
  return {queries,failed:false};
 })()`);
 assert.equal(result.failed,false,JSON.stringify(result));assert.ok(result.queries>13000);
});

test('equal-priority ties retain array order across cells, shuffled IDs and tower aggro',()=>{
 const h=createHarness();h.run(`globalThis.referenceTarget=u=>{let target=null;${oracle};return target};`);
 assert.equal(h.run(`(()=>{
  units=[];const actor=add({x:1600,y:1600,team:0,kind:'tower',hp:1000,range:370});
  const first=add({x:1900,y:1600,team:1,kind:'hero',hp:1000});first.id=9000;actor.aggro=first;
  const second=add({x:1500,y:1600,team:1,kind:'minion',hp:1000});second.id=1;
  for(let i=0;i<130;i++)add({x:2800,y:2800,team:0,kind:'minion',hp:0});
  prepareTargeting();if(chooseEnemyTarget(actor)!==first)return false;
  [units[1],units[2]]=[units[2],units[1]];prepareTargeting();
  return chooseEnemyTarget(actor)===second&&chooseEnemyTarget(actor)===referenceTarget(actor);
 })()`),true);
});

test('neutral eligibility, hero penalties and exact detection limits match the legacy scan',()=>{
 const h=createHarness();h.run(`globalThis.referenceTarget=u=>{let target=null;${oracle};return target};`);
 assert.equal(h.run(`(()=>{
  units=[];const actor=add({x:1600,y:1600,team:0,kind:'hero',kit:0,hp:1000});
  const neutral=add({x:1600,y:1600,team:2,kind:'camp',hp:1000});
  const hero=add({x:1780,y:1600,team:1,kind:'hero',hp:1000});
  const minion=add({x:1290,y:1600,team:1,kind:'minion',hp:1000});
  for(let i=0;i<130;i++)add({x:2800,y:2800,team:0,kind:'minion',hp:0});
  prepareTargeting();if(chooseEnemyTarget(actor)!==hero)return false;
  actor.kit=4;if(chooseEnemyTarget(actor)!==neutral)return false;
  actor.kind='tower';actor.range=310;neutral.hp=0;hero.hp=0;
  if(chooseEnemyTarget(actor)!==minion)return false;
  minion.x-=.000001;relocateTarget(minion);
  return chooseEnemyTarget(actor)===null&&chooseEnemyTarget(actor)===referenceTarget(actor);
 })()`),true);
});

test('index/linear threshold transitions clear stale buckets and retain new array ordering',()=>{
 const h=createHarness();h.run(`globalThis.referenceTarget=u=>{let target=null;${oracle};return target};`);
 assert.equal(h.run(`(()=>{
  units=[];const actor=add({x:1600,y:1600,team:0,kind:'minion',hp:500});
  const first=add({x:1500,y:1600,team:1,kind:'minion',hp:500});
  const second=add({x:1700,y:1600,team:1,kind:'minion',hp:500});
  for(let i=0;i<130;i++)add({x:2800,y:2800,team:0,kind:'minion',hp:0});
  prepareTargeting();if(!targetIndexed||chooseEnemyTarget(actor)!==first)return false;
  units=[actor,second,first];prepareTargeting();
  if(targetIndexed||targetBins.some(bin=>bin.length)||chooseEnemyTarget(actor)!==second)return false;
  for(let i=0;i<130;i++)add({x:2800,y:2800,team:0,kind:'minion',hp:0});
  prepareTargeting();return targetIndexed&&chooseEnemyTarget(actor)===second&&chooseEnemyTarget(actor)===referenceTarget(actor);
 })()`),true);
});

test('later actors observe earlier respawn, recall, dash, movement and death in the same tick',()=>{
 for(const mode of ['respawn','recall','dash','move','death']){
  const setup=`selected=null;units=[];nextWave=Infinity;obstacles=[];buildNav();
   const hero=add({x:1395,y:1500,team:0,kind:'hero',kit:1,hp:900,damage:49,range:260,radius:22,
    speed:250,lane:1,bells:0,cs:0,level:1,xp:0,mana:450,maxMana:450,skills:[0,0,0,0]});
   const tower=add({x:1600,y:1500,team:1,kind:'tower',hp:2400,damage:100,range:200,radius:34});tower.cd=0;
   for(let i=0;i<130;i++)add({x:2900,y:2900,team:0,kind:'minion',hp:0,radius:13});
   ${mode==='respawn'?"hero.hp=0;hero.respawn=.005;Object.assign(hero,{x:3000,y:3000});Object.assign(tower,{x:500,y:2770,range:370});":''}
   ${mode==='recall'?"hero.recall=.005;Object.assign(hero,{x:3000,y:3000});Object.assign(tower,{x:500,y:2770,range:370});":''}
   ${mode==='dash'?"hero.dash={x:1,y:0,left:40};":''}
   ${mode==='move'?"selected=hero;hero.order={point:{x:1450,y:1500}};hero.navTimer=0;":''}
   ${mode==='death'?"const killer=add({x:hero.x,y:hero.y,team:1,kind:'minion',hp:200,damage:10000,range:50,radius:13,speed:0,lane:1});killer.pending={time:.005,target:hero};units.unshift(units.pop());":''}`;
  const p=pair(314159,setup);
  for(const h of [p.before,p.after])h.run('update(.04);');equalState(p,mode);
 }
});

test('six seeded sustained simulations have identical complete public state and RNG streams',()=>{
 for(const seed of [1,7,42,314159,999123,4294967295]){
  const p=pair(seed,'selected=null;');
  for(let interval=0;interval<20;interval++){
   for(const h of [p.before,p.after])h.run('for(let i=0;i<100;i++)update(.02);');
   equalState(p,`seed ${seed}, step ${(interval+1)*100}`);
  }
 }
});

test('adversarial coincident, crowded, dispersed and boundary populations stay equivalent',()=>{
 for(const density of ['coincident','crowded','dispersed','boundaries']){
  const setup=`selected=null;nextWave=Infinity;obstacles=[];buildNav();
   for(let i=0;i<640;i++){
    const x=${density==='coincident'?'1600':density==='crowded'?'1500+(i%20)*10':density==='dispersed'?'150+(i%20)*150':'200+(i%16)*200+[-.000001,0,.000001][i%3]'};
    const y=${density==='coincident'?'1600':density==='crowded'?'1500+Math.floor(i/20)*10':density==='dispersed'?'100+Math.floor(i/20)*95':'200+Math.floor(i/40)*200'};
    add({x,y,team:i%2,kind:i%8===0?'siege':'minion',hp:500,damage:12,range:i%2?240:46,radius:13,speed:112,lane:i%3});
   }`;
  const p=pair(271828,setup);
  for(let interval=0;interval<5;interval++){
   for(const h of [p.before,p.after])h.run('for(let i=0;i<10;i++)update(.02);');equalState(p,density+' step '+interval);
  }
 }
});
