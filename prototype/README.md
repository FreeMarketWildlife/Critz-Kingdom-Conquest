# Critz Kingdom Conquest — gameplay prototype

Run from the repository root:

```sh
python3 -m http.server 8765 --directory prototype
```

Open http://localhost:8765. No dependency installation or build required. Optional web fonts fall back to system fonts offline.

## Play

You start as Vesper in mid lane, at gameplay zoom. Nine other Conquerors use bots. The first minion wave reaches you immediately; subsequent waves spawn every 25 seconds for faster prototyping.

- **Right click ground:** move with pathfinding. **Right click an enemy:** approach, attack, and keep attacking that target.
- **Q / W / E / R:** cast toward the cursor. Q is a projectile for Vesper, Skyrend and Riptide; W attacks nearby enemies; E dashes (or heals Mossback); R has a delayed area strike. Hover ability buttons for details.
- **A, then left click:** attack move. **S:** stop, including cancelling an attack windup.
- **Space:** center and lock the camera. **Y:** toggle camera lock. **Arrow keys:** pan. **Scroll:** adjust gameplay zoom.
- **F:** Flash toward the cursor (25-second prototype cooldown).
- **B:** channel a four-second recall. Moving or taking damage cancels it. Your fountain heals and restores mana.
- **Shop button:** buy damage, health or speed upgrades at your base with bells.
- **Conquerors button:** switch to one of five original animal characters. Spectator mode is optional; playing is the default.
- **Minimap:** left click to look; right click to command movement across the map.

Gold outlines on enemy minion health bars mean your next basic attack can last-hit them. Only the killing blow earns bells and creep score (CS); nearby enemy deaths grant experience. White/gold numbers show your damage. Basic attacks have windup, projectile travel, recovery, and a readiness meter beneath your overhead mana bar.

## Battlefield

Three lanes join southwest and northeast bases. A northwest-to-southeast river divides the kingdoms, crossing mid lane. Solid forest/rock islands shape four jungle quadrants, with eight neutral camps and two major objective pits: Dragex at Mount Yokai and Moana at Morane Bay. Navigation uses a grid search with path smoothing; terrain, pit walls, and live structures block walking and dashes. Flash can cross terrain. Mobile units separate rather than fully overlap.

Each lane has three watchtowers per team plus a Barracks. Destroy the outer towers before inner structures; a destroyed enemy Barracks opens the Castle and enables siege reinforcements. Towers prioritize minions unless you attack an enemy Conqueror under them. Objective kills grant a temporary kingdom buff.

## Game feel

Close locked camera, directional character art, animated paws/tails/wings and attack swings, moving river highlights, splash footsteps, projectile trails, cast telegraphs, impact particles, floating damage and bell rewards, hit flashes, camera impact, generated combat sounds, mana and cooldowns, levels, last hits, recall and a small shop.

## Scope

Local 2D canvas prototype, not online multiplayer or an Unreal project. Original placeholder art and provisional abilities. No fog of war, ranked system, account service, or production balancing. Brush is visual; it does not conceal units. Lane Kingdom selection is not yet implemented. All abilities are available at level one for testing.

## Validation

With Node.js installed:

```sh
node prototype/simulation.test.cjs
node --test prototype/runtime.test.cjs
```

The simulation harness checks close-camera startup, movement, collision routing, terrain-blocked dash, attack windup and projectile last hits, skillshot/cooldown/mana behavior, structure protection, boss buffs, death/respawn, sustained simulation, render caching, victory, and restart. Browser QA covers the visible layout and controls.

The runtime regressions cover death/level-up interactions, recall cancellation, Flash, restart and focus state, collision equivalence, repeated navigation, render bounds, terrain reuse, and audio connection cleanup. Fixed-seed CPU and memory checks run with:

```sh
node prototype/benchmark.cjs
node --expose-gc prototype/soak.cjs
```

Optional browser checks require Playwright and Chrome. They create a temporary browser profile, bind an ephemeral port on `127.0.0.1`, and verify the offline font fallback:

```sh
node prototype/browser.test.cjs
```

Set `KINGDOM_PLAYWRIGHT_MODULE` to an installed Playwright module path if it is outside this repository, or `KINGDOM_BROWSER_EXECUTABLE` to another Chromium executable. An optional first argument points to a baseline prototype directory for pixel comparisons. `KINGDOM_QA_OUTPUT` enables screenshots. Measurements and the optimization handoff are in [the runtime report](../technical/2026-10-14-runtime/REPORT.md). This static prototype has no compilation or bundling step.

## Design reference

The topology and combat priorities are informed by Riot's [How to Play](https://www.leagueoflegends.com/en-gb/how-to-play/) and [2024 Map Changes](https://www.leagueoflegends.com/en-sg/news/dev/dev-season-2024-map-changes/): distinct lanes, neutral jungle, defensible structures, and meaningful jungle/river approaches. Art, character names and implementation are original to this prototype.
