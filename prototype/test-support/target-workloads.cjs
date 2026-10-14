const workloads={
 typical:{setup:'selected=null;',steps:2000,dt:.02},
 reinforcedLanes:{setup:`selected=null;for(let i=0;i<12;i++)spawnWave();let n=0;
  for(const u of units)if(u.kind==='minion'||u.kind==='siege'){
   const p=walkablePoint(pointOnLane(u.lane,.15+(n++%29)/29*.7),u.radius*.8);u.x=p.x;u.y=p.y;
  }`,steps:1000,dt:.02},
 dispersedHigh:{setup:`selected=null;nextWave=Infinity;
  for(let i=0;i<640;i++){const p=walkablePoint({x:150+(i%20)*150,y:100+Math.floor(i/20)*95},11);
   add({...p,team:i%2,kind:'minion',hp:1000,damage:12,range:i%2?240:46,radius:13,speed:112,lane:i%3});
  }`,steps:500,dt:.02},
 coincidentHigh:{setup:`selected=null;nextWave=Infinity;obstacles=[];buildNav();
  for(let i=0;i<640;i++)add({x:1600,y:1600,team:i%2,kind:'minion',hp:500,damage:12,range:240,radius:13,speed:112,lane:i%3});`,steps:250,dt:.02},
 playableFrames:{setup:'',steps:250,dt:.02,frame:true},
};
module.exports={workloads};
