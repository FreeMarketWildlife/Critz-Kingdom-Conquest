const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createHarness({ root = process.env.KINGDOM_TEST_ROOT || path.resolve(__dirname, '..'), seed = 314159,
  transform = (_, source) => source } = {}) {
  const listeners = new Map();
  const drawingCalls = {};
  const drawing = new Proxy({}, {
    get: (_, name) => (...args) => { drawingCalls[name] = (drawingCalls[name] || 0) + 1; },
    set: () => true,
  });
  const element = () => ({
    innerHTML: '', textContent: '', children: [], clientWidth: 1200, clientHeight: 760,
    width: 180, height: 140, classList: { remove() {}, toggle() {} },
    addEventListener() {}, getContext() { return drawing; }, prepend() {}, appendChild() {},
    querySelectorAll() { return []; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 1200, height: 760 }; },
  });
  const elements = new Map();
  const math = Object.create(Math);
  math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const window = {
    devicePixelRatio: 1,
    addEventListener(name, handler) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(handler);
    },
  };
  const context = vm.createContext({
    console, Math: math, Float32Array, Int32Array, Uint8Array, Map,
    document: {
      body: element(),
      hidden: false, visibilityState: 'visible',
      addEventListener(name, handler) {
        if (!listeners.has('document:' + name)) listeners.set('document:' + name, []);
        listeners.get('document:' + name).push(handler);
      },
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, element());
        return elements.get(id);
      },
      querySelectorAll() { return []; }, querySelector() { return null; }, createElement: element,
    },
    window, requestAnimationFrame() {},
  });
  for (const name of ['game.js', 'play.js']) {
    vm.runInContext(transform(name, fs.readFileSync(path.join(root, name), 'utf8')), context, { filename: name });
  }
  return {
    context, elements, drawingCalls,
    run(source) { return vm.runInContext(source, context); },
    event(name, event = {}) {
      for (const handler of listeners.get(name) || []) handler({ preventDefault() {}, ...event });
    },
  };
}

module.exports = { createHarness };
