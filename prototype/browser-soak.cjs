// Real elapsed-time QA: native requestAnimationFrame, real controls, repeated matches/pauses.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {performance}=require('node:perf_hooks'),{execFileSync}=require('node:child_process'),crypto=require('node:crypto');
const {chromium}=require(process.env.KINGDOM_PLAYWRIGHT_MODULE||'playwright');
const {workloads}=require('./test-support/target-workloads.cjs');
const root=process.argv[2]?path.resolve(process.argv[2]):__dirname;
const output=process.env.KINGDOM_SOAK_OUTPUT?path.resolve(process.env.KINGDOM_SOAK_OUTPUT):path.join(root,'../technical/2026-10-14-runtime/target-index/browser-wall-soak.json');
const matches=Number(process.env.KINGDOM_SOAK_MATCHES||12),matchMs=Number(process.env.KINGDOM_SOAK_MATCH_MS||50000);
const waitUntil=async deadline=>{const remaining=deadline-performance.now();if(remaining>0)await new Promise(resolve=>setTimeout(resolve,remaining))};

async function main(){
 const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');const file=path.resolve(root,url.pathname==='/'?'index.html':url.pathname.slice(1));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return}
  res.setHeader('content-type',{'.js':'text/javascript','.css':'text/css','.html':'text/html'}[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`;
 let browser;
 const result={startedAt:new Date().toISOString(),requestedWallMs:matches*matchMs,matches,
  mode:'Native real-time browser; speed=1; no manual update/frame calls or accelerated clock',samples:[],pauses:[],errors:[],
  sourceSha256:Object.fromEntries(['game.js','play.js','style.css','index.html'].map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex')])),
  sourceRoot:root,codeCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim()};
 try{
  browser=await chromium.launch({headless:true,channel:'chrome'});result.browser=browser.version();
  const context=await browser.newContext({viewport:{width:1280,height:800}});context.setDefaultTimeout(10000);
  await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  const page=await context.newPage();page.on('pageerror',error=>result.errors.push(error.message));
  await page.goto(origin);await page.waitForFunction(()=>terrainCache!==null);
  await page.locator('#game').click({position:{x:600,y:350}});
  await page.evaluate(()=>{
   window.soakStats={frames:0,last:0,intervalBins:[0,0,0,0,0],nodesCreated:0,nodesDisconnected:0};
   function observe(t){if(soakStats.last){const d=t-soakStats.last;soakStats.intervalBins[d<20?0:d<34?1:d<50?2:d<100?3:4]++}
    soakStats.last=t;soakStats.frames++;requestAnimationFrame(observe)}requestAnimationFrame(observe);
   for(const method of ['createOscillator','createGain']){const original=audio[method].bind(audio);audio[method]=()=>{
    const node=original();soakStats.nodesCreated++;const disconnect=node.disconnect.bind(node);
    node.disconnect=()=>{soakStats.nodesDisconnected++;disconnect()};return node;};}
  });
  const pageCDP=await context.newCDPSession(page),browserCDP=await browser.newBrowserCDPSession();
  await pageCDP.send('Performance.enable');
  const start=performance.now();
  const metrics=async()=>Object.fromEntries((await pageCDP.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
  async function sample(match,kind,phase){
   const before=await metrics();await pageCDP.send('HeapProfiler.collectGarbage');const after=await metrics();
   const processes=(await browserCDP.send('SystemInfo.getProcessInfo')).processInfo;
   let rss=null;
   try{const text=execFileSync('ps',['-o','pid=,rss=','-p',processes.map(p=>p.id).join(',')],{encoding:'utf8'});
    rss=text.trim().split('\n').reduce((sum,line)=>sum+Number(line.trim().split(/\s+/)[1]||0),0)/1024;}catch{}
   const state=await page.evaluate(()=>({clock,paused,speed,units:units.length,liveUnits:units.filter(u=>u.hp>0).length,
    indexActive:targetIndexed,indexReferences:targetBins.reduce((n,bin)=>n+bin.length,0),projectiles:projectiles.length,
    effects:effects.length,particles:particles.length,floats:floats.length,skills:skillshots.length,
    finite:units.every(u=>[u.x,u.y,u.hp].every(Number.isFinite)),audioState:audio.state,stats:{...soakStats,intervalBins:[...soakStats.intervalBins]}}));
   assert.equal(state.finite,true);assert.equal(state.speed,1);
   const row={wallMs:performance.now()-start,match,kind,phase,preGcHeapMiB:(before.JSHeapUsedSize??NaN)/1048576,
    postGcHeapMiB:(after.JSHeapUsedSize??NaN)/1048576,chromeProcessRssMiB:rss,...state};result.samples.push(row);
   console.log(`Soak ${(row.wallMs/1000).toFixed(0)}s / ${(matches*matchMs/1000).toFixed(0)}s: match ${match} ${kind}, ${state.units} units, heap ${row.postGcHeapMiB.toFixed(2)} MiB, Chrome RSS ${rss?.toFixed(1)} MiB`);
  }
  await sample(0,'normal','baseline');
  for(let match=0;match<matches;match++){
   const base=start+match*matchMs,kind=match%3===2?'reinforced':'normal';
   if(match){await page.locator('#reset').click();}
   if(kind==='reinforced')await page.evaluate(workloads.reinforcedLanes.setup.replace('selected=null;',''));
   if(match%2){await page.locator('#choose').click();await page.locator('[data-kit="2"]').click();}
   await waitUntil(base+matchMs*.1);
   await page.locator('#shop').click();await page.locator('[data-buy="boots"]').click();await page.locator('#shop').click();
   await waitUntil(base+matchMs*.3);
   await page.keyboard.press('q');await page.keyboard.press('w');await page.keyboard.press('r');
   await sample(match+1,kind,'playing');
   await waitUntil(base+matchMs*.4);await page.locator('#pause').click();
   const pauseStart=performance.now(),pauseClock=await page.evaluate(()=>clock);
   await waitUntil(pauseStart+matchMs*.1);
   const pauseEnd=performance.now(),endClock=await page.evaluate(()=>clock);
   assert.equal(endClock,pauseClock,'real pause stops simulation time');
   result.pauses.push({match:match+1,wallMs:pauseEnd-pauseStart,simulationAdvance:endClock-pauseClock});
   await page.locator('#pause').click();
   await waitUntil(base+matchMs*.7);
   await page.keyboard.press('e');await page.keyboard.press('f');await page.keyboard.press('b');
   await sample(match+1,kind,'resumed');
   await waitUntil(base+matchMs);await sample(match+1,kind,'match-end');
  }
  result.elapsedWallMs=performance.now()-start;assert.ok(result.elapsedWallMs>=matches*matchMs);
  await page.locator('#pause').click();await new Promise(resolve=>setTimeout(resolve,300));
  const finalAudio=await page.evaluate(()=>({created:soakStats.nodesCreated,disconnected:soakStats.nodesDisconnected}));
  assert.equal(finalAudio.created,finalAudio.disconnected,'all finished audio nodes disconnect');
  result.audio=finalAudio;assert.deepEqual(result.errors,[]);result.passed=true;
  const normal=result.samples.filter(s=>s.kind==='normal'&&s.phase==='match-end');
  const warmed=normal[Math.min(1,normal.length-1)],last=normal.at(-1);
  result.normalMatchPostGcHeapGrowthMiB=Number.isFinite(last?.postGcHeapMiB)&&Number.isFinite(warmed?.postGcHeapMiB)?last.postGcHeapMiB-warmed.postGcHeapMiB:null;
  result.normalMatchRssGrowthMiB=Number.isFinite(last?.chromeProcessRssMiB)&&Number.isFinite(warmed?.chromeProcessRssMiB)?last.chromeProcessRssMiB-warmed.chromeProcessRssMiB:null;
  result.note=`Real wall-clock native frames. ${matches} ${matchMs/1000}-second matches include ${matches} ${matchMs/10000}-second pauses and ${Math.max(0,matches-1)} restarts. Every third match injects twelve ordinary waves as a high-population fixture; stats/speed/timestep are unchanged. JS heap is forced-GC sampled; RSS sums this isolated Chrome instance's processes and may count shared pages multiple times; it is not a direct GPU-memory metric.`;
 }catch(error){result.passed=false;result.error=error.stack;throw error}
 finally{
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
  result.cleanup={serverClosed:!server.listening,browserDisconnected:!browser?.isConnected()};result.finishedAt=new Date().toISOString();
  fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log('Soak evidence:',output);
 }
}
main().catch(error=>{console.error(error);process.exitCode=1});
