# Kingdom Conquest runtime optimization — 2026-10-14

Completed substantive runtime and correctness work for the existing browser prototype. The code and regression tooling are committed locally as `820500b` on `codex/kingdom-runtime-optimization`, based on `7c189fb`. The isolated checkout is `/tmp/critz-kingdom-runtime-optimization`. Nothing was pushed or deployed.

The original checkout remains on `codex/gorilla-pc-handoff`. SHA-256 fingerprints confirmed all 229 existing modified/untracked user files were unchanged, including lore edits, Lincoln interview material, Theo assets and the modified Gorilla Blender file. No applicable AGENTS.md or repository .agents/skills existed. README, PC_HANDOFF, prototype documentation, design plans and the local historical memory summary were reviewed. No other development processes or servers were interrupted. Browser QA used a temporary Chrome profile and an ephemeral localhost port, both closed afterward.

The runtime changes preserve named Conquerors, character statistics, ability damage/costs/cooldowns, progression rewards and wave schedules. No creative or canon changes were made.

Changes:

- Replaced repeated obstacle distance square roots with equivalent squared-circle comparisons, including negative-radius and boundary behavior. Target detection and unit separation reject distant pairs before computing their precise distances; target priorities remain unchanged.
- Cached immutable lane lengths and reused the 36 KiB synchronous A* search workspace and neighbor directions. Cooldown arrays update in place instead of allocating new arrays every simulation step.
- Sort and draw only units near the viewport, with a conservative 200-world-unit margin for castle roofs, wings and health bars. The world terrain canvas survives viewport resizing, avoiding another approximately 39 MiB RGBA terrain allocation/repaint on each resize. Finished combat tones disconnect their oscillator and gain nodes.
- Prevented level-up healing from reviving dead Conquerors while preserving their existing experience, level and damage rewards. Death clears recall, dash, pending attacks and navigation state. Damage cancels recall even after changing the selected Conqueror. Flash cannot activate while dead or after victory, and moving with Flash cancels recall and attack windup.
- Kept ability buttons mounted during cooldown updates. The original could lose a click if the HUD replaced a button between pointer-down and pointer-up; browser QA reproduced the failure and confirmed the fix. Restart/focus changes clear stale inputs, and the shop cannot revive a dead character or retain an open purchase panel after switching character/spectating.

Median CPU timings from three samples per workload:

| Workload | Before | After | Improvement |
|---|---:|---:|---:|
| Node VM: 100 simulated seconds, performance changes only | 24,888.65 ms | 3,466.72 ms | 7.18× |
| Node VM: 500 obstacle-routing searches | 188.25 ms | 24.58 ms | 7.66× |
| Node VM: dense targeting, 480 units, 250 updates | 2,829.67 ms | 2,062.94 ms | 1.37× |
| Chrome: 1,000 updates / 20 simulated seconds, final code | 440.30 ms | 206.50 ms | 2.13× |
| Chrome: 200 warm canvas draws, final code | 53.80 ms | 24.40 ms | 2.20× |

The performance-only run has exactly the same gameplay-state SHA-256 hashes as the original for all three Node scenarios. The final 100-second run measured 2,397.87 ms; its state differs because premature revival was corrected, so that number is not used to claim a behavior-equivalent speedup. Dense targeting retains the original state hash in the final code as well.

The Node harness uses a seeded RNG and stubbed DOM/canvas. It measures simulation CPU work, not browser frame rate. Chrome measurements use real canvas calls in a frozen frame loop; they measure synchronous CPU submission, not GPU completion or display pacing. These are local measurements on macOS arm64 with Node v24.21.0 and Chrome 155.0.8059.40, not cross-device performance guarantees.

The final memory soak completed 900 simulated seconds without victory ending the workload early. All sampled unit coordinates and health stayed finite; the largest sampled population was 186 units. Post-GC heap stayed between 5.05 and 5.55 MiB after the first minute. Twenty restarts retained only 0.029 MiB beyond the sixth restart's warmed baseline. This checks Node simulation retention; it does not measure native browser canvas/GPU memory. Peak process RSS in the behavior-equivalent benchmark fell from 252.98 to 184.31 MiB, but RSS is a coarse process high-water mark rather than a retained-heap measurement.

Validation passed:

- Original gameplay suite: 37 checks, including movement, navigation, attack windup/last hits, abilities, structure protection, objectives, respawn, recall, sustained simulation, victory and restart.
- New runtime suite: 13 regressions. Five targeted tests were captured failing against the original code before the fixes.
- Browser suite: nine checks, including five pixel-identical canvas views against the original (startup, central combat view, both bases and overview), held ability clicks, keyboard casts, movement, resize caching, death/shop behavior, spectating, restart and no runtime errors. Remote fonts were blocked to verify the documented offline fallback. Screenshots were visually inspected.
- JavaScript syntax checks and `git diff --check` passed.
- There is no production compilation/bundling step in this repository: HTML, CSS and JavaScript are served directly. Browser QA successfully loaded that static delivery. Loaded payload grew from 57,684 to 59,307 raw bytes, or 21,199 to 21,792 calculated gzip bytes (+593 bytes). No runtime dependencies were added. Calculated gzip sizes do not imply the local Python server enables gzip.

Evidence: [baseline](baseline.json), [behavior-equivalent performance run](performance-only.json), [final benchmark](optimized.json), [browser results](browser.json), [memory soak](soak.json), [payload](payload.json), [preservation](preservation.json), [original failing regressions](regressions-before.txt), [passing regressions](regressions-after.txt), [original gameplay suite after fixes](gameplay-after.txt), [before screenshot](browser/before.png), [after screenshot](browser/after.png).

Reproduce from the isolated checkout:

```sh
node prototype/simulation.test.cjs
node --test prototype/runtime.test.cjs
node prototype/benchmark.cjs
node --expose-gc prototype/soak.cjs
```

Browser QA is optional and requires an installed Playwright module and Chrome:

```sh
KINGDOM_PLAYWRIGHT_MODULE=/path/to/node_modules/playwright node prototype/browser.test.cjs
```

To repeat the baseline comparison, extract `prototype/{index.html,style.css,game.js,play.js}` from `7c189fb` into a separate directory and pass that directory as the first argument to `browser.test.cjs`. `benchmark.cjs` also accepts a prototype directory as its first argument. `KINGDOM_TEST_ROOT` lets the runtime regressions run against that directory. All benchmark seeds and workload sizes are in the checked-in tooling.

No remaining blocker for this assigned browser-runtime work. The managed-worktree API was unavailable in this execution environment; a conventional isolated Git worktree was used successfully. The existing Unreal import/asset limitations remain outside this runtime change. Integration remains a local branch merge or cherry-pick of the code and report commits after review; the original dirty checkout was not switched or merged.
