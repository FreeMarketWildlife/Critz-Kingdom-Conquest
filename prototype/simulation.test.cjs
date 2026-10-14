const vm=require('node:vm');
const assert=require('node:assert/strict');
const {context}=require('./test-support/harness.cjs').createHarness();
const result=vm.runInContext(`(() => {
 let checks=0;const check=(condition,label)=>{checks++;if(!condition)throw Error(label)};
 check(selected.kit===1&&camera.zoom>=1,'starts playing with close camera');
 check(units.filter(u=>u.kind==='hero').length===10,'ten conquerors');for(const objective of units.filter(u=>u.team===2)){check(route(selected,objective).length>0,'reachable jungle objective '+objective.name)}check(route(selected,bases[0]).length>0,'reachable fountain');
 check(river[0][0]<river.at(-1)[0]&&river[0][1]<river.at(-1)[1],'northwest southeast river');
 const hero=selected;const x=hero.x;command({x:x+70,y:hero.y});for(let i=0;i<35;i++)update(.02);check(hero.x>x+25,'right click movement');
 hero.order=null;hero.pending=null;const minion=add({x:hero.x+100,y:hero.y,team:1,kind:'minion',hp:40,range:40,damage:0,radius:13,speed:0,lane:1});
 const bells=hero.bells;attack(hero,minion);check(minion.hp===40,'attack windup delays damage');for(let i=0;i<100;i++)update(.01);check(minion.hp===0&&hero.cs>=1&&hero.bells>bells,'projectile last hit rewards');
 const obstacle=obstacles.find(o=>!o.structure&&!o.tree&&!o.pit);const start=walkablePoint({x:obstacle.x-obstacle.r-55,y:obstacle.y});const end=walkablePoint({x:obstacle.x+obstacle.r+55,y:obstacle.y});const path=route(start,end);check(path.length>1,'path routes around wall');let previous=start;for(const p of path){check(lineClear(previous,p),'path avoids collision');previous=p}
 Object.assign(hero,start);hero.order=null;hero.pending=null;hero.skills[2]=0;hero.mana=450;cast(hero,2,end);for(let i=0;i<20;i++)update(.02);check(!blocked(hero.x,hero.y,hero.radius*.8),'dash respects terrain');
 Object.assign(hero,walkablePoint({x:1500,y:1700}));hero.pending=null;hero.order=null;hero.skills[0]=0;hero.mana=450;const target=add({x:hero.x+120,y:hero.y,team:1,kind:'minion',hp:300,range:40,damage:0,radius:13,speed:0,lane:1});cast(hero,0,target);check(hero.skills[0]>0&&hero.mana===415,'skill cost and cooldown');const mana=hero.mana;cast(hero,0,target);check(hero.mana===mana,'cooldown prevents duplicate cast');for(let i=0;i<50;i++)update(.01);check(target.hp<300,'skillshot hits');
 const outer=units.filter(u=>u.kind==='tower'&&u.team===1&&u.lane===1).sort((a,b)=>dist(b,bases[1])-dist(a,bases[1]));const inner=outer[2];const hp=inner.hp;hurt(inner,100,hero);check(inner.hp===hp,'inner tower protected');hurt(outer[0],10000,hero);check(outer[0].hp===0,'outer tower vulnerable');
 const boss=units.find(u=>u.kind==='boss');hurt(boss,10000,hero);check(hero.buff>0,'boss buff');
 hurt(hero,10000,target);check(hero.respawn>0,'death and respawn timer');for(let i=0;i<550;i++)update(.02);check(hero.hp>0,'respawn');
 hero.recall=4;hero.order=null;for(let i=0;i<210;i++)update(.02);check(dist(hero,bases[0])<220,'recall returns to fountain');hero.recall=4;command({x:hero.x+80,y:hero.y});check(hero.recall===0,'movement cancels recall');selected=null;for(let i=0;i<2000;i++)update(.02);check(units.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.y)&&Number.isFinite(u.hp)),'simulation finite');
 draw();check(terrainCache!==null,'terrain render cache');
 const castle=units.find(u=>u.kind==='castle'&&u.team===1);hurt(castle,100000,hero);check(castle.hp>0,'castle protected until lane opened');
 for(const u of units.filter(u=>u.team===1&&u.lane===1&&u.kind==='tower').sort((a,b)=>dist(b,bases[1])-dist(a,bases[1])))hurt(u,100000,hero);
 const barracks=units.find(u=>u.kind==='barracks'&&u.team===1&&u.lane===1);hurt(barracks,100000,hero);hurt(castle,100000,hero);check(winner===0,'victory after lane cleared');
 init();check(winner===null&&clock===0&&selected.kit===1,'reset to play');
 return {checks,obstacles:obstacles.length};
})()`,context);
assert.ok(result.checks>=30);
console.log('Gameplay checks passed',result);
