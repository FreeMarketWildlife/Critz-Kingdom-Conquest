// Includes complete update/index maintenance; the browser mode also includes render/DOM frames.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {performance}=require('node:perf_hooks'),crypto=require('node:crypto');
const {createHarness}=require('./test-support/harness.cjs');
const {createReference,snapshotSource}=require('./test-support/reference.cjs');
const {workloads}=require('./test-support/target-workloads.cjs');
const samples=Number(process.env.KINGDOM_TARGET_SAMPLES||5),seed=314159;
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const reference=createReference();

async function main(){
 let browser,server;
 const result={reference:reference.ref,seed,samples,mode:process.argv.includes('--browser')?'Chrome':'Node VM',workloads:{}};
 result.sourceSha256=Object.fromEntries(['before','after'].map(side=>[side,Object.fromEntries(['game.js','play.js'].map(name=>
  [name,hash(fs.readFileSync(path.join(side==='before'?reference.root:__dirname,name)))]))]));
 try{
  if(result.mode==='Chrome'){
   const {chromium}=require(process.env.KINGDOM_PLAYWRIGHT_MODULE||'playwright');
   server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost'),before=url.pathname.startsWith('/before/');
    const root=before?reference.root:__dirname,file=path.resolve(root,url.pathname.replace(/^\/(before|after)\//,''));
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return}
    res.setHeader('content-type',{'.js':'text/javascript','.css':'text/css','.html':'text/html'}[path.extname(file)]||'application/octet-stream');
    res.end(fs.readFileSync(file));});
   await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
   const origin=`http://127.0.0.1:${server.address().port}`;
   browser=await chromium.launch({headless:true,channel:'chrome'});result.browser=browser.version();
   const context=await browser.newContext({viewport:{width:1440,height:900}});
   await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
   await context.addInitScript(()=>{let state=314159,calls=0;
    Math.random=()=>{calls++;return ((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296)};
    window.resetSeed=()=>{state=314159;calls=0};window.randomState=()=>({seed:state,randomCalls:calls});window.requestAnimationFrame=()=>1;});
   const pages={};for(const side of ['before','after']){const p=pages[side]=await context.newPage();await p.goto(`${origin}/${side}/index.html`);await p.evaluate(snapshotSource)}
   for(const [name,w]of Object.entries(workloads)){
    result.workloads[name]={receipt:{...w,seed},before:[],after:[]};
    for(let i=0;i<samples;i++)for(const side of i%2?['after','before']:['before','after']){
     const sample=await pages[side].evaluate(({w})=>{
      resetSeed();init();(0,eval)(w.setup);
      if(w.frame){frame(1000);frame(1020)}
      const initial=JSON.stringify({state:snapshotBattle(),rng:randomState()});
      const initialUnits=units.length;
      const start=performance.now();
      for(let step=0;step<w.steps;step++)if(w.frame)frame(1040+step*w.dt*1000);else update(w.dt);
      return {elapsedMs:performance.now()-start,initialUnits,initial,final:JSON.stringify({state:snapshotBattle(),rng:randomState()}),units:units.length,clock};
     },{w});
     const {initial,final,...data}=sample;
     result.workloads[name][side].push({...data,initialHash:hash(initial),finalHash:hash(final)});
    }
   }
  }else{
   for(const [name,w]of Object.entries(workloads)){
    if(w.frame)continue;
    result.workloads[name]={receipt:{...w,seed},before:[],after:[]};
    for(let i=0;i<samples;i++)for(const side of i%2?['after','before']:['before','after']){
     const h=createHarness({root:side==='before'?reference.root:__dirname,seed});h.run(snapshotSource);h.run(w.setup);
     const initialUnits=h.run('units.length'),initialHash=hash(JSON.stringify({state:h.run('snapshotBattle()'),rng:h.randomState()}));
     const start=performance.now();h.run(`for(let i=0;i<${w.steps};i++)update(${w.dt});`);const elapsedMs=performance.now()-start;
     result.workloads[name][side].push({elapsedMs,initialHash,initialUnits,
      finalHash:hash(JSON.stringify({state:h.run('snapshotBattle()'),rng:h.randomState()})),units:h.run('units.length'),clock:h.run('clock')});
    }
   }
  }
  for(const w of Object.values(result.workloads)){
   assert.deepEqual(w.before.map(x=>x.initialHash),w.after.map(x=>x.initialHash));
   assert.deepEqual(w.before.map(x=>x.finalHash),w.after.map(x=>x.finalHash));
   assert.equal(new Set(w.before.map(x=>x.finalHash)).size,1,'every repeated sample deterministic');
   const median=values=>values.map(x=>x.elapsedMs).sort((a,b)=>a-b)[Math.floor(samples/2)];
   w.beforeMedianMs=median(w.before);w.afterMedianMs=median(w.after);w.speedup=w.beforeMedianMs/w.afterMedianMs;
  }
  result.passed=true;result.note='Paired/alternating execution order. All index build/relocation, navigation, separation, combat, FX and removal costs are included; playableFrames also includes rendering and HUD work. State/RNG hashes exclude only private target-index bookkeeping.';
 }finally{
  if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));reference.close();
  result.cleanup={serverClosed:!server?.listening,browserDisconnected:!browser?.isConnected()};
 }
 console.log(JSON.stringify(result,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1});
