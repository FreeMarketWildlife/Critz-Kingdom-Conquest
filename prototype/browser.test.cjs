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
  try {
    browser = await chromium.launch({ headless: true,
      ...(process.env.KINGDOM_BROWSER_EXECUTABLE
        ? { executablePath: process.env.KINGDOM_BROWSER_EXECUTABLE }
        : { channel: process.env.KINGDOM_BROWSER_CHANNEL || 'chrome' }) });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    // Stable simulation and frozen frames permit exact visual comparison and input tests.
    await context.addInitScript(() => {
      let seed = 314159;
      Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
      window.requestAnimationFrame = callback => { window.testFrame = callback; return 1; };
    });
    await context.route('**/*', route => route.request().url().startsWith(origin)
      ? route.continue() : route.abort()); // Also verifies the offline font fallback.
    const errors = [];
    const results = { browser: browser.version(), visual: {}, performance: {}, checks: [] };
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
        init(); draw(); return hashes;
      });
      if (output) {
        fs.mkdirSync(output, { recursive: true });
        await page.screenshot({ path: path.join(output, `${name}.png`) });
      }
      results.performance[name] = await page.evaluate(() => {
        const simulationMs = [], drawMs = [];
        for (let sample = 0; sample < 3; sample++) {
          init(); selected = null;
          const start = performance.now();
          for (let i = 0; i < 1000; i++) update(.02);
          simulationMs.push(performance.now() - start);
        }
        init(); draw();
        for (let sample = 0; sample < 3; sample++) {
          const start = performance.now();
          for (let i = 0; i < 200; i++) draw();
          drawMs.push(performance.now() - start);
        }
        return { simulationMs, drawMs };
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
      assert.deepEqual(results.visual.after, results.visual.before, 'all five canvas views remain pixel identical');
      results.checks.push('five pixel-identical canvas views against baseline');
    }
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
    assert.deepEqual(errors, []);
    results.checks.push('no browser runtime errors; local assets loaded with remote fonts blocked');
    console.log(JSON.stringify(results, null, 2));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
