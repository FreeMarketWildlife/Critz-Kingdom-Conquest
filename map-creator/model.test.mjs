import test from 'node:test';
import assert from 'node:assert/strict';
import {createGeometryPair} from './geometry.mjs';
import {setFountainRadius} from './model.mjs';
import {createDocument,validateDocument,addEntity,moveEntity,rotateEntity,deleteEntity,setPairing,KINDS,pairedFootprintsOverlap} from './model.mjs';
const add=(d,kind='tower',team='red',x=120,y=270,angle=15)=>addEntity(d,{kind,team,x,y,angle});
test('reserved draft keys cannot shadow browser draft storage',()=>{
 for(const presetId of ['', '__proto__', 'constructor', 'prototype']) assert.throws(()=>validateDocument({...createDocument(),presetId}),/preset ID/);
});
test('all ordinary kinds create reciprocal team partners using 180 rotation',()=>{
  for(const kind of KINDS.filter(k=>!['dragex','moana'].includes(k))) {
    const d=add(createDocument(),kind); const [a,b]=d.entities;
    assert.equal(d.entities.length,2);assert.equal(a.pairId,b.id);assert.equal(b.pairId,a.id);
    assert.deepEqual([b.x,b.y,b.angle,b.team],[880,730,195,'blue']);
  }
});
test('blue-first creation and non-square dimensions rotate about correct center',()=>{
  const d=add(createDocument({width:900,height:700}),'gate','blue',100,220,-20);
  assert.deepEqual(d.entities.map(e=>[e.x,e.y,e.angle,e.team]),[[100,220,340,'blue'],[800,480,160,'red']]);
});
test('special bosses and neutral ordinary structures never auto-pair',()=>{
  for(const kind of KINDS) for(const team of ['red','blue','neutral']) {
    if(!['dragex','moana'].includes(kind)&&team!=='neutral') continue;
    const d=add(createDocument(),kind,team);assert.equal(d.entities.length,1);assert.equal(d.entities[0].pairId,undefined);
    assert.equal(moveEntity(d,d.entities[0].id,500,500).entities.length,1);
  }
});
test('moving either partner updates reciprocal, rotations normalize, immutable source',()=>{
  const original=add(createDocument());const old=JSON.stringify(original);const [a,b]=original.entities;
  const moved=moveEntity(original,b.id,300,400);assert.deepEqual(moved.entities.map(e=>[e.x,e.y]),[[700,600],[300,400]]);
  const rotated=rotateEntity(moved,a.id,450);assert.deepEqual(rotated.entities.map(e=>e.angle),[90,270]);
  assert.equal(JSON.stringify(original),old);assert.equal(deleteEntity(rotated,b.id).entities.length,0);
});
test('center collisions rejected transactionally, axis alignment allowed',()=>{
  const d=add(createDocument());assert.throws(()=>add(createDocument(),'tower','red',500,500),/center/);
  assert.throws(()=>moveEntity(d,d.entities[0].id,500,500),/center/);assert.equal(d.entities[0].x,120);
  assert.equal(moveEntity(d,d.entities[0].id,500,300).entities.length,2);
});
test('disabling preserves links, next single edit detaches; enabling is not retroactive',()=>{
  const d=add(createDocument());const off=setPairing(d,false);assert.equal(off.entities[0].pairId,d.entities[1].id);
  const moved=moveEntity(off,off.entities[0].id,200,300);assert.equal(moved.entities[1].x,880);assert.ok(moved.entities.every(e=>!e.pairId));
  assert.ok(setPairing(moved,true).entities.every(e=>!e.pairId));
  assert.equal(deleteEntity(off,off.entities[0].id).entities.length,1);
  assert.ok(rotateEntity(off,off.entities[0].id,90).entities.every(e=>!e.pairId));
});
test('validation rejects malformed imported documents',()=>{
  const d=add(createDocument());
  const corrupt=fn=>{const v=structuredClone(d);fn(v);assert.throws(()=>validateDocument(v));};
  corrupt(v=>v.schemaVersion=2);corrupt(v=>v.width=0);corrupt(v=>v.pairing='true');corrupt(v=>v.entities[0].x=Infinity);
  corrupt(v=>v.entities[0].x=-1);corrupt(v=>v.entities[0].angle=360);corrupt(v=>v.entities[1].id=v.entities[0].id);
  corrupt(v=>v.entities[0].pairId='missing');corrupt(v=>v.entities[1].team='red');corrupt(v=>v.entities[1].x=120);
  corrupt(v=>v.entities[0].kind='moana');corrupt(v=>v.terrain=[{bad:NaN}]);
  const copy=validateDocument(d);copy.entities[0].x=0;assert.equal(d.entities[0].x,120);
});
test('preset geometry and red seed structures survive creation and JSON roundtrip',()=>{
  const d=createDocument({id:'test',name:'Test',lanes:[[[0,0],[1000,1000]]],rivers:[],jungles:[{x:200,y:200,rx:90,ry:100}],entities:[{kind:'castle',team:'red',x:100,y:100},{kind:'dragex',team:'neutral',x:500,y:500}]});
  assert.equal(d.entities.length,3);assert.equal(d.lanes.length,1);assert.equal(d.jungles.length,1);
  assert.deepEqual(validateDocument(JSON.parse(JSON.stringify(d))),d);
});
test('repeated partner movement never creates duplicates or changes IDs',()=>{
  let d=add(createDocument());const ids=d.entities.map(e=>e.id);
  for(let i=0;i<100;i++) d=moveEntity(d,ids[i%2],i*4,i*3);
  assert.deepEqual(d.entities.map(e=>e.id),ids);assert.equal(d.entities.length,2);validateDocument(d);
});
test('geometry schema rejects malformed, oversized and out-of-bounds imports',()=>{
  for (const field of ['lanes','rivers']) for (const value of ['<script>',[[]],[[[0,0],[Infinity,1]]],[[[0,0],[1001,1]]],Array(101).fill([[0,0],[1,1]]),[Array(201).fill([0,0])]]) {
    assert.throws(()=>validateDocument({...createDocument(),[field]:value}));
  }
  for (const value of ['bad',[null],[{x:0,y:0,rx:0,ry:1}],[{x:1001,y:0,rx:1,ry:1}],[{x:0,y:0,rx:'1',ry:1}]]) assert.throws(()=>validateDocument({...createDocument(),jungles:value}));
});
test('1000 deterministic non-square rotations preserve pair invariants',()=>{
  let random=4793;const next=()=>{random=(random*1664525+1013904223)>>>0;return random/4294967296;};
  for(let i=0;i<1000;i++) {
    const w=200+next()*900,h=200+next()*700;
    const x=next()*w,y=next()*h,angle=((next()*1440-720)%360+360)%360;
    const overlaps=pairedFootprintsOverlap({kind:'gate',x,y,angle},{x:w-x,y:h-y});
    if(overlaps){assert.throws(()=>add(createDocument({width:w,height:h}),'gate',i%2?'red':'blue',x,y,angle),/footprints overlap/);continue;}
    const d=add(createDocument({width:w,height:h}),'gate',i%2?'red':'blue',x,y,angle);
    const [a,b]=d.entities;
    assert.ok(Math.abs(a.x+b.x-w)<1e-7);assert.ok(Math.abs(a.y+b.y-h)<1e-7);
    assert.ok(Math.abs(((a.angle+180)%360)-b.angle)<1e-7);assert.equal(a.pairId,b.id);assert.equal(b.pairId,a.id);
    assert.deepEqual(validateDocument(JSON.parse(JSON.stringify(d))),d);
  }
});
test('objective annotations roundtrip independently and validate bounds and labels',()=>{
  const zone={x:500,y:500,rx:75,ry:50,label:'Central shrine'};
  const d=createDocument({objectiveZones:[zone]});assert.deepEqual(d.objectiveZones,[zone]);assert.equal(d.entities.length,0);
  assert.deepEqual(validateDocument(JSON.parse(JSON.stringify(d))),d);
  const old=structuredClone(d);delete old.objectiveZones;assert.deepEqual(validateDocument(old).objectiveZones,[]);
  for(const patch of [{x:-1},{y:Infinity},{rx:0},{ry:'25'},{label:'<script>'},{label:'x'.repeat(101)}]) assert.throws(()=>validateDocument({...d,objectiveZones:[{...zone,...patch}]}));
  assert.throws(()=>validateDocument({...d,objectiveZones:Array(101).fill(zone)}));
});
test('point-symmetric geometry survives preset creation and validated JSON import',()=>{
  for(let i=0;i<5;i++) {
    const geometry=createGeometryPair({id:`lane-${i}`,type:'lane',points:[[100+i*10,900],[200,500],[400,300]],width:30+i});
    const d=createDocument({id:`new-${i}`,pointSymmetry:true,geometry,entities:[{kind:'castle',team:'red',x:100,y:900}]});
    assert.equal(d.pointSymmetry,true);assert.deepEqual(d.geometry,geometry);assert.deepEqual(validateDocument(JSON.parse(JSON.stringify(d))),d);
    geometry[0].points[0][0]=0;assert.notEqual(d.geometry[0].points[0][0],0);
  }
});
test('symmetric map validation rejects rectangular maps and asymmetric or bypass terrain',()=>{
  const geometry=createGeometryPair({id:'lane',type:'lane',points:[[100,900],[200,500]],width:38});
  const d=createDocument({pointSymmetry:true,geometry});
  assert.throws(()=>validateDocument({...d,width:900}),/square/);
  const bad=structuredClone(d);bad.geometry[0].points[0][0]+=1;assert.throws(()=>validateDocument(bad),/180-degree/);
  for(const field of ['lanes','rivers','jungles','objectiveZones','terrain']) assert.throws(()=>validateDocument({...d,[field]:[{}]}),/legacy terrain/);
  const missing=structuredClone(d);delete missing.geometry;assert.throws(()=>validateDocument(missing),/require geometry/);
  assert.throws(()=>validateDocument({...d,pointSymmetry:'true'}),/boolean/);
});
test('legacy map with no symmetry flag preserves its original terrain arrays',()=>{
  const legacy=createDocument({width:900,height:700,lanes:[[[0,0],[900,700]]],rivers:[[[0,200],[900,300]]],jungles:[{x:200,y:300,rx:80,ry:90}],terrain:[{type:'legacy',color:'green'}]});
  delete legacy.pointSymmetry;
  const imported=validateDocument(legacy);assert.equal(imported.pointSymmetry,false);
  for(const field of ['lanes','rivers','jungles','objectiveZones','terrain']) assert.deepEqual(imported[field],legacy[field]);
  assert.equal(imported.geometry,undefined);
});
test('fountain healing zones pair and metadata bush masks survive creation/import',()=>{
 const metadata={source:'reference',details:{editable:true}},palette={ground:'#123abc',bush:'#00ff00'};
 const d=createDocument({palette,referenceInfo:metadata,bushes:[{id:'mask',x:40,y:50,r:4}],entities:[{kind:'fountain',team:'red',x:100,y:900,radius:45}]});
 assert.equal(d.entities.length,2);assert.ok(d.entities.every(e=>e.radius===45&&e.healingZone));assert.deepEqual(d.palette,palette);assert.deepEqual(d.referenceInfo,metadata);
 assert.deepEqual(validateDocument(JSON.parse(JSON.stringify(d))),d);
 for(const radius of [4,151,NaN])assert.throws(()=>addEntity(d,{kind:'fountain',team:'red',x:100,y:100,radius}));
 assert.throws(()=>addEntity(d,{kind:'fountain',team:'red',x:100,y:100,healingZone:false}));
 assert.throws(()=>validateDocument({...d,palette:{ground:'red'}}));
 const bad=structuredClone(d);bad.entities[0].radius=40;assert.throws(()=>validateDocument(bad),/equal healing radius/);
});
test('reference presets preserve disabled pairing and independently positioned team fountains',()=>{
 const d=createDocument({pairing:false,entities:[{kind:'fountain',team:'red',x:85,y:905,radius:35},{kind:'fountain',team:'blue',x:920,y:100,radius:40}]});
 assert.equal(d.pairing,false);assert.equal(d.entities.length,2);assert.ok(d.entities.every(e=>!e.pairId));
 assert.deepEqual(d.entities.map(e=>[e.x,e.y,e.radius]),[[85,905,35],[920,100,40]]);
});
test('fountain radius edits are immutable paired validated and detach when pairing off',()=>{
 const d=addEntity(createDocument(),{kind:'fountain',team:'red',x:100,y:900}),[a,b]=d.entities;
 for(const radius of [5,150]){const edited=setFountainRadius(d,b.id,radius);assert.ok(edited.entities.every(e=>e.radius===radius&&e.healingZone));assert.deepEqual(validateDocument(JSON.parse(JSON.stringify(edited))),edited);}
 assert.ok(d.entities.every(e=>e.radius===35));
 for(const radius of [4,151,NaN,'50'])assert.throws(()=>setFountainRadius(d,a.id,radius));
 const single=setFountainRadius(setPairing(d,false),a.id,65);assert.ok(single.entities.every(e=>!e.pairId));assert.deepEqual(single.entities.map(e=>e.radius),[65,35]);
 assert.throws(()=>setFountainRadius(add(createDocument()),'missing',50));
 const ordinary=add(createDocument());assert.throws(()=>setFountainRadius(ordinary,ordinary.entities[0].id,50),/not a fountain/);
 assert.equal(deleteEntity(d,a.id).entities.length,0);
});
