import test from 'node:test';
import assert from 'node:assert/strict';
import {applyBushStroke,validateBushes} from './bushes.mjs';
const doc=()=>({width:1000,height:1000,pairing:true,bushes:[]});
test('continuous brush interpolates and pairs without mutating source',()=>{
 const source=doc(),d=applyBushStroke(source,{points:[[100,100],[200,100]],radius:10});assert.equal(source.bushes.length,0);assert.ok(d.bushes.length>40);
 for(const s of d.bushes)assert.ok(d.bushes.some(p=>Math.abs(p.x-(1000-s.x))<.0011&&Math.abs(p.y-(1000-s.y))<.0011));
 const top=d.bushes.filter(s=>s.y===100);for(let i=1;i<top.length;i++)assert.ok(top[i].x-top[i-1].x<=4.501);
 assert.equal(applyBushStroke(d,{points:[[100,100],[200,100]],radius:10}).bushes.length,d.bushes.length);
});
test('center brush deduplicates, off paints and erases only the chosen side',()=>{
 assert.equal(applyBushStroke(doc(),{points:[[500,500]],radius:15}).bushes.length,1);
 let d=applyBushStroke(doc(),{points:[[100,100]],radius:15});assert.equal(d.bushes.length,2);
 d=applyBushStroke(d,{points:[[100,100]],radius:1,erase:true,pairing:false});assert.equal(d.bushes.length,1);assert.equal(d.bushes[0].x,900);
 d=applyBushStroke(d,{points:[[100,100]],radius:1,erase:true});assert.equal(d.bushes.length,0);
});
test('eraser intersects disk edge and removes imported reference stamps',()=>{
 const d={...doc(),bushes:[{id:'reference',x:100,y:100,r:4}]};
 assert.equal(applyBushStroke(d,{points:[[108,100]],radius:4,erase:true}).bushes.length,0);
 assert.equal(applyBushStroke(d,{points:[[108.01,100]],radius:4,erase:true}).bushes.length,1);
});
test('stroke limits and malformed imported masks reject atomically',()=>{
 const d=doc();for(const options of [{points:[[NaN,0]],radius:5},{points:[[1001,0]],radius:5},{points:[[0,0]],radius:101}])assert.throws(()=>applyBushStroke(d,options));
 for(const stamps of [[{id:'bad',x:1,y:1,r:0}],[{id:'bad',x:1,y:1,r:3,pairId:'x'}],Array(10001).fill({id:'x',x:1,y:1,r:3})])assert.throws(()=>validateBushes(stamps,1000,1000));
 const full={...doc(),bushes:Array.from({length:10000},(_,i)=>({id:`s${i}`,x:i%100,y:Math.floor(i/100),r:1}))};
 assert.throws(()=>applyBushStroke(full,{points:[[800,800]],radius:4}),/10000/);assert.equal(full.bushes.length,10000);
});
test('half-step decimal source quantizes once and preserves exact rotated mates',()=>{
 for(const [width,height] of [[1000,1000],[1000.1234,777.5678],[1000.0002,777.0002]]) {
   const base={width,height,pairing:true,bushes:[]};
   for(const point of [[100.0005,200.0005],[0.0005,0.0005],[width,height],[Math.floor(width/2),Math.floor(height/2)],[width/2,height/2]]) {
     const d=applyBushStroke(base,{points:[point],radius:4});
     for(const s of d.bushes)assert.ok(d.bushes.some(p=>Math.abs(p.x-(width-s.x))<=1e-9&&Math.abs(p.y-(height-s.y))<=1e-9));
     validateBushes(d.bushes,width,height);
   }
   assert.equal(applyBushStroke(base,{points:[[width/2,height/2]],radius:4}).bushes.length,1);
 }
});
