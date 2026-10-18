# Second-pass rules and numerical inputs

**New, untested proposals — 18 October 2026.** This supplement resolves ambiguities identified by independent desk review. It takes precedence over looser wording in the initial map/systems narrative. No source canon, existing roster or prototype code is modified. No result below is a playtest result.

## Objective ownership and interruption

All five teammates receive the stated80/120 bells on capture, including dead players. Both trials give **zero XP**. Only teammates alive at capture receive a non-transferable provision or Siege Resolve carrier buff; dead teammates receive no delayed copy. Provision: once per recipient, expires120s after capture, heals8% max HP over8s, usable after8s without dealing/receiving enemy-Conqueror damage. Such damage cancels remaining provision healing. Trial carrier buff expires180s after capture or on death; multiple carriers never stack the20% minion structure-damage reduction. Aura radius12m; it does not reduce damage from Conquerors or camps.

An enemy Conqueror inside the marked8m objective contest zone freezes progress. Damage or hard crowd control to a channeling participant resets that participant's uninterrupted channel. Tidal Offering needs three individually carried driftwood pieces: each carrier picks up one at a time, walks it from12m outside to the circle, cannot attack, moves15% slower, drops it on enemy damage, and cannot fly or dash while carrying. A piece already delivered remains delivered for either side to contest; pieces are neutral, not stored team progress. Final capture needs at least one ally channeling6 uninterrupted seconds with all three pieces present and no enemy in contest zone. Contest does not hide its progress from either team.

Obsidian Vigil has three available seals; **any two distinct seals** need two different allied Conquerors within5m for10 uninterrupted seconds. One player cannot satisfy both. Enemy presence freezes progress, and absence from either occupied seal for3s decays progress at2s per second. Damage/CC to either participant resets that participant's channel; full10s simultaneous occupancy is required for capture. One team cannot bank a solo channel then finish safely after retreating. These are match abstractions, not literal dragon rituals established in Dragex history.

## Structures, recovery and damage timing

First enemy Barracks destruction permanently unlocks gate defenders. Both gate defender deaths permanently unlock Castle damage. Gate defenders never rebuild; recovering Barracks never re-shields gates/Castle. Barracks rebuild after180s, ending future Tier3 departures; already spawned rams remain until destroyed. No rebuilding structure pays another economic reward.

Watchtowers:11m range,150 physical damage,1.1s interval between shots. First shot begins after0.6s visible targeting warning; that warning is part of the initial shot timing, not an additional delay on every shot. Same-Conqueror consecutive-hit ramp is+25 percentage points per hit after first, capped+100%. It resets when targeting another unit or after3s without a hit on that Conqueror. Leaving range does not instantly erase the recorded ramp. Minion shots never build the Conqueror ramp. Gate defenders use40armor/25spirit,8m range,130 physical damage,1.1s cadence, the same warning/ramp; these are new complete initial values.

If no attacking lane minion is within13m, structures take70% reduced damage. Castle/gate unlock is independent of this backdoor reduction. Unit-target priority remains in map.md. Collision and range must use standardized gameplay bounds, not decorative ladders or banners.

Anti-stall multiplier for lane-minion outgoing structure damage only: `1 + min(0.30, 0.05 × floor(max(0, t−24)))`, with t in match minutes. First+5% at25:00; cap+30% at30:00. It applies symmetrically, is publicly announced, and does not alter Conqueror damage or objective rewards.

## Initial minion/camp combat blocks

These inputs enable a later greybox/replay; they do not validate the claimed clear or match-duration targets. Every faction uses identical blocks. The ten artworks show one representative minion per faction; visible ranged/casting variants for the confirmed3-melee/3-ranged waves remain production work.

| Unit | HP | AD / attacks per second | Armor / spirit | Range | Speed | Extra rule |
|---|---:|---|---|---|---|---|
| Tier1 melee | 320 | 18 /0.9 | 0/0 | 1.2m | 2.4m/s | Ordinary melee weapon/body attack |
| Tier1 ranged | 220 | 14 /0.8 | 0/0 | 7.5m | 2.4m/s | Visible slow projectile or plainly innate casting animation required |
| Tier2 siege | 650 | 28 /0.6 | 10/10 | 10m | 2.7m/s | Unpowered stone-sling era variant;3 bells; not cannon canon replacement |
| Tier3 ram | 1,400 | 55 /0.4 | 15/15 | 1.8m | 2.2m/s | Structure damage×2; cannot attack Conquerors; replaces Tier2 every third wave while opposing Barracks down |
| Ordinary neutral camp, one encounter | 450 | 16 /0.8 | 0/0 | 1.5m | 2m/s | 70bells/160baseXP; first0:40;90s respawn after clear |

Lane minions prioritize nearest attacking enemy lane minion, then nearest enemy structure; retaliate against a nearby Conqueror who damages their allied Conqueror within6m, without chasing more than8m from lane path. Retaliation ends3s after the last such damage. Minions do not grant allied collision advantage: use0.35m radii and local avoidance; multiple factions cannot create hidden pathfinding walls. HP/AD gain+3% per complete minute after3:00, capped+60%; armor/range stay fixed. This is separate from late anti-stall structure scaling; test combined effects before retaining both.

Camp leash circle is10m around spawn. Leaving it for2s resets encounter, returns to spawn and restores health over3s; no reward without a clear. The reset state is visible. Reward belongs to killer; camp XP splits locally using the specified sharing formula. Jungle contract multiplier applies only to its owner, not all nearby allies. No camp attacks outside leash, attacks through walls or invisible healing while actively engaged. The neutral-only450 execution can clear one such starting camp, so opening route tests must account for its90s cooldown and zero travel-time benefit on that first clear.

A reference physical kit may target9–12s unassisted clear; weaker caster/support kits can take longer. The camp450HP input, level1 abilities and attack cadence must be simulated rather than assuming all species meet the target. Subsequent camp tiers, pattern variety and objective combat are future tuning work. An initial60–75s circuit is not a repeatable60–75s income cycle because respawn follows clear completion.

## Item recipes and totals

Components are consumed on completion. Final listed stats replace component stats; they are never added twice. Total price remains the catalogue price, and combine payment is total less owned consumed components. One component cannot contribute to two recipes. Buying a finished item directly pays its full total.

| Finished item | Recipe | Combine payment | Total |
|---|---|---:|---:|
| Marcher's boots | Leather boots | 400 | 700 |
| Longbow/training kit | Iron edge | 900 | 1,800 |
| Duelist harness | Iron edge + padded vest | 600 | 1,800 |
| Hardened lamellar | Layered vest | 900 | 1,800 |
| Insulated cloak | Layered vest | 900 | 1,800 |
| Wayfarer's discipline | Disciplined cord | 900 | 1,800 |
| Field medic satchel | Padded vest + meditation cord | 900 | 1,500 |

Nominal stat-value ratios83.6–93.1% for the four comparable finished items are cost anchors, not a claimed efficiency target or proof they are fairly priced. Spell-mana/medic utility cannot be equated without a benchmark. Keep these prices until practical damage/survival/healing comparisons exist; do not increase stats merely to meet an arbitrary percentage.

## Bounty bookkeeping and catch-up

A victim's streak score is kills+0.5assists since its most recent death. Death resets that score. Lifetime earned bells include passive, contract, farm, kill and objective rewards, excluding400 start, sales refunds and undo reversals. Compare to connected opponents' median lifetime earned bells. Shutdown eligibility requires score≥2 and lead≥600. Bonus is `min(300, floor(50×score + floor(lead/200)×25))`, attached to the **victim**, paid on its next enemy takedown.70% goes to killer and30% to one equally split assist pool; without assists all goes to killer. Disable new shutdown eligibility while any opponent is disconnected, to avoid manufacturing a lead through a disconnected comparison. Existing posted bounties remain visible and do not grow during that interval.

Repeated-death base reduction is triggered by an enemy takedown death with no intervening kill/assist:200,175,150,125, then100minimum. A kill or assist resets its future base to200. No economy reward from self/friendly kills or summons.

The optional15% catch-up XP rule remains **disabled in the first greybox ruleset** until abuse tests exist. Public shutdown bounties, recoverable Barracks, continued army production, exposed-lane trades and no death bell loss already provide contestable recovery levers. Removing the undefined XP budget avoids silently implementing invisible rubber-banding. The objective bounty after8min remains a separate explicit experiment with public marker, one payout per team per4min, and no automatic damage/health changes.

## Readiness

These corrections make the concept more concrete, but do not make it an implemented or balanced game. Still measure route distances, camp clear logs, formation catch-up, minion/tower exchanges, first ultimate, objective contest frequency, item effectiveness and late siege conversion. Keep new additions separate from author-approved lore. See the two SECOND-PASS reports for findings and their disposition; corrected lines in the main documents supersede the earlier reviewed text.
