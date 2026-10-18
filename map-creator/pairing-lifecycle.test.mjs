import test from 'node:test';
import assert from 'node:assert/strict';
import {createDocument,addEntity,moveEntity,rotateEntity,deleteEntity,setPairing,validateDocument,footprintFor,pairedFootprintsOverlap} from './model.mjs';
const ordinary=['castle','tower','city','gate','shop','camp'];
const seed=(kind='tower',team='red')=>addEntity(createDocument(),{kind,team,x:130,y:270,angle:35});
for(const kind of ordinary) for(const team of ['red','blue']) for(const which of [0,1]) {
  test(`${kind}/${team}: move and delete partner ${which}`,()=>{
    const original=seed(kind,team),snapshot=JSON.stringify(original),target=original.entities[which],partner=original.entities[1-which];
    const moved=moveEntity(original,target.id,221,413);
    assert.deepEqual(moved.entities.find(e=>e.id===partner.id),{...partner,x:779,y:587});
    assert.equal(moved.entities.length,2);assert.equal(deleteEntity(moved,target.id).entities.length,0);
    assert.equal(JSON.stringify(original),snapshot);
  });
}
for(const kind of ['shop','camp']) test(`neutral ${kind} stays independent through edits`,()=>{
  let d=seed();d=addEntity(d,{kind,team:'neutral',x:500,y:500,angle:90});
  const neutral=d.entities[2],ordinaryBefore=structuredClone(d.entities.slice(0,2));
  d=rotateEntity(moveEntity(d,neutral.id,390,210),neutral.id,270);
  assert.deepEqual(d.entities.slice(0,2),ordinaryBefore);assert.equal(d.entities[2].pairId,undefined);
  assert.deepEqual(deleteEntity(d,neutral.id).entities,ordinaryBefore);
});
test('toggle without edit retains links; every disabled edit detaches exactly once',()=>{
  const d=seed(),[a,b]=d.entities;
  const toggled=setPairing(setPairing(d,false),true);assert.deepEqual(toggled,d);
  assert.equal(moveEntity(toggled,a.id,100,200).entities.find(e=>e.id===b.id).x,900);
  for(const transform of [off=>moveEntity(off,a.id,200,300),off=>rotateEntity(off,a.id,80),off=>deleteEntity(off,a.id)]) {
    let detached=transform(setPairing(d,false));assert.ok(detached.entities.every(e=>!e.pairId));
    detached=setPairing(detached,true);assert.ok(detached.entities.every(e=>!e.pairId));
    assert.equal(detached.entities.find(e=>e.id===b.id).x,b.x);
  }
});
test('directional gate local footprint transforms by half-turn',()=>{
  let d=seed('gate');const a=d.entities[0];d=rotateEntity(d,a.id,120);const [red,blue]=d.entities;
  const world=(e,[x,y])=>{const t=e.angle*Math.PI/180;return [e.x+x*Math.cos(t)-y*Math.sin(t),e.y+x*Math.sin(t)+y*Math.cos(t)];};
  for(const point of [[-30,-8],[30,-8],[30,8],[-30,8],[40,0]]) {
    const p=world(red,point),q=world(blue,point);assert.ok(Math.abs(q[0]-(d.width-p[0]))<1e-7);assert.ok(Math.abs(q[1]-(d.height-p[1]))<1e-7);
  }
});
test('imports reject malformed reciprocal graphs and forbidden boss links',()=>{
  const bad=fn=>{const d=seed();fn(d);assert.throws(()=>validateDocument(d));};
  bad(d=>delete d.entities[1].pairId);bad(d=>d.entities[0].pairId=d.entities[0].id);
  bad(d=>d.entities[1].kind='gate');bad(d=>d.entities[1].team='neutral');
  for(const boss of ['dragex','moana']) bad(d=>d.entities.forEach(e=>e.kind=boss));
  bad(d=>{const third={...d.entities[0],id:'third',pairId:d.entities[0].id};d.entities[1].pairId=third.id;d.entities.push(third);});
  bad(d=>d.entities[1].angle=36);bad(d=>d.entities[1].x=130);
});
test('ordinary pair operations never copy move rotate or delete unique bosses',()=>{
  let d=seed('gate');for(const kind of ['dragex','moana']) d=addEntity(d,{kind,team:'red',x:350,y:460,angle:72});
  const bosses=structuredClone(d.entities.slice(2)),[a,b]=d.entities;
  d=moveEntity(d,a.id,10,20);d=rotateEntity(d,b.id,245);d=setPairing(d,false);d=moveEntity(d,b.id,600,800);d=setPairing(d,true);d=deleteEntity(d,a.id);
  assert.deepEqual(d.entities.filter(e=>['dragex','moana'].includes(e.kind)),bosses);
});
test('immutable snapshots restore undo redo IDs links geometry and boss state',()=>{
  const history=[seed('castle')],future=[];
  const commit=d=>history.push(d);const initial=JSON.stringify(history[0]);
  commit(addEntity(history.at(-1),{kind:'moana',team:'neutral',x:500,y:500}));
  commit(moveEntity(history.at(-1),history.at(-1).entities[1].id,700,600));
  commit(deleteEntity(history.at(-1),history.at(-1).entities[0].id));
  const final=JSON.stringify(history.at(-1));while(history.length>1) future.push(history.pop());
  assert.equal(JSON.stringify(history[0]),initial);while(future.length) history.push(future.pop());
  assert.equal(JSON.stringify(history.at(-1)),final);history.forEach(validateDocument);
});
test('near-center gate footprint collision rejects while distant axis placements pass',()=>{
  assert.deepEqual(footprintFor('gate'),{width:48,height:36});
  const make=(x,y,angle=0)=>addEntity(createDocument(),{kind:'gate',team:'red',x,y,angle});
  assert.throws(()=>make(499,500),/footprints overlap/);
  assert.throws(()=>make(500,500),/footprints overlap/);
  assert.throws(()=>make(476.001,500),/footprints overlap/);
  assert.equal(make(476,500).entities.length,2); // local X separation = 48: touching accepted
  assert.throws(()=>make(500,482.001),/footprints overlap/);
  assert.equal(make(500,482).entities.length,2); // local Y separation = 36
  assert.equal(make(500,100).entities.length,2);
  assert.equal(make(100,500).entities.length,2);
  assert.equal(make(482,500,90).entities.length,2); // width/height swapped in world coordinates
  assert.throws(()=>make(482.001,500,90),/footprints overlap/);
  assert.equal(make(500,476,90).entities.length,2);
  assert.throws(()=>make(500,476.001,90),/footprints overlap/);
});
test('oriented gate footprint thresholds hold at 360 sampled angles',()=>{
  const make=(angle,lx,ly)=>{
    const r=angle*Math.PI/180,dx=lx*Math.cos(r)-ly*Math.sin(r),dy=lx*Math.sin(r)+ly*Math.cos(r);
    return addEntity(createDocument(),{kind:'gate',team:'red',x:500-dx/2,y:500-dy/2,angle});
  };
  for(let angle=0;angle<360;angle++) {
    assert.throws(()=>make(angle,47.99,35.99),/footprints overlap/);
    for(const [x,y] of [[48,0],[0,36],[48,36],[-48,0],[0,-36],[49,35],[47,37]]) {
      const d=make(angle,x,y);assert.equal(pairedFootprintsOverlap(...d.entities),false);
      assert.deepEqual(validateDocument(JSON.parse(JSON.stringify(d))),d);
    }
  }
});
test('imported overlapping pair rejected; disabled independent structures can overlap',()=>{
  const d=seed('gate');d.entities[0].x=499;d.entities[0].y=500;d.entities[1].x=501;d.entities[1].y=500;
  assert.throws(()=>validateDocument(d),/footprints overlap/);
  d.pairing=false;assert.throws(()=>validateDocument(d),/footprints overlap/); // retained links must remain valid
  let independent=setPairing(seed('gate'),false);const [a,b]=independent.entities;
  independent=moveEntity(independent,a.id,500,500);independent=moveEntity(independent,b.id,500,500);
  assert.ok(independent.entities.every(e=>!e.pairId));
  independent=setPairing(independent,true);assert.equal(independent.entities.length,2);
  assert.ok(independent.entities.every(e=>!e.pairId));validateDocument(independent);
});
