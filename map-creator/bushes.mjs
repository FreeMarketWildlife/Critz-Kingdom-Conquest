const finite=n=>typeof n==='number'&&Number.isFinite(n);
const fail=m=>{throw new Error(m);};
const quant=n=>Math.round(n*1000)/1000;
// Partners on fractional-size boards can lie between source-grid points.
// Keep those distinct while deduplicating insignificant floating-point noise.
const key=s=>`${Math.round(s.x*1e9)},${Math.round(s.y*1e9)},${Math.round(s.r*1e9)}`;
export function validateBushes(stamps,width,height){
  if(!finite(width)||!finite(height)||width<=0||height<=0)fail('Invalid bush map dimensions');
  if(!Array.isArray(stamps)||stamps.length>10000)fail('Bush layer exceeds 10000 stamps');
  const ids=new Set();
  for(const s of stamps){
    if(!s||typeof s!=='object'||typeof s.id!=='string'||!s.id||s.id.length>200||ids.has(s.id))fail('Invalid bush stamp ID');
    if(!finite(s.x)||!finite(s.y)||s.x<0||s.x>width||s.y<0||s.y>height||!finite(s.r)||s.r<1||s.r>100||s.pairId!==undefined)fail('Invalid bush stamp');
    ids.add(s.id);
  }
  return stamps.map(s=>({id:s.id,x:s.x,y:s.y,r:s.r}));
}
let serial=0;
export function applyBushStroke(doc,{points,radius,erase=false,pairing=doc.pairing}={}){
  const bushes=validateBushes(doc.bushes??[],doc.width,doc.height);
  if(!Array.isArray(points)||!points.length||points.length>10000||!finite(radius)||radius<1||radius>100||typeof erase!=='boolean'||typeof pairing!=='boolean')fail('Invalid bush brush stroke');
  for(const p of points)if(!Array.isArray(p)||p.length!==2||!finite(p[0])||!finite(p[1])||p[0]<0||p[0]>doc.width||p[1]<0||p[1]>doc.height)fail('Invalid bush stroke point');
  const samples=new Map(),step=radius*.45;
  const sample=(x,y)=>{
    // Quantize the source once; derive its partner from that stored point so
    // decimal half-step rounding cannot break the exact rotational invariant.
    const qx=x===doc.width/2?x:Math.max(0,Math.min(doc.width,quant(x)));
    const qy=y===doc.height/2?y:Math.max(0,Math.min(doc.height,quant(y)));
    for(const p of pairing?[[qx,qy],[doc.width-qx,doc.height-qy]]:[[qx,qy]]){const s={x:p[0],y:p[1],r:radius};samples.set(key(s),s);if(samples.size>50000)fail('Bush stroke is too long');}
  };
  sample(...points[0]);
  for(let i=1;i<points.length;i++){
    const [a,b]=[points[i-1],points[i]],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));
    if(n>50000)fail('Bush stroke is too long');
    for(let j=1;j<=n;j++)sample(a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n);
  }
  let result;
  if(erase){
    // Balanced spatial tree avoids a full samples × mask scan for dense reference masks.
    const tree=(items,depth=0)=>{if(!items.length)return null;const axis=depth%2?'y':'x';items.sort((a,b)=>a[axis]-b[axis]);const mid=items.length>>1;return {p:items[mid],axis,left:tree(items.slice(0,mid),depth+1),right:tree(items.slice(mid+1),depth+1)};};
    const root=tree([...samples.values()]);
    const intersects=(node,s)=>{if(!node)return false;const reach=s.r+radius,dx=s.x-node.p.x,dy=s.y-node.p.y;if(dx*dx+dy*dy<=reach*reach)return true;const delta=s[node.axis]-node.p[node.axis];return intersects(delta<0?node.left:node.right,s)||(Math.abs(delta)<=reach&&intersects(delta<0?node.right:node.left,s));};
    result=bushes.filter(s=>!intersects(root,s));
  }else{
    const byPosition=new Map(bushes.map(s=>[key(s),s]));const ids=new Set(bushes.map(s=>s.id));
    for(const s of samples.values())if(!byPosition.has(key(s))){let id;do{id=`bush-${Date.now()}-${++serial}`;}while(ids.has(id));ids.add(id);byPosition.set(key(s),{id,...s});if(byPosition.size>10000)fail('Bush layer exceeds 10000 stamps');}
    result=[...byPosition.values()];
  }
  return {...doc,bushes:validateBushes(result,doc.width,doc.height)};
}
