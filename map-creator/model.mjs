import {validateGeometry} from './geometry.mjs';
import {validateBushes} from './bushes.mjs';
/** Immutable map documents. Coordinates use a top-left origin in map units.
 * pairId points to the reciprocal entity ID, never a generated group ID.
 * Neutral entities and unique bosses deliberately never receive partners.
 */
export const KINDS = Object.freeze(['castle','tower','city','gate','shop','camp','fountain','dragex','moana']);
export const TEAMS = Object.freeze(['red','blue','neutral']);
// Authoring footprints enclose the drawn structure glyphs. They are not game hitboxes.
const FOOTPRINTS = Object.freeze({castle:[40,42],tower:[36,38],city:[44,36],gate:[48,36],shop:[44,38],camp:[44,40],fountain:[72,72],dragex:[48,44],moana:[40,44]});
export function footprintFor(kind) { const [width,height]=FOOTPRINTS[kind] ?? [44,44]; return {width,height}; }
export function pairedFootprintsOverlap(a,b) {
  const {width,height}=footprintFor(a.kind),r=a.angle*Math.PI/180;
  const dx=b.x-a.x,dy=b.y-a.y;
  // Pair rectangles are parallel: their orientations differ by exactly 180°.
  const localX=dx*Math.cos(r)+dy*Math.sin(r),localY=-dx*Math.sin(r)+dy*Math.cos(r);
  return Math.abs(localX)<width-1e-7 && Math.abs(localY)<height-1e-7;
}
const unique = kind => kind === 'dragex' || kind === 'moana';
const normalized = n => ((n % 360) + 360) % 360;
const clone = value => JSON.parse(JSON.stringify(value));
const fail = message => { throw new Error(message); };
const finite = n => typeof n === 'number' && Number.isFinite(n);
let counter = 0;
const id = () => `entity-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${++counter}`}`;
const close = (a,b) => Math.abs(a-b) < 1e-7;

export function validateDocument(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Map must be an object');
  let raw;
  try { raw = JSON.stringify(input); } catch { fail('Map must contain valid JSON'); }
  if (raw.length > 5000000) fail('Map exceeds 5 MB limit');
  // JSON would silently turn NaN into null; validate the clone as well as fields.
  const d = JSON.parse(raw);
  if (d.schemaVersion !== 1) fail('Unsupported map schema version');
  if (!finite(d.width) || !finite(d.height) || d.width <= 0 || d.height <= 0 || d.width > 10000 || d.height > 10000) fail('Invalid map dimensions');
  if (typeof d.pairing !== 'boolean') fail('Pairing must be boolean');
  if (typeof d.name !== 'string' || d.name.length > 200 || typeof d.presetId !== 'string' || d.presetId.length > 200) fail('Invalid map name or preset ID');
  if (!d.presetId || ['__proto__','constructor','prototype'].includes(d.presetId)) fail('Reserved or empty preset ID');
  if (!Array.isArray(d.terrain) || d.terrain.length > 5000 || !Array.isArray(d.entities) || d.entities.length > 2000) fail('Invalid or oversized map arrays');
  const checkJSON = (v,depth=0) => {
    if (depth > 20) fail('Map nesting exceeds limit');
    if (typeof v === 'number' && !finite(v)) fail('Non-finite map value');
    if (typeof v === 'function' || typeof v === 'undefined' || typeof v === 'symbol' || typeof v === 'bigint') fail('Map must contain JSON values');
    if (v && typeof v === 'object') for (const value of Object.values(v)) checkJSON(value,depth+1);
  };
  checkJSON(input);
  d.bushes=validateBushes(d.bushes??[],d.width,d.height);
  if(d.palette!==undefined){
    const allowed=['ground','wall','river','bush','baseBlue','baseRed','fountainBlue','fountainRed'];
    if(!d.palette||typeof d.palette!=='object'||Array.isArray(d.palette)||Object.entries(d.palette).some(([k,v])=>!allowed.includes(k)||typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v)))fail('Invalid map palette');
  }
  if(d.referenceInfo!==undefined&&(!d.referenceInfo||typeof d.referenceInfo!=='object'||Array.isArray(d.referenceInfo)))fail('Invalid reference metadata');
  if (d.pointSymmetry === undefined) d.pointSymmetry=false;
  if (typeof d.pointSymmetry !== 'boolean') fail('Point symmetry must be boolean');
  if (d.pointSymmetry && ['lanes','rivers','jungles','objectiveZones','terrain'].some(field=>d[field] !== undefined && (!Array.isArray(d[field]) || d[field].length > 0))) fail('Point-symmetric maps cannot contain legacy terrain');
  if (d.pointSymmetry && !Array.isArray(d.geometry)) fail('Point-symmetric maps require geometry');
  if (d.geometry !== undefined) d.geometry=validateGeometry(d.geometry,d.width,d.height,d.pointSymmetry);
  else if (d.pointSymmetry) fail('Point-symmetric maps require geometry');
  for (const field of ['lanes','rivers']) {
    if (d[field] === undefined) d[field]=[];
    if (!Array.isArray(d[field]) || d[field].length > 100) fail(`Invalid ${field} paths`);
    for (const path of d[field]) {
      if (!Array.isArray(path) || path.length < 2 || path.length > 200) fail(`Invalid ${field} point list`);
      for (const point of path) if (!Array.isArray(point) || point.length !== 2 || !finite(point[0]) || !finite(point[1]) || point[0] < 0 || point[0] > d.width || point[1] < 0 || point[1] > d.height) fail(`Invalid ${field} coordinates`);
    }
  }
  if (d.jungles === undefined) d.jungles=[];
  if (!Array.isArray(d.jungles) || d.jungles.length > 1000) fail('Invalid jungle array');
  for (const j of d.jungles) {
    if (!j || typeof j !== 'object' || !finite(j.x) || !finite(j.y) || !finite(j.rx) || !finite(j.ry) || j.x < 0 || j.x > d.width || j.y < 0 || j.y > d.height || j.rx <= 0 || j.ry <= 0 || j.rx > d.width || j.ry > d.height) fail('Invalid jungle ellipse');
  }
  if (d.objectiveZones === undefined) d.objectiveZones=[];
  if (!Array.isArray(d.objectiveZones) || d.objectiveZones.length > 100) fail('Invalid objective zones');
  for (const z of d.objectiveZones) {
    if (!z || typeof z !== 'object' || !finite(z.x) || !finite(z.y) || !finite(z.rx) || !finite(z.ry) || z.x < 0 || z.x > d.width || z.y < 0 || z.y > d.height || z.rx <= 0 || z.ry <= 0 || z.rx > d.width || z.ry > d.height || typeof z.label !== 'string' || z.label.length > 100 || /[<>\u0000-\u001f]/.test(z.label)) fail('Invalid objective zone');
  }
  const byId = new Map();
  for (const e of d.entities) {
    if (!e || typeof e !== 'object' || typeof e.id !== 'string' || !e.id || e.id.length > 200 || byId.has(e.id)) fail('Invalid or duplicate entity ID');
    if (!KINDS.includes(e.kind) || !TEAMS.includes(e.team)) fail('Invalid entity kind or team');
    if(e.kind==='fountain'&&(!finite(e.radius)||e.radius<5||e.radius>150||e.healingZone!==true))fail('Invalid fountain healing zone');
    if (!finite(e.x) || !finite(e.y) || e.x < 0 || e.x > d.width || e.y < 0 || e.y > d.height || !finite(e.angle) || e.angle < 0 || e.angle >= 360) fail('Invalid entity coordinates or angle');
    if (e.pairId !== undefined && (typeof e.pairId !== 'string' || e.pairId === e.id)) fail('Invalid partner ID');
    byId.set(e.id,e);
  }
  for (const e of d.entities) if (e.pairId !== undefined) {
    const p = byId.get(e.pairId);
    if (!p || p.pairId !== e.id || p.kind !== e.kind || unique(e.kind) || e.team === 'neutral' || p.team !== (e.team === 'red' ? 'blue' : 'red')) fail('Invalid reciprocal pairing');
    if(e.kind==='fountain'&&p.radius!==e.radius)fail('Paired fountains must have equal healing radius');
    if (!close(p.x,d.width-e.x) || !close(p.y,d.height-e.y) || !close(p.angle,normalized(e.angle+180))) fail('Partner must be rotated 180 degrees');
    if (pairedFootprintsOverlap(e,p)) fail('Paired structure footprints overlap near the map center. Move farther from the center or turn pairing off.');
  }
  return d;
}

export function createDocument(preset = {}) {
  const initial={schemaVersion:1,width:preset.width ?? 1000,height:preset.height ?? 1000,pairing:preset.pairing ?? true,entities:[],terrain:clone(preset.terrain ?? []),lanes:clone(preset.lanes ?? []),rivers:clone(preset.rivers ?? []),jungles:clone(preset.jungles ?? []),objectiveZones:clone(preset.objectiveZones ?? []),pointSymmetry:preset.pointSymmetry ?? false,presetId:preset.id ?? preset.presetId ?? 'custom',name:preset.name ?? 'Untitled map'};
  if (preset.geometry !== undefined) initial.geometry=clone(preset.geometry);
  for(const field of ['bushes','palette','referenceInfo'])if(preset[field]!==undefined)initial[field]=clone(preset[field]);
  let d=validateDocument(initial);
  for (const e of preset.entities ?? []) d=addEntity(d,e);
  return d;
}
function edit(doc, action) { const d=validateDocument(doc); action(d); return validateDocument(d); }
function entity(d,id) { return d.entities.find(e=>e.id===id) ?? fail('Entity not found'); }
function detach(d,e) { if (e.pairId) { const p=entity(d,e.pairId); delete p.pairId; delete e.pairId; } }
function sync(d,e) { if (e.pairId) { const p=entity(d,e.pairId); p.x=d.width-e.x; p.y=d.height-e.y; p.angle=normalized(e.angle+180); } }
export function addEntity(doc, options) {
  return edit(doc,d=>{
    const e={id:id(),kind:options.kind ?? options.type,team:options.team ?? 'neutral',x:options.x,y:options.y,angle:normalized(options.angle ?? options.rotation ?? 0)};
    if(e.kind==='fountain'){e.radius=options.radius??35;e.healingZone=options.healingZone??true;}
    d.entities.push(e);
    if (d.pairing && !unique(e.kind) && e.team !== 'neutral') {
      const p={...e,id:id(),team:e.team === 'red'?'blue':'red',x:d.width-e.x,y:d.height-e.y,angle:normalized(e.angle+180),pairId:e.id};
      e.pairId=p.id; d.entities.push(p);
    }
  });
}
export function moveEntity(doc,id,x,y) { return edit(doc,d=>{const e=entity(d,id); if(!d.pairing) detach(d,e); e.x=x;e.y=y;sync(d,e);}); }
export function rotateEntity(doc,id,angle) { return edit(doc,d=>{const e=entity(d,id);if(!d.pairing) detach(d,e);e.angle=normalized(angle);sync(d,e);}); }
export function deleteEntity(doc,id) { return edit(doc,d=>{const e=entity(d,id);const ids=new Set([e.id]);if(d.pairing && e.pairId) ids.add(e.pairId);else detach(d,e);d.entities=d.entities.filter(e=>!ids.has(e.id));}); }
export function setPairing(doc,enabled) { return edit(doc,d=>{d.pairing=enabled;}); }
export function setFountainRadius(doc,id,radius) { return edit(doc,d=>{const e=entity(d,id);if(e.kind!=='fountain')fail('Entity is not a fountain');if(!d.pairing)detach(d,e);e.radius=radius;if(e.pairId)entity(d,e.pairId).radius=radius;}); }
