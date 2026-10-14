// Optional browser QA. Uses an isolated browser/profile and an ephemeral localhost port.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.KINGDOM_PLAYWRIGHT_MODULE || 'playwright');
const baseline = process.argv[2] && path.resolve(process.argv[2]);
const output = process.env.KINGDOM_QA_OUTPUT && path.resolve(process.env.KINGDOM_QA_OUTPUT);

async function main() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');
    const before = url.pathname.startsWith('/before/');
    const root = before ? baseline : __dirname;
    const name = url.pathname.replace(/^\/(before|after)\//, '') || 'index.html';
    const file = root && path.resolve(root, name);
    if (!file || !file.startsWith(root + path.sep) || !fs.existsSync(file)) {
      response.writeHead(404); response.end(); return;
    }
    response.setHeader('Content-Type', { '.js': 'text/javascript', '.css': 'text/css',
      '.html': 'text/html' }[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  let results;
  try {
    browser = await chromium.launch({ headless: true,
      ...(process.env.KINGDOM_BROWSER_EXECUTABLE
        ? { executablePath: process.env.KINGDOM_BROWSER_EXECUTABLE }
        : { channel: process.env.KINGDOM_BROWSER_CHANNEL || 'chrome' }) });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    context.setDefaultTimeout(5000);
    // Stable simulation and frozen frames permit exact visual comparison and input tests.
    await context.addInitScript(() => {
      let seed = 314159;
      Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
      window.resetTestSeed = () => { seed = 314159; };
      window.nativeRequestAnimationFrame = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = callback => { window.testFrame = callback; return 1; };
    });
    await context.route('**/*', route => route.request().url().startsWith(origin)
      ? route.continue() : route.abort()); // Also verifies the offline font fallback.
    const errors = [];
    results = { browser: browser.version(), visual: {}, performance: {}, checks: [] };
    const pages = {};
    for (const name of baseline ? ['before', 'after'] : ['after']) {
      const page = pages[name] = await context.newPage();
      page.on('pageerror', error => errors.push(`${name}: ${error.message}`));
      await page.goto(`${origin}/${name}/index.html`);
      results.visual[name] = await page.evaluate(async () => {
        const hashes = [];
        const views = [[selected.x, selected.y, 1.1], [1600, 1600, 1.1],
          [350, 2850, 1.1], [2850, 350, 1.1], [1600, 1600, .4]];
        for (const [x, y, zoom] of views) {
          Object.assign(camera, { x, y, zoom }); draw();
          const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
          const hash = await crypto.subtle.digest('SHA-256', pixels);
          hashes.push(Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join(''));
        }
        // Compare culling while animated art, shields, minions and combat effects are visible.
        resetTestSeed();init();clock=5.75;spawnWave();
        for(const u of units)if(u.kind==='hero')Object.assign(u,{moving:true,walk:3,attackAnim:.22,flash:.08,shield:2,mana:125,cd:.3});
        fx(1500,1700,180,'#ec8d61','blast',.4);floating(1420,1720,'170','#ffeac3',21);
        burst(1510,1680,'#ec8d61',20);
        effects.push({x:1600,y:1600,r:230,life:.3,max:.65,color:'#ec8d61',type:'telegraph',source:selected,damage:330});
        skillshots.push({x:1500,y:1700,radius:14,color:'#ec8d61',trail:[{x:1460,y:1740},{x:1480,y:1720}]});
        for(const [x,y,zoom] of [[1600,1600,1.1],[selected.x,selected.y,1.5],[350,2850,.8]]){
          Object.assign(camera,{x,y,zoom});draw();draw();
          const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
          const hash=await crypto.subtle.digest('SHA-256',pixels);
          hashes.push(Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join(''));
        }
        init(); draw(); return hashes;
      });
      if (output) {
        fs.mkdirSync(output, { recursive: true });
        await page.screenshot({ path: path.join(output, `${name}.png`) });
      }
      results.performance[name] = await page.evaluate(async () => {
        const simulationMs = [], drawMs = [];
        const simulationStartHashes=[],simulationEndHashes=[],drawStartHashes=[],drawEndHashes=[];
        const digest=async data=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');
        const stateHash=()=>digest(new TextEncoder().encode(JSON.stringify({clock,waveNumber,winner,kills,
          units:units.map(u=>[u.id,u.kind,u.hp,u.x,u.y,u.cd,u.mana,u.bells,u.cs]),camera,
          width:canvas.width,height:canvas.height})));
        const canvasHash=()=>digest(canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data);
        for (let sample = 0; sample < 3; sample++) {
          resetTestSeed();init(); selected = null;
          simulationStartHashes.push(await stateHash());
          const start = performance.now();
          for (let i = 0; i < 1000; i++) update(.02);
          simulationMs.push(performance.now() - start);
          simulationEndHashes.push(await stateHash());
        }
        for (let sample = 0; sample < 3; sample++) {
          resetTestSeed();init();draw();draw();
          drawStartHashes.push(await canvasHash());
          const start = performance.now();
          for (let i = 0; i < 200; i++) draw();
          drawMs.push(performance.now() - start);
          drawEndHashes.push(await canvasHash());
        }
        return { simulationMs, drawMs, simulationStartHashes,simulationEndHashes,drawStartHashes,drawEndHashes,
          workload:{seed:314159,simulationUpdates:1000,simulationDt:.02,drawWarmups:2,drawCalls:200,viewport:[1440,900],devicePixelRatio:devicePixelRatio} };
      });
      // Reproduce the real pointer-down / HUD-refresh / pointer-up sequence.
      await page.evaluate(() => { init(); });
      const box = await page.locator('[data-skill="0"]').boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.evaluate(() => { for (let i = 0; i < 3; i++) updateUI(); });
      await page.mouse.up();
      results.performance[name].heldAbilityClickWorks = await page.evaluate(() => selected.skills[0] > 0);
    }
    if (baseline) {
      assert.deepEqual(results.visual.after, results.visual.before, 'all eight initial/animated canvas views remain pixel identical');
      results.checks.push('eight pixel-identical initial/animated combat canvas views against baseline');
      assert.deepEqual(results.performance.after.workload, results.performance.before.workload);
      assert.deepEqual(results.performance.after.simulationStartHashes, results.performance.before.simulationStartHashes);
      assert.deepEqual(results.performance.after.simulationEndHashes, results.performance.before.simulationEndHashes);
      assert.deepEqual(results.performance.after.drawStartHashes, results.performance.before.drawStartHashes);
      assert.deepEqual(results.performance.after.drawEndHashes, results.performance.before.drawEndHashes);
      results.checks.push('benchmark workloads/start states and before/after drawing pixels match for every sample');
    }
    for(const p of Object.values(results.performance))for(const key of ['simulationStartHashes','simulationEndHashes','drawStartHashes','drawEndHashes'])
      assert.equal(new Set(p[key]).size,1,`${key} remains deterministic across all samples`);
    const page = pages.after;
    assert.equal(results.performance.after.heldAbilityClickWorks, true);
    results.checks.push('ability click survives HUD refresh between pointer down/up');
    await page.evaluate(() => { init(); globalThis.firstButton = document.querySelector('[data-skill="0"]'); });
    await page.keyboard.press('q');
    assert.equal(await page.evaluate(() => selected.skills[0] > 0 && selected.mana === 415), true);
    await page.evaluate(() => { for (let i = 0; i < 20; i++) { update(.02); updateUI(); } });
    assert.equal(await page.evaluate(() => firstButton === document.querySelector('[data-skill="0"]')), true);
    results.checks.push('keyboard cast, mana cost, cooldown and button identity');
    await page.evaluate(() => { init(); globalThis.firstTerrain = terrainCache; draw(); firstTerrain = terrainCache; });
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.evaluate(() => draw());
    assert.equal(await page.evaluate(() => firstTerrain === terrainCache), true);
    results.checks.push('resize reuses terrain canvas');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => { init(); draw(); globalThis.startX = selected.x; });
    const arena = await page.locator('#game').boundingBox();
    await page.mouse.click(arena.x + arena.width / 2 + 100, arena.y + arena.height / 2, { button: 'right' });
    await page.evaluate(() => { for (let i = 0; i < 35; i++) update(.02); });
    assert.equal(await page.evaluate(() => selected.x > startX + 25), true);
    results.checks.push('right-click movement');
    await page.evaluate(() => { init(); Object.assign(selected, bases[0]); selected.bells = 1000; });
    await page.locator('#shop').click();
    await page.evaluate(() => { selected.hp = 0; selected.respawn = 10; });
    await page.locator('[data-buy="armor"]').click();
    assert.equal(await page.evaluate(() => selected.hp === 0 && selected.bells === 1000), true);
    results.checks.push('shop armor cannot revive a dead Conqueror');
    await page.locator('#choose').click();
    await page.locator('#watch').click();
    assert.equal(await page.locator('.shop-panel').count(), 0);
    results.checks.push('spectating closes the shop');
    await page.locator('#reset').click();
    assert.equal(await page.evaluate(() => clock === 0 && selected.kit === 1 && winner === null), true);
    results.checks.push('restart restores playable Vesper');

    await page.evaluate(() => { init(); });
    await page.keyboard.down('q');
    await page.keyboard.down('q');
    await page.keyboard.up('q');
    assert.equal(await page.evaluate(() => selected.mana===415&&skillshots.length===1), true);
    results.checks.push('repeated/held keyboard spell input costs mana once');
    await page.evaluate(() => {
      init();const enemy=add({x:selected.x+80,y:selected.y,team:1,kind:'minion',hp:200,radius:13});
      command(enemy,enemy);attack(selected,enemy);globalThis.windup=selected.pending;command(enemy,enemy);
    });
    assert.equal(await page.evaluate(() => selected.pending===windup), true);
    await page.keyboard.press('s');
    assert.equal(await page.evaluate(() => selected.pending===null&&selected.order===null), true);
    results.checks.push('repeated attack command preserves windup; stop interrupts it');
    const visibility = await page.evaluate(() => {
      init();frame(1000);const before=clock;
      keys.add('ArrowLeft');attackMove=true;
      Object.defineProperty(document,'hidden',{configurable:true,value:true});
      document.dispatchEvent(new Event('visibilitychange'));frame(60000);
      const suspended=clock===before&&keys.size===0&&!attackMove;
      delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));frame(120000);
      const firstResume=clock===before;frame(120020);
      return {suspended,firstResume,secondAdvance:clock-before};
    });
    assert.equal(visibility.suspended&&visibility.firstResume, true);
    assert.ok(Math.abs(visibility.secondAdvance-.02)<1e-12);
    results.visibilityPolicy={...visibility,method:'synthetic document.hidden + visibilitychange; deterministic 60-second gaps'};
    results.checks.push('hidden callbacks do not update/draw; resume drops elapsed hidden time');

    results.mobile=[];
    for(const [width,height] of [[320,640],[320,480],[390,844],[768,1024],[844,390]]) {
      await page.setViewportSize({width,height});
      await page.evaluate(async()=>{init();draw();await new Promise(resolve=>nativeRequestAnimationFrame(()=>nativeRequestAnimationFrame(resolve)))});
      const controls=await page.evaluate(()=>Array.from(document.querySelectorAll('#reset,#choose,#pause,#speed,#shop,.ability'),e=>{
        const r=e.getBoundingClientRect();return {id:e.id||e.dataset.skill,
          inside:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,
          hit:e.contains(document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2))};
      }));
      assert.ok(controls.every(c=>c.inside&&c.hit),`${width}x${height}: all existing controls fit and are clickable`);
      if(width<=700)assert.equal(await page.evaluate(()=>{
        const shop=document.getElementById('shop').getBoundingClientRect();
        return Array.from(document.querySelectorAll('.ability')).every(e=>{const r=e.getBoundingClientRect();
          return shop.right<=r.left||shop.left>=r.right||shop.bottom<=r.top||shop.top>=r.bottom});
      }),true,'shop does not cover any part of the mobile ability buttons');
      await page.locator('#shop').click();
      const panel=await page.locator('.shop-panel').boundingBox();
      if(output&&panel.y<58)fs.writeFileSync(path.join(output,'shop-before.json'),JSON.stringify({width,height,panel},null,2));
      assert.ok(panel.x>=0&&panel.y>=58&&panel.x+panel.width<=width&&panel.y+panel.height<=height,
        `${width}x${height}: shop panel fits within battlefield`);
      await page.locator('[data-buy="boots"]').scrollIntoViewIfNeeded();
      await page.locator('[data-buy="boots"]').click();
      assert.equal(await page.evaluate(()=>{const b=document.getElementById('shop'),r=b.getBoundingClientRect();
        return b.contains(document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2))}),true,'shop toggle remains reachable while panel is open');
      await page.locator('#shop').click();
      results.mobile.push({width,height,controls,panel});
      if(output&&(width===320||width===390))await page.screenshot({path:path.join(output,`mobile-${width}-after.png`)});
    }
    results.checks.push('320x640/320x480/390x844 portrait, 768x1024 tablet and 844x390 landscape controls/shop fit and respond');

    // A touch-enabled context checks existing tap controls, without inventing touch movement.
    const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
    touch.setDefaultTimeout(5000);
    await touch.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    await touch.addInitScript(()=>{window.requestAnimationFrame=()=>1});
    const touchPage=await touch.newPage();touchPage.on('pageerror',error=>errors.push('touch: '+error.message));
    await touchPage.goto(`${origin}/after/index.html`);
    await touchPage.locator('[data-skill="0"]').tap();await touchPage.locator('[data-skill="0"]').tap();
    assert.equal(await touchPage.evaluate(()=>selected.mana===415&&skillshots.length===1),true);
    await touchPage.evaluate(()=>{Object.assign(selected,bases[0]);selected.bells=200;});
    await touchPage.locator('#shop').tap();await touchPage.locator('[data-buy="blade"]').tap();
    await touchPage.locator('[data-buy="blade"]').tap();
    assert.equal(await touchPage.evaluate(()=>selected.damage===77&&selected.bells===80),true);
    await touchPage.locator('#choose').tap();await touchPage.locator('[data-kit="0"]').tap();
    assert.equal(await touchPage.locator('.shop-panel').count(),0);
    await touchPage.locator('#reset').tap();assert.equal(await touchPage.evaluate(()=>selected.kit===1&&clock===0),true);
    results.checks.push('touch ability taps, repeated purchases, character switch and restart');
    await touch.close();

    await page.setViewportSize({width:1440,height:900});
    await page.evaluate(()=>{
      init();draw();globalThis.originalAudio=audio;globalThis.audioDisconnects=0;
      for(const method of ['createOscillator','createGain']){
        const original=audio[method].bind(audio);audio[method]=()=>{const node=original(),disconnect=node.disconnect.bind(node);
          node.disconnect=()=>{audioDisconnects++;disconnect()};return node};
      }
      for(let i=0;i<10;i++)tone(440,.01);init();
    });
    await page.waitForFunction(()=>audioDisconnects===20,null,{polling:25});
    assert.equal(await page.evaluate(()=>audio===originalAudio),true);
    results.checks.push('ten real WebAudio tones disconnect twenty nodes; restart reuses the context');

    const live=await browser.newContext({viewport:{width:900,height:700}});
    await live.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const livePage=await live.newPage();livePage.on('pageerror',error=>errors.push('lifecycle: '+error.message));
    await livePage.goto(`${origin}/after/index.html`);
    const cdp=await live.newCDPSession(livePage);
    await cdp.send('Page.setWebLifecycleState',{state:'frozen'});
    await new Promise(resolve=>setTimeout(resolve,300));
    await cdp.send('Page.setWebLifecycleState',{state:'active'});
    assert.equal(await livePage.evaluate(()=>units.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.hp))),true);
    results.checks.push('native Chrome freeze/resume with real animation frames remains finite');
    await live.close();
    assert.deepEqual(errors, []);
    results.checks.push('no browser runtime errors; local assets loaded with remote fonts blocked');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
    if(results)results.cleanup={serverClosed:!server.listening,browserDisconnected:!browser?.isConnected()};
  }
  return results;
}

main().then(results=>console.log(JSON.stringify(results,null,2))).catch(error => { console.error(error); process.exitCode = 1; });
