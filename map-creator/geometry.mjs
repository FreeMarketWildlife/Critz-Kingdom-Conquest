/** Editable point-symmetric geometry. Pair IDs are reciprocal, independent of structure pairing. */
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const close=(a,b)=>Math.abs(a-b)<=1e-7;
const fail=m=>{throw new Error(m);};
const clone=v=>JSON.parse(JSON.stringify(v));
const rotate=(p,w,h=w)=>[w-p[0],h-p[1]];
const same=(a,b)=>close(a[0],b[0])&&close(a[1],b[1]);
let serial=0;
export const isRegionType=type=>['jungle','ground','wall','river-region','base','base-detail'].includes(type);
const teamMate=team=>team==='red'?'blue':team==='blue'?'red':team;
const metadata=options=>Object.fromEntries(['fill','team','label'].filter(key=>options[key]!==undefined).map(key=>[key,options[key]]));
export function createGeometryPair({id,type,points,width=38,...options},size=1000,height=size,requireSymmetry=true){
  const a={...metadata(options),id,type,points:clone(points),width,pairId:`${id}-r`};
  const b={...a,id:a.pairId,pairId:id,points:points.map(p=>rotate(p,size,height)),...(a.team!==undefined?{team:teamMate(a.team)}:{})};
  return validateGeometry([a,b],size,height,requireSymmetry);
}
export function createSelfGeometry({id,type,halfPoints,width=38},size=1000){
  if(!Array.isArray(halfPoints)||halfPoints.length<2||!same(halfPoints.at(-1),[size/2,size/2])) fail('Self-symmetric path must end at the center');
  const points=[...clone(halfPoints),...halfPoints.slice(0,-1).reverse().map(p=>rotate(p,size))];
  return validateGeometry([{id,type,points,width,pairId:id,selfSymmetric:true}],size,size,true)[0];
}
export function validateGeometry(features,width,height,requireSymmetry=true){
  if(!finite(width)||!finite(height)||width<=0||height<=0) fail('Invalid geometry dimensions');
  if(requireSymmetry&&width!==height) fail('Point-symmetric maps must be square');
  if(!Array.isArray(features)||features.length>5000) fail('Invalid geometry array');
  const ids=new Map();
  for(const f of features){
    if(!f||typeof f!=='object'||typeof f.id!=='string'||!f.id||f.id.length>200||ids.has(f.id))fail('Invalid or duplicate geometry ID');
    if(!['lane','river'].includes(f.type)&&!isRegionType(f.type))fail('Invalid geometry type');
    if(!finite(f.width)||f.width<1||f.width>200)fail('Geometry width must be 1–200');
    if(!Array.isArray(f.points)||f.points.length<(isRegionType(f.type)?3:2)||f.points.length>200)fail('Invalid geometry point count');
    for(const p of f.points)if(!Array.isArray(p)||p.length!==2||!finite(p[0])||!finite(p[1])||p[0]<0||p[0]>width||p[1]<0||p[1]>height)fail('Invalid geometry coordinate');
    if(isRegionType(f.type)){
      const twiceArea=f.points.reduce((sum,p,i)=>{const q=f.points[(i+1)%f.points.length];return sum+p[0]*q[1]-q[0]*p[1];},0);
      if(Math.abs(twiceArea)<1e-7)fail('Jungle or terrain region must have nonzero area');
    }
    if(f.fill!==undefined&&(typeof f.fill!=='string'||!/^#[0-9a-f]{6}$/i.test(f.fill)))fail('Invalid geometry fill');
    if(f.team!==undefined&&!['red','blue','neutral'].includes(f.team))fail('Invalid geometry team');
    if(f.label!==undefined&&(typeof f.label!=='string'||f.label.length>100))fail('Invalid geometry label');
    if(f.pairId!==undefined&&typeof f.pairId!=='string')fail('Invalid geometry pair ID');
    if(f.selfSymmetric!==undefined&&typeof f.selfSymmetric!=='boolean')fail('Invalid self-symmetry flag');
    ids.set(f.id,f);
  }
  for(const f of features){
    if(!requireSymmetry&&f.pairId===undefined)continue;
    const mate=ids.get(f.pairId);
    if(!mate||mate.pairId!==f.id||mate.type!==f.type||mate.width!==f.width)fail('Invalid reciprocal geometry pair');
    if((f.team!==undefined||mate.team!==undefined)&&mate.team!==teamMate(f.team))fail('Geometry partners must swap teams');
    if(f.points.length!==mate.points.length)fail('Geometry pair point count differs');
    if(f.id===f.pairId){
      if(f.selfSymmetric!==true)fail('Self pair requires explicit self-symmetry');
      for(let i=0;i<f.points.length;i++)if(!same(rotate(f.points[i],width,height),f.points[f.points.length-1-i]))fail('Self-symmetric geometry must reverse under rotation');
    }else{
      if(f.selfSymmetric||mate.selfSymmetric)fail('Paired geometry cannot be self-symmetric');
      for(let i=0;i<f.points.length;i++)if(!same(rotate(f.points[i],width,height),mate.points[i]))fail('Geometry must match its 180-degree partner');
    }
  }
  return clone(features);
}
function edit(doc,action){
  const requireSymmetry=doc.pointSymmetry===true;
  const d={...doc,geometry:validateGeometry(doc.geometry??[],doc.width,doc.height,requireSymmetry)};
  action(d);d.geometry=validateGeometry(d.geometry,d.width,d.height,requireSymmetry);return d;
}
function feature(d,id){return d.geometry.find(f=>f.id===id)??fail('Geometry not found');}
export function addGeometry(doc,options){return edit(doc,d=>{
  let id=options.id??`geometry-${globalThis.crypto?.randomUUID?.()??`${Date.now()}-${++serial}`}`;
  if(d.geometry.some(f=>f.id===id||f.id===`${id}-r`))fail('Geometry ID already exists');
  if(d.pointSymmetry===true||d.pairing===true)d.geometry.push(...createGeometryPair({...options,id},d.width,d.height,d.pointSymmetry===true));
  else d.geometry.push({...metadata(options),id,type:options.type,points:clone(options.points),width:options.width??38});
});}
export function moveGeometryPoint(doc,id,index,x,y){return edit(doc,d=>{
  const f=feature(d,id);if(!Number.isInteger(index)||index<0||index>=f.points.length)fail('Invalid control point index');
  if(!finite(x)||!finite(y))fail('Invalid control point');
  if(f.selfSymmetric&&index===(f.points.length-1)/2&&!same([x,y],[d.width/2,d.height/2]))fail('The center control point is fixed');
  f.points[index]=[x,y];if(f.pairId===undefined)return;const mate=feature(d,f.pairId);
  mate.points[f.selfSymmetric?f.points.length-1-index:index]=rotate([x,y],d.width,d.height);
});}
export function setGeometryWidth(doc,id,width){return edit(doc,d=>{const f=feature(d,id);f.width=width;if(f.pairId!==undefined)feature(d,f.pairId).width=width;});}
export function deleteGeometry(doc,id){return edit(doc,d=>{const f=feature(d,id);d.geometry=d.geometry.filter(g=>g.id!==id&&g.id!==f.pairId);});}
export function verifyPointSymmetry(doc){try{if(doc.pointSymmetry===true&&['terrain','lanes','rivers','jungles','objectiveZones'].some(key=>Array.isArray(doc[key])&&doc[key].length))fail('Point-symmetric documents must use editable geometry instead of legacy terrain');validateGeometry(doc.geometry??[],doc.width,doc.height,true);return {ok:true,errors:[]};}catch(e){return {ok:false,errors:[e.message]};}}
/** Lane graph treats segment crossings and shared vertices as connections; widths are not used. */
export function verifyLaneConnectivity(doc){
 const lanes=(doc.geometry??[]).filter(f=>f.type==='lane'),segments=lanes.flatMap(f=>f.points.slice(1).map((p,i)=>({a:f.points[i],b:p}))),parent=segments.map((_,i)=>i);
 const root=i=>parent[i]===i?i:(parent[i]=root(parent[i]));
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const on=(p,a,b)=>Math.abs(cross(a,b,p))<1e-7&&p[0]>=Math.min(a[0],b[0])-1e-7&&p[0]<=Math.max(a[0],b[0])+1e-7&&p[1]>=Math.min(a[1],b[1])-1e-7&&p[1]<=Math.max(a[1],b[1])+1e-7;
 const intersects=(s,t)=>on(s.a,t.a,t.b)||on(s.b,t.a,t.b)||on(t.a,s.a,s.b)||on(t.b,s.a,s.b)||(cross(s.a,s.b,t.a)*cross(s.a,s.b,t.b)<0&&cross(t.a,t.b,s.a)*cross(t.a,t.b,s.b)<0);
 for(let i=0;i<segments.length;i++)for(let j=0;j<i;j++)if(intersects(segments[i],segments[j]))parent[root(i)]=root(j);
 const castles=(doc.entities??[]).filter(e=>e.kind==='castle'&&e.team!=='neutral');
 const touches=castles.map(e=>segments.flatMap((s,i)=>on([e.x,e.y],s.a,s.b)?[root(i)]:[]));
 const connected=castles.length>=2&&touches.every(t=>t.some(r=>touches[0].includes(r)));
 const components=new Set(segments.map((_,i)=>root(i))).size;
 const errors=[];if(components>1)errors.push('Lane paths contain disconnected components');if(!segments.length)errors.push('No lane paths');if(castles.length<2)errors.push('Two team castles are required');else if(!connected)errors.push('Team castles are not connected by lane paths');
 return {ok:errors.length===0,errors,components,segments:segments.length,castles:castles.length,connectedCastles:connected};
}
