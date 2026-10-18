import test from 'node:test';
import assert from 'node:assert/strict';
import {PRESETS,ARCHIVED_DIAMOND_PRESET} from './presets.mjs';
import {REFERENCE_PRESET} from './reference-layout.mjs';
const originals=PRESETS.filter(p=>p.pointSymmetry);
import {createDocument,validateDocument} from './model.mjs';
import {verifyLaneConnectivity} from './geometry.mjs';
const rotate=([x,y])=>[1000-x,1000-y];
const pointSet=points=>points.map(p=>p.join(',')).sort().join('|');
const signature=p=>JSON.stringify(p.geometry.filter(f=>f.type==='lane').map(f=>f.points));
test('exactly five square layouts: one supplied reference and four original road networks',()=>{
 assert.equal(PRESETS.length,5);assert.equal(new Set(PRESETS.map(p=>p.id)).size,5);assert.equal(new Set(PRESETS.map(signature)).size,5);
 assert.equal(PRESETS[0],REFERENCE_PRESET);assert.equal(ARCHIVED_DIAMOND_PRESET.id,'point-diamond');assert.ok(!PRESETS.includes(ARCHIVED_DIAMOND_PRESET));assert.deepEqual(originals.map(p=>p.laneCount),[3,4,2,5]);
 for(const p of originals){assert.equal(p.width,1000);assert.equal(p.height,1000);assert.equal(p.pointSymmetry,true);for(const key of ['lanes','rivers','jungles','objectiveZones','terrain'])assert.deepEqual(p[key],[]);}
});
for(const p of originals){
 test(`${p.id}: every feature independently matches a rotated point set and exact generated partner`,()=>{
  const byId=new Map(p.geometry.map(f=>[f.id,f]));
  for(const f of p.geometry){const mate=byId.get(f.pairId);assert.ok(mate);assert.equal(mate.pairId,f.id);assert.equal(mate.type,f.type);assert.equal(mate.width,f.width);assert.equal(pointSet(f.points.map(rotate)),pointSet(mate.points));
   if(f.selfSymmetric){const half=(f.points.length-1)/2;assert.deepEqual(f.points[half],[500,500]);assert.deepEqual(f.points.slice(half+1),f.points.slice(0,half).reverse().map(rotate));}
   else assert.deepEqual(mate.points,f.points.map(rotate));
   for(const [x,y] of f.points){assert.ok(Number.isFinite(x)&&Number.isFinite(y));const margin=f.type==='jungle'?0:f.width/2;assert.ok(x>=margin&&x<=1000-margin&&y>=margin&&y<=1000-margin,`${f.id}: feature stroke exceeds board`);}
  }
 });
 test(`${p.id}: all road segments form one graph connecting both castle centers`,()=>{const d=createDocument(p);validateDocument(d);const result=verifyLaneConnectivity(d);assert.equal(result.ok,true,result.errors.join('; '));assert.equal(result.components,1);});
 test(`${p.id}: green jungle polygons exist and bosses remain independent`,()=>{assert.ok(p.geometry.some(f=>f.type==='jungle'&&f.points.length>=3));const d=createDocument(p);for(const kind of ['dragex','moana']){const boss=d.entities.filter(e=>e.kind===kind);assert.equal(boss.length,1);assert.equal(boss[0].team,'neutral');assert.ok(!boss[0].pairId);}assert.equal(p.entities.filter(e=>e.kind==='castle').length,1);});
}

test('reference preserves editable asymmetrical source contours, independent fountains and healing zones',()=>{
 const p=PRESETS[0];assert.equal(p.id,'reference-attached-v1');assert.equal(p.pointSymmetry,false);assert.equal(p.pairing,false);assert.equal(p.width,1000);assert.equal(p.height,1000);
 assert.ok(p.referenceInfo.asymmetryNote);assert.deepEqual(p.referenceInfo.crop,[13,15,689,691]);assert.ok(!('backgroundImage' in p));assert.ok(!('image' in p));
 const walls=p.geometry.filter(f=>f.type==='wall');assert.ok(walls.length>40);assert.ok(walls.some(f=>f.points.length>40));
 for(const f of p.geometry){assert.ok(f.points.length>=3);for(const [x,y] of f.points)assert.ok(x>=0&&x<=1000&&y>=0&&y<=1000);assert.ok(f.fill);assert.ok(!f.pairId);}
 const bases=p.geometry.filter(f=>f.type==='base');const centroid=f=>f.points.reduce((a,v)=>[a[0]+v[0]/f.points.length,a[1]+v[1]/f.points.length],[0,0]);
 assert.ok(bases.some(f=>f.team==='blue'&&centroid(f)[0]<500&&centroid(f)[1]>500));assert.ok(bases.some(f=>f.team==='red'&&centroid(f)[0]>500&&centroid(f)[1]<500));
 const rivers=p.geometry.filter(f=>f.type==='river-region');assert.ok(rivers.some(f=>centroid(f)[0]<500&&centroid(f)[1]<500));assert.ok(rivers.some(f=>centroid(f)[0]>500&&centroid(f)[1]>500));
 assert.equal(p.palette.bush,'#22b14c');assert.ok(p.bushes.length>1000);
 const d=createDocument(p);validateDocument(d);assert.equal(d.pairing,false);assert.equal(d.geometry.length,p.geometry.length);assert.equal(d.bushes.length,p.bushes.length);
 const fountains=d.entities.filter(e=>e.kind==='fountain');assert.equal(fountains.length,2);for(const f of fountains){assert.equal(f.healingZone,true);assert.ok(!f.pairId);const source=p.entities.find(e=>e.team===f.team);assert.equal(f.x,source.x);assert.equal(f.y,source.y);}
 assert.notEqual(fountains[0].x+fountains[1].x,1000);assert.notEqual(fountains[0].y+fountains[1].y,1000);
});
