// Aggregate the portable checks; --browser optionally includes installed Playwright/Chrome QA.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { performance } = require('node:perf_hooks');
const root = path.resolve(__dirname, '..');
const results = [];
const run = (command, args) => {
  const start = performance.now();
  const output = execFileSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 1048576 });
  results.push({command:[command===process.execPath?'node':command,...args],elapsedMs:performance.now()-start,output:output.trim(),passed:true});
};
try {
  for (const file of fs.readdirSync(__dirname).filter(name => /\.(js|cjs)$/.test(name))) {
    run(process.execPath, ['--check', path.join('prototype', file)]);
  }
  run(process.execPath, ['--check', 'prototype/test-support/harness.cjs']);
  run(process.execPath, ['prototype/simulation.test.cjs']);
  run(process.execPath, ['--test', 'prototype/runtime.test.cjs']);
  run('git', ['diff', '--check']);
  const browserIndex = process.argv.indexOf('--browser');
  if (browserIndex >= 0) run(process.execPath,
    ['prototype/browser.test.cjs', ...process.argv.slice(browserIndex+1)]);
  console.log(JSON.stringify({passed:true,results,
    productionBuild:'Static HTML/CSS/JavaScript: no compiler, bundler or production build command is configured.'},null,2));
} catch (error) {
  console.error(error.stdout?.toString() || '', error.stderr?.toString() || '', error.message);
  process.exitCode = 1;
}
