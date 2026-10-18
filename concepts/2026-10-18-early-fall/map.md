# Spring of Life battlefield — map proposal, 18 October 2026

**Status: new design proposal. All distances, statistics, timings and balance targets below are untested.** Read `map.svg` alongside this document. This is an arena schematic, not a canonical survey of Hokkaido. The proposal uses original terrain and objective mechanics; no League characters, monsters or assets are imported.

## Evidence and era boundaries

Read: Dragex `AGENTS.md`, `canon/author-confirmed.md`, `timeline/seven-ages.md`, `world/libriam.md`, `books/moanas-tear-frame.md`, `world/allohim-and-cosmic-creation.md`, `research/drive-2026-10-11/conflicts.md`, `world/hokkaido-geography-and-ages.md`; Kingdom Conquest `ideas/00-master-vision.md`, `00-vision-and-lore.md`, `03-world-and-inspirations.md`, `04-minion-waves-and-kingdom-towers.md` and Lincoln's notes.

**Preserved decisions:** land battlefield; five players per side; Top, Mid, Bot, Support and Jungle assigned before match; any Conqueror may take any role. Top/Mid/Bot determine their respective lane's kingdom towers and affiliated minions; Support/Jungle do not. Mount Yokai/Dragex is the top association; Morane Bay/Moana the bottom. Currency is **bells**, although the task called the economy gold. Tier 1: three melee plus three ranged, exits outermost tower gates at 1:00 and every 30 seconds. Tier 2 leaves Barracks every third wave; Tier 3 comes from Castle when enemy Barracks falls. First-generation Conquerors personally drank river water.

**Continuity issue requiring an eventual author choice:** Dragex's sleep beneath Mount Yokai begins Age 2; Moana is bones by approximately halfway through Age 2. The blood-drinking follows the Fey catastrophe, whose last active fighter ends Age 2. Neither live boss fighting nor a precise “first 20 years of Age 2” fits safely without clarification. Use the user's **first approximately 20 years after the first drinking** as this concept's working era, with no calendar conversion or assertion that the era begins Age 2. Keep the historical landscape associations, and use the **match-only trials below as proposed gameplay abstractions**, never new events in the novels. They neither wake Dragex nor resurrect/kill Moana. If literal living dragons are essential, author approval of a distinct framing or historical mode is needed. Morane/Morain remains an archival spelling variant; this package uses the KC spelling Morane.

No restored Kingdom of Moana, advanced arcane machinery, humans, industrial fortifications or future-era cities are placed here. Camps are rough animal gathering places and watchtowers timber/stone works by newly formed alliances. Early construction speed and availability of medieval equipment are user-authorized art/game assumptions, not a canon history of metallurgy. Blood is a quiet river tint; no combat statistic assumes a new dose grants repeat permanent mutation.

## Shape, scale and movement

The original **north–south river spine** makes the first-drinking story central. Teams begin west and east, making the mountain at top and bay at bottom readable without implying these exact match coordinates describe continental geography. Three bowed east–west lanes cross the spine at a high ford, a broad central ford and a tidal causeway. Mirror combat geometry east–west; terrain art may differ. Top/Bot lane naming describes screen placement, not globe latitude.

| Dimension / traversal | Initial proposal and purpose |
|---|---|
| Playable rectangle | 240 × 200 game metres; metre is a combat unit, not world survey scale |
| Baseline walk | 6 m/s; radius 0.65 m; camera shows approximately 42 × 28 m |
| Castle to Castle lane distance | Mid 210 m / 35 s walking; Top and Bot 276 m / 46 s |
| Outer gate to first wave clash | Mid 36 m / 15 s at 2.4 m/s minion speed; side lanes 43.2 m / 18 s |
| Base return after recall | 8 s interruptible recall, 6 s heal/shop target, approximately12 s Mid /16 s side lanes from Castle to outer; total recall/heal/walk cycle26 s Mid /30 s sides, excluding any separately measured Base approach |
| River rotation | Mid crossing to either objective entry 48 m / 8 s; objective to objective 108 m / 18 s |
| Lane / ford widths | Mid 14 m, side lanes 12 m; each ford 14 m; no forced single-file crossing |
| Jungle entrances | 8 m; each objective has two 10 m entrances and an open 14 m river frontage |
| Cover / sight | Sight 20 m; cover patches 6–10 m long, separated by 5 m visible gaps; no cover within 8 m of objective capture circle |
| Heights | Cosmetic 0–3 m; never hidden attack modifiers; walls use visible collision edges |

SVG geometry is diagrammatic; path lengths above are implementation targets, not pixel measurements. A 100 m scale bar communicates intended relative scale only. Build a greybox with actual path measurements before accepting timings.

## Routes, towers and spawning

Each lane has two watchtowers per side: outer and inner, then a Barracks; Castle has two short-range gate defenders. Destroy the lane's outer before inner; inner before Barracks. The first destroyed Barracks permanently exposes Castle gate defenders; both defenders must fall before Castle damage is permanently unlocked. Rebuilt Barracks never re-shields targets; gate defenders never rebuild. Existing rams continue after recovery, which stops future departures only. Other lanes remain optional routes. This gives clear local goals without requiring every structure to fall.

**Spawn fallback proposal:** Tier 1 comes from outer tower until destroyed, then the surviving inner, then Barracks, then Castle. The gate's visual army identity remains the assigned lane kingdom. No phantom spawning from rubble. Fallback gates preserve army production and concentrate defenders near surviving structures as the siege moves inward; they increase travel to the former outer frontline. Their comeback value requires measured frontline geometry, not a presumed faster reinforcement time. Tier 2 departs Barracks at the confirmed third-wave time and walks physically at 2.7 m/s to follow and eventually catch Tier 1; catch-up near the gate is not guaranteed because both depart simultaneously; do not teleport it into formation. Suggested Tier 2 cannon replacement for this era is a **wooden stone-sling carrier**; cannon is in existing notes, so this is a labeled era variant awaiting approval. Tier 3 is an unpowered battering ram at Castle every third wave while the enemy Barracks is down; 180 s Barracks recovery after destruction, no Tower regeneration. Its recovery prevents indefinite unattended lane pressure.

Starting tower spec for economy-agent alignment: outer 3,600 HP; inner 4,400; gate 3,200 each; Castle 6,000. Tower radius 11 m, attack every 1.1 s, 150 physical damage with +25% per consecutive hit against the same Conqueror (cap +100%, resets after 3 s). Damage order: attacking Conqueror threatening an allied Conqueror, then siege minion, melee, ranged. Warn target for 0.6 s before first shot. Without attacking lane minions within 13 m, structures take 70% reduced damage; no reduction once a wave arrives. Defensive advantage should reward wave setup while leaving dives possible. Tower faction silhouettes cannot change range, collision or targeting unless a separately costed, mirrored rule is approved.

## Neutral spaces and objective choices

Ordinary camps represent sparring/foraging contests with wild creatures, not compulsory canon deaths. Four camps per team, plus two river lookout posts shared between teams. Suggested first camp at 0:40; respawn 90 s after clear; ordinary clear time 9–12 s at level 1. Full first circuit including travel targets 60–75 s. Safe camps sit 24 m behind outer towers, aggressive camps 18 m from river entrances. Over-invading costs a lane rotation and exposes the invader to two exits. Economy alignment: each ordinary camp pays 70 bells and 160 base XP. Jungle uses the systems document's explicit XP modifier; four camps with9–12s clear plus90s respawn yield164.7–169.7camp bells/min before routing losses, or284.7–289.7with passive. Longer-clearing kits earn less. Camp HP begins450 in RULES-CLARIFICATIONS.md and remains an untested tuning input. The systems sheet's 335 movement units/s corresponds to 6 combat m/s here (55.833 units per metre); map distances use metres consistently.

| Objective | Schedule / rule | Reward / counterplay |
|---|---|---|
| River lookout posts | Activate 2:30; two posts, one above and below Mid. Stand in 3 m circle uncontested for 5 s; cooldown 90 s after claim | Reveal an adjacent 20 m river segment for 45 s; no bells or XP. Enemy presence pauses claim; ownership visible to both teams. Gives information without multiplying a lead into income |
| **Moana-associated Tidal Offering** at Morane Bay | First 5:00; respawn 4 min after resolution. Move three exposed driftwood offerings from 12 m out to circle; carrier slowed 15%, cannot attack, drops on damage; 6 s uninterrupted final communal channel | Team gains one **provision crate**: each living player may consume once for 8% max HP over 8 s out of combat; expires 120 s, no stacking. 80 bells to each player, no permanent elemental stacking. Two shore entrances plus open river allow interception. Cannot be completed by stealth while carrying an offering |
| **Dragex-associated Obsidian Vigil** below Mount Yokai | First 12:00; respawn 5 min after resolution. Three marked rock seals require two allied Conquerors within 5 m of different seals for 10 total contested-free seconds; progress decays after 3 s absence | Three-minute **Siege Resolve**: nearby lane minions within 12 m of a carrier take 20% less structure damage; no Conqueror damage/health bonus. 120 bells each. Icon and timer visible; requires escort and can be answered by waveclear, flanks or opposite-lane pressure. Not Dragex's living body or a weapon powered by captured magic |

Objective preparation uses publicly announced 60 s and 15 s warnings. No random spawn order or hidden permanent buffs. These trials are an alternative early-era implementation of the already requested boss associations, not silently confirmed replacements. If the author keeps actual bosses, reuse the terrain but design their encounter separately after resolving continuity.

## Match flow and comeback

**Target match duration: 24–30 minutes; no guarantee before testing.** At 0:00–1:00, buy/choose routes and scout; first clashes 1:15–1:18. At 2:30 information control becomes available; 5:00 bottom objective creates the first meaningful cross-map choice. Outer towers should typically fall 7:00–11:00. At 12:00 top objective supports coordinated sieges; Barracks pressure should begin 16:00–21:00. After 24:00, minion damage to structures rises 5% every minute to a 30% cap, visibly announced, equally for both sides. This breaks late stalemates through waves rather than unavoidable global damage.

A team losing the top trial can take a bottom provision, invade an exposed camp or push the far lane. Neither objective directly destroys structures. Back-to-back objectives are separated by at least 18 s walking plus capture work, so a winning fight is not automatically both rewards. A defending team has short hero travel to its surviving inner defenses, fallback gates, recoverable Barracks and unclaimed safe camps. No automatic team-wide comeback buff: bounty economy should reward an actual takedown or risky objective, as specified in the economy proposal. Gold difference alone never reveals hidden enemies or changes hitboxes.

**Anti-stall constraints:** defenders cannot freely rebuild towers; a Tier 3 ram must be escorted; Castle does not rapidly regenerate in combat. **Anti-snowball constraints:** no infinitely stacking dragon reward, no permanent movement acceleration for winning objectives, no objective buff on Conqueror combat damage, and no repeat reward for farming an already destroyed tower.

## Readability and tactical response

Riot's primary-source [Clarity in League](https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/) explains recognition through silhouettes, meaningful visual hierarchy and minimal noise. Apply those principles here: Castle square, Barracks pentagon, towers circles, neutral objectives diamonds; both team tint **and** shape/banners convey ownership. Thin ambient blood veins must never look like attack telegraphs. Terrain remains low-contrast beneath units. Red blood cannot be the only enemy cue; offer colorblind palettes. Large area attacks have persistent borders matching hitboxes. Important channels receive the strongest visual/audio hierarchy, not decorative river magic.

Riot's [Champion Counterplay](https://www.leagueoflegends.com/en-us/news/dev/quick-gameplay-thoughts-may-14/) describes useful opponent responses at tactical and strategic scales. Here, a warded front can be flanked through two approaches; a grouped capture can be traded for a lane; a river-speed Conqueror can be forced to fight on dry crossings. Proposed innate water affinity is capped at +8% river speed and never stacks with a separate river-speed passive; confirmed individual abilities such as Spinosaurus need their own tuning. Flight must land before objective interaction and cannot cross the external map boundary; wall bypass stamina is still a proposal. Magic remains allowed; this ban concerns futuristic/arcane technology, not innate ability.

## First greybox tests and decisions

1. Run mirrored traversal checks: identical first-clash timing within 0.25 s, outer gate distances within 0.5 m, equally reachable objectives and sightlines. Swap sides with identical teams.
2. Play at least ten exploratory 5v5 matches, record lane arrival, first death, first tower, objective trade, match duration and full team bell differences every 2 min. These are diagnosis matches, not statistical proof of balance.
3. Compare side win rate and objective conversion only after a larger sample; flag early sample bias. Watch whether 5:00 offering forces every Bot rotation, whether top trial is ignored, and whether safe fallback gates make sieges too slow.
4. Test accessibility at intended gameplay zoom: silhouette identification, projectile-edge accuracy, cover occupancy and objective channel interruption. Review water affinity and flying matchups on dry versus river routes.
5. Pending author choices: literal boss chronology/framing; exact early-era geographic footprint; Morane spelling resolution if desired; Tier 2 cannon versus sling era variant; fallback gate policy; exact Tower categories. None blocks reviewing this explicitly labeled concept.

## Second-pass clarifications

`RULES-CLARIFICATIONS.md` resolves objective recipients/contesting, permanent Castle unlock, numerical minion/camp blocks, tower cadence/ramp and anti-stall formula. Hero return distances above are Castle-to-outer geometry targets; Base-to-Castle approaches must be measured separately rather than assumed. The camp-rate ceiling includes clear time, and a first60–75s circuit does not imply that repeatable farming rate. These remain untested proposals.
