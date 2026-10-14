# Kingdom Conquest runtime optimization — 2026-10-14

Completed substantive runtime and correctness work for the existing browser prototype. The target index is now locally integrated into the actual checkout as `9c4d562`; the ten-minute real-time browser soak passed. Detailed results follow below. The code and regression tooling are committed locally as `820500b` and `f37691c` on `codex/kingdom-runtime-optimization`, based on `7c189fb`. The durable isolated checkout is `/Users/tanoshi/Documents/ChatGPT/Critz-Kingdom Conquest/.worktrees/kingdom-runtime-optimization`. A copy of this report and all evidence is also retained under `.reports/kingdom-runtime-2026-10-14/` in the original checkout. Nothing was pushed or deployed.

The original checkout remains on `codex/gorilla-pc-handoff` and was fast-forwarded locally to the verified code. SHA-256 fingerprints confirmed all 229 existing modified/untracked user files were unchanged, including lore edits, Lincoln interview material, Theo assets and the modified Gorilla Blender file. No applicable AGENTS.md or repository .agents/skills existed. README, PC_HANDOFF, prototype documentation, design plans and the local historical memory summary were reviewed. No other development processes or servers were interrupted. Browser QA used a temporary Chrome profile and an ephemeral localhost port, both closed afterward.

The runtime changes preserve named Conquerors, character statistics, ability damage/costs/cooldowns, progression rewards and wave schedules. No creative or canon changes were made.

Changes:

- Replaced repeated obstacle distance square roots with equivalent squared-circle comparisons, including negative-radius and boundary behavior. Target detection and unit separation reject distant pairs before computing their precise distances; target priorities remain unchanged.
- Cached immutable lane lengths and reused the 36 KiB synchronous A* search workspace and neighbor directions. Cooldown arrays update in place instead of allocating new arrays every simulation step.
- Sort and draw only units near the viewport, with a conservative 200-world-unit margin for castle roofs, wings and health bars. The world terrain canvas survives viewport resizing, avoiding another approximately 39 MiB RGBA terrain allocation/repaint on each resize. Finished combat tones disconnect their oscillator and gain nodes.
- Prevented level-up healing from reviving dead Conquerors while preserving their existing experience, level and damage rewards. Death clears recall, dash, pending attacks and navigation state. Damage cancels recall even after changing the selected Conqueror. Flash cannot activate while dead or after victory, and moving with Flash cancels recall and attack windup.
- Kept ability buttons mounted during cooldown updates. The original could lose a click if the HUD replaced a button between pointer-down and pointer-up; browser QA reproduced the failure and confirmed the fix. Restart/focus changes clear stale inputs, and the shop cannot revive a dead character or retain an open purchase panel after switching character/spectating.

First-pass median CPU timings from three samples per workload (the independently verified second-pass measurements follow below):

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


Second quality pass completed, with fixes committed as `f37691c`. The exact implementation diffs were reviewed for death/respawn, recall, Flash, shop and ability-click behavior. Death still receives the existing experience and level bonuses; only living heroes receive level-up healing. Flash keeps its 250-unit distance and 25-second cooldown. Shop costs/stat boosts and spell costs/damage/cooldowns remain unchanged. All named Conquerors and design/art files are preserved.

Additional reproduced issues and corrections:

- Recall started during a dash preserved the remaining dash, then moved the Conqueror away from the fountain after the channel. Recall now clears dash and navigation state at channel start.
- A callback received while the page was hidden still updated/drew a 40-ms simulation step. Hidden callbacks now skip both work paths; visibility changes clear held inputs and reset the frame timestamp. Returning to the page and restarting a match cannot advance by stale wall-clock time.
- At 320 pixels wide, New battle and R were clipped. Existing header/ability controls now fit the available width, and Shop sits above the ability row. The short landscape shop originally began at y=-75; it now fits the battlefield, scrolls when needed and keeps its close toggle reachable. No touch movement or creative features were added.
- The original simulation fixture was moved to the shared deterministic harness so document visibility events are represented in all test suites.

The final aggregate passed 15 stages: JavaScript syntax checks, 37 original gameplay assertions, 17 runtime regressions, Git whitespace checks and the 17-check browser suite. The browser suite compares eight exact canvas outputs: the five original views plus three scenes containing animated attacks, shields, minions, telegraphs, particles, floating damage and a projectile trail. Final layout/input profiles were 320×640, 320×480, 390×844, 768×1024 and 844×390. A separate 390×844 touch context at device-pixel ratio 2 exercised repeated spell taps, purchase validation, selection changes and restart. Repeated enemy orders retain attack windup; S interrupts it; repeated/held spell inputs charge mana once.

The stricter drawing audit identified transient first-draw canvas state present in both the original and optimized code. Both versions now receive identical two-frame warmups before each timed drawing batch. All three samples have identical initial/final state hashes for the 20-second browser simulation, identical start/end pixel hashes for drawing, and identical explicit workload receipts (seed 314159, 1,000 updates of .02 seconds or 200 draws, 1440×900 viewport, DPR 1). All eight separate visual comparisons also match exactly.

| Independently rechecked workload | Before | After | Improvement |
|---|---:|---:|---:|
| Node VM: 100 simulated seconds, performance changes only | 24,176.98 ms | 3,405.07 ms | 7.10× |
| Node VM: 500 obstacle-routing searches, performance changes only | 180.63 ms | 23.98 ms | 7.53× |
| Node VM: dense target workload, performance changes only | 2,854.26 ms | 1,947.82 ms | 1.47× |
| Chrome: 1,000 updates / 20 simulated seconds, final code | 421.60 ms | 198.10 ms | 2.13× |
| Chrome: 200 draws after identical two-frame warmups, final code | 52.90 ms | 21.20 ms | 2.50× |

`verify-performance.cjs` reconstructs the performance-only implementation from pinned original commit `7c189fb`, using explicit checked source transformations. It runs the same benchmark program against both versions and asserts equal seeds, workload hashes and resulting state hashes for all three scenarios. Every repeated sample is also checked for determinism. These independent measurements confirm the initial approximately 7.2× and 2.2× claims; measured values vary slightly by run. The fields covered by the simulation-state hashes are listed in `benchmark.cjs`.

The final soak was **900 simulated seconds, not 15 minutes of wall-clock observation**. It completed in 54.92 wall-clock seconds including 20 additional restart checks. The largest sampled population remained 186, steady post-GC heap ranged from 5.05 to 5.55 MiB, and retained heap after 20 restarts grew by only 0.043 MiB relative to the warmed sixth restart. No non-finite state or early victory shortened the main soak. Native browser tests also confirmed ten short WebAudio tones disconnect all twenty oscillator/gain nodes and restart reuses the audio context. Cleanup receipts confirm the HTTP server closed and Chrome disconnected.

Hidden-time policy was tested with synthetic visibility changes and deterministic 60-second timestamp gaps. Native Chrome freeze/resume was separately exercised for 300 ms with the real animation loop. Physical iOS/Android devices, a 15-minute wall-clock background-tab run, native canvas/GPU retained memory and online multiplayer remain outside this tested scope. Touch QA covers existing buttons; movement uses the documented desktop controls.

The next measured performance bottleneck is all-unit target scanning. A dense 480-unit CPU profile attributed 35.6% of self samples to `update` and 22.4% to `dist`; `update` includes timers/state work as well as target scanning, so those percentages are not all target-search time. An isolated fixture with waves, damage and attack windups disabled proves quadratic candidate visits per 100 updates: 640,000 at 80 units; 2,560,000 at 160; 10,240,000 at 320; and 40,960,000 at 640. Instrumented timings include counter/VM overhead and are not browser frame estimates. A spatial target broadphase is the next candidate for a performance pass; it must retain sequential movement/respawn visibility and equal-priority target ordering. Current normal browser simulation work is approximately .20 ms per update in this local fixture, and the sustained match stayed bounded.

Final loaded payload is 60,160 raw bytes, or 22,041 calculated gzip bytes, compared with 57,684 / 21,199 originally (+842 calculated gzip bytes). The prototype remains a directly served static app with no compilation/bundling command. The production JavaScript passed syntax checks and static delivery passed browser QA.

Final evidence: [aggregate checks](aggregate-final.json), [browser results and workload receipts](browser-final.json), [independent performance verification](performance-verification.json), [final benchmark](benchmark-final.json), [final soak](soak-final.json), [final payload](payload-final.json), [runtime tests](regressions-final.txt), [gameplay tests](gameplay-final.txt), [second-pass failures before fixes](second-pass-regressions-before.txt), [mobile bounds before fixes](mobile-before.json), [landscape shop failure](browser/shop-before.json), [320px final screenshot](browser/mobile-320-after.png), [390px final screenshot](browser/mobile-390-after.png), [dense CPU profile summary](dense-profile-summary.json), [dense CPU profile](dense-targeting.cpuprofile), [combined CPU profile summary](profile-summary.json), [target-scan scaling](targeting-scale.json), [final preservation receipt](preservation-final.json), [original user-file fingerprints](user-files-before.sha256.json).

Final aggregate command:

```sh
KINGDOM_PLAYWRIGHT_MODULE=/path/to/node_modules/playwright node prototype/check.cjs --browser /path/to/original-prototype
```

Omit `--browser` for portable Node-only checks. The final branch is local, all existing user-file fingerprints were reverified, and no push or deployment was performed. No remaining execution blocker.


Target-scanning pass: code commit `9c4d562` adds a reusable 200-world-unit grid above 128 units and preserves a linear path below that threshold. The grid includes dead units and updates each processed unit's location immediately. Live health is checked when choosing targets; original array position, independently of ID or bucket order, resolves ties. The original distance checks, center-based detection limits, hero penalties, neutral eligibility and tower priorities remain unchanged. Index metadata is private bookkeeping, excluded from gameplay snapshots.

Seven target-equivalence tests pass against pinned pre-index commit `b320be9`: 13,400 direct target choices on seeded, shuffled layouts; explicit cross-cell/tower ties; neutral/range boundaries; index/linear threshold transitions; same-tick movement, dash, recall, respawn and death; six seeded sustained simulations; and 640-unit coincident, crowded, dispersed and boundary cases. Complete public state and RNG streams match after each checked interval. The actual integrated checkout's aggregate passed 19 stages, including 37 original gameplay assertions, 17 runtime regressions, these seven target tests, and the 17-check browser suite.

Five paired, alternating-order samples per workload measured complete updates including index build/relocation overhead, pathfinding, separation, combat, effects and removal. Playable frames also include camera, rendering and HUD work. Every sample's full initial/final public-state and RNG hashes match the pre-index version.

| Native Chrome workload | Initial → final units | Updates / simulated seconds | Before median | After median | Ratio |
|---|---:|---:|---:|---:|---:|
| Typical match | 46 → 80 | 2,000 / 40 | 471.90 ms | 439.70 ms | 1.07× |
| Twelve reinforced ordinary waves | 502 → 274 | 1,000 / 20 | 4,469.50 ms | 979.50 ms | 4.56× |
| Dispersed high-population fixture | 686 → 674 | 500 / 10 | 6,253.70 ms | 828.40 ms | 7.55× |
| Fully coincident high-population fixture | 686 → 670 | 250 / 5 | 2,590.20 ms | 2,575.60 ms | 1.01× |
| Playable frames | 46 → 79 | 250 frames / 5.02 including warmup | 74.10 ms | 70.20 ms | 1.06× |

The target index was retained because typical matches and reinforced/dispersed full-update workloads improve. Perfectly coincident populations occupy one bucket and see essentially no improvement; the index does not remove worst-case quadratic behavior when all candidates share the same space. The corresponding Node VM full-update ratios were 1.07× typical, 2.22× reinforced, 3.65× dispersed and 1.02× coincident. These timings are local CPU work/submission measurements, not guaranteed display frame rates. High-population fixtures are explicitly synthetic; ordinary-wave reinforcement uses existing minion statistics, while the dispersed fixture uses higher HP to keep units alive during the workload.

Safe local integration completed without stashing or staging user edits. Preflight found no overlaps between incoming paths and any dirty user paths. Rollback ref `codex/kingdom-pre-integration-2026-10-14` retains original commit `7c189fb`. A local binary patch of the four tracked user edits is saved under `.reports/kingdom-runtime-2026-10-14/target-index/tracked-user-changes-before.patch`; it is not committed. In a disposable detached checkout, that patch plus the untracked Conqueror Interview were restored, then `git reset --keep` returned to the original ref with all five tested file hashes unchanged. The disposable checkout was removed. The actual checkout was only fast-forwarded, and all 229 preexisting user-file fingerprints were verified unchanged afterward. No user changes were committed, pushed or deployed.

For a local rollback before further edits, `git reset --keep codex/kingdom-pre-integration-2026-10-14` returns the current branch to the original tree while protecting unrelated user changes. The optimization branch and durable report copy remain available. `--keep` refuses to overwrite conflicting new tracked edits; the actual checkout was never reset during this work.

Target-pass evidence: [seeded/adversarial equivalence](target-index/equivalence-final.txt), [Node full-update benchmark](target-index/full-update-node-experimental.json), [Chrome full-update/frame benchmark](target-index/full-update-browser-experimental.json), [integration preflight](target-index/integration-before.json), [actual-checkout receipt](target-index/integration-after.json), [rollback rehearsal](target-index/rollback-rehearsal.json), [actual-checkout aggregate](target-index/actual-checkout-checks.json), [15-second runner smoke test](target-index/browser-soak-smoke.json). The real-time ten-minute result is recorded separately below; the 15-second smoke test and the earlier 900-simulated-second soak are not substitutes for that wall-clock session.


The **real-time browser soak passed in 600.02 wall-clock seconds**, using the actual integrated checkout at `9c4d562`. Native requestAnimationFrame and speed 1 drove twelve 50-second matches; there were eleven real New battle restarts, twelve five-second pause/resume cycles, and four high-population matches using twelve injected ordinary waves. No manual `update`/`frame` calls or accelerated clocks were used. Each pause advanced simulation time by exactly zero. Match-end simulation clocks ranged from 44.88 to 45.12 seconds, consistent with five seconds paused during each 50-second match. All sampled states were finite, the grid was active during reinforced matches, and no early victory shortened a match.

Forced-GC JavaScript heap ranged from 2.30 to 3.69 MiB across baseline, normal and reinforced samples. The final normal match retained only 0.097 MiB more than the warmed second normal match. Aggregate Chrome-process RSS rose 15.88 MiB over that comparison, with normal match-end RSS approximately 1,100–1,103 MiB after the early stress warmup; its later values largely plateaued. Summed process RSS can count shared pages multiple times and is not the app's unique physical memory or a direct GPU-memory measurement. The observer recorded 36,003 native frame callbacks; this is not a guarantee of display presentation or physical-device FPS.

All 604 created oscillator/gain nodes disconnected, the runtime error list was empty, and final cleanup confirmed Chrome disconnected and the loopback server closed. The source-file SHA-256 receipts still match the actual checkout. All 229 preexisting user-file fingerprints were reverified after the real-time run. This ten-minute wall-clock session is separate from the earlier 15-minute simulated Node soak and from the 15-second runner smoke test.

Real-time evidence: [full browser wall-clock run](target-index/browser-wall-soak.json), [summary](target-index/wall-soak-summary.json), [integrated payload sizes](target-index/payload-integrated.json). This pass closes the earlier lack of a sustained wall-clock browser test; physical mobile devices and direct GPU-memory attribution remain untested.

The actual game checkout is locally integrated and tested. The current code commit is `9c4d562`; the final report/evidence commits are local as well. Rollback remains anchored at `codex/kingdom-pre-integration-2026-10-14`. No push or deployment occurred, no user changes were committed, and no execution blocker remains.
