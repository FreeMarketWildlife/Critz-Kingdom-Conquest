const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {execFileSync}=require('node:child_process');
function createReference(ref='b320be9'){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'kingdom-target-reference-'));
  for(const name of ['game.js','play.js','index.html','style.css'])fs.writeFileSync(path.join(root,name),
    execFileSync('git',['show',`${ref}:prototype/${name}`],{cwd:__dirname}));
  return {root,ref,close(){fs.rmSync(root,{recursive:true,force:true})}};
}
// Sources/targets are represented by ID; all ordinary simulation fields are included.
const snapshotSource=`globalThis.snapshotBattle=()=>{
 const copy=(value,rootUnit=false)=>{
  if(value===null||typeof value!=='object')return value;
  if(!rootUnit&&typeof value.id==='number'&&typeof value.kind==='string')return {unit:value.id};
  if(Array.isArray(value))return value.map(v=>copy(v));
  const out={};for(const key of Object.keys(value).sort())if(!key.startsWith('_target'))out[key]=copy(value[key]);
  return out;
 };
 return JSON.stringify({clock,nextWave,waveNumber,winner,kills,flashCd,shake,paused,speed,follow,
  selected:selected?.id??null,units:units.map(u=>copy(u,true)),effects:copy(effects),projectiles:copy(projectiles),
  skillshots:copy(skillshots),particles:copy(particles),floats:copy(floats),decals:copy(decals),
  obstacles:copy(obstacles),navGrid:Array.from(navGrid)});
};`;
module.exports={createReference,snapshotSource};
