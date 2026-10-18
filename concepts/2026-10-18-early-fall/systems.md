# First Bloodwater: economy, combat and progression proposal

Prepared 18 October 2026. **Design specification, not implementation. All new numerical values are untested proposals.** Intended for the first approximately twenty years after the Fey battle and animals' first bloodwater drinking, as requested for this concept pack. This is a local game setting assumption, not a newly dated event in Dragex canon. No repository gameplay was changed.

## Evidence and boundaries

**Author decisions preserved:** `ideas/00-master-vision.md` establishes bells, individual named animal Conquerors, basic/passive/Q/W/E/R, and political minion associations. `ideas/04-minion-waves-and-kingdom-towers.md` establishes five players, Top/Mid/Bot/Support/Jungle selected before the match, any Conqueror in any role, Top/Mid/Bot Conquerors setting their respective lane kingdoms, and Support/Jungle not changing them. Tier 1 is three melee plus three ranged, starting 1:00 every 30 seconds from outer watchtower gates. Tier 2 departs the Barracks every third wave; Tier 3 departs the Castle after an opposing Barracks falls. Castle is the final structure.

**Prototype observations, not author-approved balance:** `prototype/play.js:39,52–58,196` starts heroes at level 1 with zero bells, 450 mana; gives 21 bells per melee, 14 per ranged, 60 per siege, 180 per hero kill and 300 per boss kill; nearby heroes each receive 35 XP per ordinary kill or 100 per hero; level threshold is current level ×140, with +90 max HP and +6 damage per level; mana costs 35/55/45/100 and cooldowns 4/7/9/22 seconds. Shop purchases repeat: blade 120/+18 damage, armor 100/+200 HP, boots 80/+25 speed. This offers a playable demonstration but has no item-slot or movement stacking budget. `prototype/game.js` contains five demonstration kits; their presence is not evidence of finalized roster canon.

**Canon guardrails:** Dragex `AGENTS.md`, `canon/author-confirmed.md`, `timeline/seven-ages.md`, `world/libriam.md`, `books/moanas-tear-frame.md`, `world/allohim-and-cosmic-creation.md`, and `research/drive-2026-10-11/conflicts.md` were consulted. Fey blood reaches animals after the last fighter dies, at the Age 2/3 boundary; surviving Fey elsewhere remain. Archaíos personally drinks as a first-generation animal. The global world is Libriam; Hokkaido is a continent. New kingdoms, traders, law and abilities below are proposals, not recovered history. Do not equate “twenty years after the Fall” with twenty years after Age 2 began: this pack anchors to **first drinking**, pending Phil's terminology confirmation.

**Equipment conflict preserved:** existing Tier 2 calls for a cannon-bearing critter. For this requested early medieval pack, propose a timber sling or small torsion stone-thrower instead. This is an explicit era variant needing Phil's decision; it does not delete or retroactively change the cannon specification. Innate animal magic is allowed. Shop objects are mundane gear; they have statistical game effects without establishing powered magical weapon technology.

## Design target and pacing

Propose 5v5, target median match 24–30 minutes, broad 22–35 minute range. A match compresses battles between emerging river communities, not twenty years of literal history. Bells are the single spendable match currency; “gold” is only the generic design category. Do not add a second gold wallet. Propose cast/hammered bronze bells as standardized payment tokens and practical signals; their origin and adoption are optional fiction.

| Match time | Intended decision | Expected milestone, to test |
|---|---|---|
| 0:00–1:00 | Starter purchase, role route, scouting | First neutral camps 0:40; confirmed lane departure 1:00 |
| 1:00–5:00 | Last hits, small trades, first recall | 65–75% CS laner buys a 900-bell component around 4:00–5:00 |
| 5:00–10:00 | Contest one river site or trade opposite-side pressure | First 1,800-bell finished item around 7:00–9:00; outer tower around 7:00–11:00 |
| 10:00–18:00 | Rotate lane kingdoms, expose inner towers | Second finished item 14:00–17:00; Obsidian Trial unlocks 12:00 |
| 18:00–28:00 | Barracks, side-lane decisions, Castle assault | Level 13–15; 3–4 completed items including boots |
| 28:00+ | Strong siege windows resolve stalemates | Continued wave scaling, the stated siege-objective respawn; no arbitrary instant-loss timer |

These are hypotheses, not promised balance. Map target is240×200 combat meters, with Mid clash around1:15 and side lanes1:18. Longer lanes must not punish Top's first purchase beyond Mid by more than about 30 seconds without a compensating safety/XP benefit.

## Income and waves

Retain the confirmed 30-second departures. Proposed Tier 2 quantity **one** each third wave. After outer destruction, Tier 1 departs the next surviving allied watchtower's gate on the original schedule; after all lane towers fall, use Barracks gate, then Castle if Barracks falls. This resolves the destroyed-spawner question as a proposal. Tier 2 physically travels from Barracks; its proposed 2.7 m/s speed versus Tier 1 at 2.4 m/s permits eventual catch-up, not a guaranteed join near the outer gate. A 20 m Barracks-to-gate gap needs 66.7 s to close, so initial formation may remain separated; preserve simultaneous departure and test route geometry rather than teleporting or quietly departing early. Never spawn soldiers behind an enemy without visible travel.

| Source | Proposed bells | XP pool | Notes |
|---|---:|---:|---|
| Tier 1 melee ×3 | 20 each | 55 each | One small bell cluster, compact shield/weapon |
| Tier 1 ranged ×3 | 15 each | 35 each | Distinct narrow silhouette |
| Tier 2 every third wave | 45 | 90 | Three larger visible bells; mechanically mundane siege implement |
| Tier 3 every third wave while enemy Barracks down | 60 | 120 | Replaces Tier 2 on that lane; one engine, not an added army |
| Neutral ordinary camp, whole camp | 70 | 160 | Four camps on each half; first 0:40,90-second respawn after clearing |
| Hero takedown | 200 killer + 100 assist pool | 120 + 20 × victim level | XP shared locally; assist pool split equally, not copied per participant |
| Outer tower | 100 each teammate +100 local pool | 0 | Total team injection 600 |
| Inner tower | 80 each teammate | 0 | Total 400; no farming towers repeatedly |
| Barracks | 50 each teammate, first destruction only | 0 | Economic reward smaller than strategic siege reward |
| Castle | Victory | 0 | No spending after victory |

Passive income starts 1:00: **2 bells/second =120/minute** for every living or dead player. No passive XP. Start **400 bells**. Lane last hit owns its bell reward; no friendly denies, no loose collectible coin race, no rewards for damaging a minion without finishing it. Nearby XP does not require the last hit. No income for killing friendly summons or owner-created creatures.

A normal wave is 105 bells; a third wave is 150. Over a three-wave block, average =120/wave =240/min at perfect CS. **70% CS + passive =288/min**, excluding kills/objectives. At 10:00 there have been 19 departures (waves 1–19), 6 Tier 2 units: 2,265 possible lane bells. With 70% collection, 1,080 passive and 400 start, lifetime income ≈3,066 bells. At 20:00: 39 waves, 13 Tier 2, 4,680 possible; 70% +2,280 passive +400 ≈5,956. Arrival and recall losses shift these down; these are departure-budget ceilings, not observed income.

For a reference kit clearing in 9–12 s, a particular camp pays again after 99–102 s because its 90 s respawn begins after clear completion. Four 70-bell camps therefore yield at most 164.7–169.7 camp bells/min, or 284.7–289.7 including passive, before travel/recall losses. The earlier 306.7 rate was a zero-clear-time bound, not a plausible route. Other kits can clear more slowly; invading increases income at an explicit positional risk. No opaque farm penalty is initially needed. All species use the same free Jungle contract, which grants only the XP multiplier below and a clearly signaled neutral-only execution action (450 damage,90-second recharge, no hero damage). Camp timers become public only after allies witness a clear; objective respawns always public.

Support gets a free role contract at draft regardless of species: while within 900 units of an ally, earn **18 bells every 10 seconds**, but only for the first 10 minutes (**1,080 cap**). Last-hitting more than 3 lane minions in a rolling minute suspends contract accrual for 30 seconds; it never reduces ordinary last-hit rewards. At 10 minutes, contract becomes **+60/min** uncapped proximity income. This deliberately lowers marginal income to 180/min including passive, 62.5% of a 70%-CS solo before assists; target is 60–75% after10, not the early75–90%. At20 minutes, maximum support lifetime income is4,360 versus solo5,956 (73.2%); utility-item access must be tested against this smaller budget. No proximity income in fountain or while dead. At ten minutes, 400 start +1,080 passive +up to1,080 contract =2,560 before assists: useful, below a competent solo farmer. Only one Support contract per team; role swaps require an out-of-combat base exchange and cannot reset caps. Jungle contract has no innate species bonus; any Conqueror can equip it.

## Shop and item budget

Propose purchases at Base only, alive or dead; delivery occurs immediately at Base or on respawn. Recall is an 8-second interruptible channel canceled by movement or enemy damage; returning takes map travel. Six inventory slots, boots occupy one, consumables stack in one. One boot item; one copy of each completed item. Selling returns 70%, potion 0%; undo allowed until leaving Base, dealing/taking damage or consuming an item. Components combine by paying the remainder; no double charge. Recommended role pages guide but never restrict species. Display total price, combine cost and final stats separately.

| Object | Price | Proposed effect | Explicit tradeoff |
|---|---:|---|---|
| Training knife | 300 | +10 attack damage | Aggression; less sustain |
| Padded vest | 300 | +120 HP | Survive trades; slower clear |
| Meditation cord | 300 | +18 spell power | Represents practiced innate casting, not a powered weapon |
| Water flask | 75 | 100 HP over 10s; max 3; damage pauses healing 2s | Sustain costs progression |
| Leather boots | 300 | +20 speed | Delays damage component |
| Marcher's boots | 700 total | +40 speed total | No attack stat; one pair |
| Iron edge | 900 total | +28 attack damage | Knife +600 |
| Layered vest | 900 total | +350 HP | Padded vest +600 |
| Disciplined cord | 900 total | +50 spell power | Meditation cord +600 |
| Longbow kit | 1,800 total | +40 attack damage, +20% attack speed | No range increase; only usable ranged attack animations if supported, otherwise name as training kit |
| Duelist harness | 1,800 total | +35 attack damage, +250 HP | Survive at cost of peak damage |
| Hardened lamellar | 1,800 total | +400 HP, +35 armor | Vulnerable to spells |
| Insulated cloak | 1,800 total | +350 HP, +35 spirit resistance | Vulnerable to physical attacks |
| Wayfarer's discipline | 1,800 total | +80 spell power, +200 mana | No defenses; mundane cord/cloak visual |
| Field medic satchel | 1,500 total | +250 HP, +10 haste, +10% healing/shielding applied to allies | No direct damage bonus; excludes self-sustain amplifier |

Initial item catalogue stays small. Never physically replace an animal's iconic silhouette with every bought item: the shop is abstract training/supply equipment, with major kit props preserved. Four damage items cannot give permanent crowd-control immunity. No resurrection item, unlimited boots, random critical strikes, lifesteal stacking or paid match advantage in first tests.

Efficiency calibration anchors, not a claim of equal power: 1 AD ≈30 bells, 1 HP≈2.5, 1 spell power≈16, 1 armor/resistance≈18, 1% attack speed≈20, 1 haste≈25. The current catalogue does not achieve a 105–115% nominal efficiency target; no such target is claimed. Nominal ratios are only initial cost anchors, not measured utility. Longbow is 88.9%, Harness 93.1%, Lamellar 90.6%, Cloak 83.6% using the anchors above. Mana and healing modifiers remain unvalued until measured comparisons exist. The illustrative prices above need a spreadsheet pass: e.g. lamellar is ~1,630 nominal stat value /1,800 price, deliberately conservative for multiplicative durability. Evaluate practical effective HP rather than forcing every item to the same abstract ratio.

## Stats and formulas

Use the same movement/collision footprint rules for all models of similar gameplay class; giant real species are stylized arena representations, not canon measurements. Initial ranges use combat units:335 units = 6 combat meters (approximately 55.833 units per meter). A 335-unit/s baseline is6.03m/s, matching the240×200m map. Spell/vision ranges must use this conversion before implementation.

| Archetype baseline, level1 | HP | AD | Armor / spirit | Speed | Range | Attacks/sec |
|---|---:|---:|---:|---:|---:|---:|
| Vanguard | 780 | 58 | 30/25 | 340 | 150 | 0.65 |
| Duelist | 700 | 62 | 25/25 | 345 | 175 | 0.70 |
| Innate caster | 600 | 48 | 18/25 | 335 | 500 | 0.60 |
| Ranged hunter | 590 | 56 | 18/22 | 330 | 550 | 0.68 |
| Warden/healer | 690 | 48 | 26/28 | 335 | 175–475 | 0.62 |

These are kit archetypes, **not role locks**. The same animal retains its baseline when selected as Jungle or Support. Per level add HP85 (vanguard95, ranged75), AD3, armor3, spirit2, mana25; max resource baseline350, regen5/sec, HP regen1.5/sec. Spell power starts0, haste0. Attack speed bonus stacks additively then multiplies base; cap2 attacks/sec. Movement bonuses add, soft cap420 (only50% of excess) then hard cap460 excluding explicitly timed movement skills. No permanent flight bypass of entire lane/kingdom defenses; proposed flying traversal needs visible launch/landing and limited duration.

Damage after nonnegative resistance R = raw ×100/(100+R). First test clamps resistance at0 after penetration; avoid negative-resistance burst while prototypes are immature. Effective physical HP = HP×(1+armor/100). Damage types are physical and innate magic/spirit; no true damage in initial generic item catalogue. Shields expire after3s unless kit says otherwise. Healing reduction is at most25%, one nonstacking effect with a clear icon.

Cooldown = base×100/(100+haste); generic item haste cap40 (28.6% cooldown reduction). Each kit declares AD/spell-power scaling and damage type explicitly. Starting basic spell test band60–90 damage, 8–12s cooldown, 35–60 mana; ultimate180–250 damage or comparable utility, 75–110s cooldown,100 mana. A 450-unit hard control should have ≥0.45s visible windup; hard control normally0.6–1.2s, combined continuous lock target≤2.5s. These are review constraints with explicit exceptions, not universal kit rewrites.

## Levels and skill ranks

Propose max level15. XP to advance from L to L+1 = **180+40L**, L1–14; total XP to15 =6,720. Level2 requires220; level6 cumulative1,500; level10 cumulative3,420. One wave is 270 XP, third wave 360, average 300. Solos collect full XP pool within900 units. For n nearby heroes, each gets pool×min(1.2,1+0.2(n−1))/n: solo100%, duo60% each, three40% each, five24% each. No duplicate full XP on every ally as in prototype. Kills and objective assists cannot grant XP across the whole map.

At ideal uninterrupted solo attendance, first six waves yield1,800 XP and reach6 near the third minute of contact; **too fast for the desired first ultimate at5–6 minutes**. Therefore **apply lane XP scalar0.65**, giving average195/wave and level6 on the eighth wave at ideal 4:45 Mid /4:48 sides (departure4:30 plus travel); the observed target after normal attendance losses is5–6minutes. Expected10-minute solo XP≈3,686 before kills/misses, level10; duo≈2,211 each, level7. This explicit arithmetic exposes tuning dependencies. Jungle camp XP receives0.75 scalar, then1.25 for the Jungle contract owner, capped to one contract: four 160-XP camps over 99–102 s yield 352.9–363.6 XP/min before routing losses, versus 390/min perfect solo lane. The zero-clear-time 400/min bound is not a plausible sustained route. No double use of lane and camp contract multipliers.

Skill point each level. Q/W/E max4 ranks; R max 3 at6/10/14. Fifteen total points exactly fill4+4+4+3. At level1 choose one basic; unlock other basics freely by allocating points. Basic rank ceiling:1 at1,2 at3,3 at5,4 at7. Training mode can recommend a path, never spend automatically without opt-in.

Death timer = **8+1.5L+0.3m seconds**, capped45; m is match minutes. At level6/minute6 ≈18.8s; level13/minute24≈34.7s. No bell loss on death. Respawn restores resources and expires ordinary temporary combat buffs. Map travel plus this timer is the strategic punishment; repeated deaths do not erase purchased gear.

## Objectives, comeback levers and anti-exploit rules

Coordinate names/locations with the map proposal. Objective rewards below apply to whichever river sites that map defines, not an invented permanent Libriam landmark.

- **Bottom Offering:** first5:00, respawn4:00, three exposed driftwood offerings carried from 12 m outside the circle, then a 6-second uninterrupted communal channel; carriers are slowed 15%, cannot attack and drop offerings on damage. Grants80 bells each teammate (400 total), plus one provision healing 8% max HP over 8 seconds, usable only out of combat; provision expires after120 seconds. Enemy presence contests capture. No permanent combat stats; an opposite-side camp/tower trade remains viable.
- **Top Obsidian Trial:** first12:00, respawn5:00. Two allies occupy different marked seals within 5 m for 10 uncontested seconds; progress decays after 3 seconds absent. Whole encounter including approach intended 25–40 seconds with 2–3 players. Grants120 bells each (600 team total) and180s minion-only siege protection: allied lane minions within 12 m (approximately 670 units) of a living buff carrier take20% less structure damage. Does not reduce hero damage, heal minions, or stack across carriers. Carrier buff ends on death; globally announce capture and show a visible icon. Counterplay: pick off carriers, clear waves before tower approach, or trade the Bottom Offering. Trial does not permanently alter bloodwater or establish a magical machine in canon.
- **Lookouts:** first2:30, provide the map's temporary vision only; no bells or XP. No second economy loop hidden in capture spam.
- **Barracks:** proposed3,200 HP, no attack,180-second rebuild. First Barracks destruction permanently unlocks Castle gate defenders; both gate deaths permanently unlock Castle damage. Gate defenders do not rebuild. Barracks recovery never re-shields either target and stops future Tier3 departures only; already spawned rams finish their route. Down state enables the confirmed Castle-origin Tier3 on that lane every third wave, replacing Tier2. Rebuild begins with visible60-second warning. Destroyed defenders still have normal waves; no permanent economy deletion.
- **Structures:** outer3,600HP/45armor, inner4,400/60, Castle6,000/60. Castle gate defenders are 3,200 HP each; both must fall after any Barracks is destroyed before Castle can be damaged. Towers have 11 m range and hit every 1.1s at 150 physical, ramp25% per consecutive hit on the same hero up to+100%; first hero hit does not one-shot. No attacking lane minion within 13 m gives structures 70% damage reduction. Backdoor attack is possible but inefficient. Damage/target lines must match actual range. Towers switch to a hero who damages an allied hero within tower radius, with 0.6s clear warning before the first shot. No guaranteed tower-diving immunity.

Comeback proposal: if a potential victim has ≥2 net takedowns since last death and ≥600 earned-bell lead over the opposing team's median, mark that victim with a public bounty **min(300,50×net takedowns + floor(lead/200)×25)** to the200-bell kill. Bounty resets on death; no bounty for being rich solely because an opponent disconnected. Victim kill base falls by25 after each death without takedown, minimum100, reset after takedown; this discourages repeatedly farming the weakest opponent. Bonus cap≤300 ensures one shutdown cannot erase all prior objective play. Assists do not multiply bounty:70% killer,30% assist pool, if no assists all killer.

When team earned-bell deficit≥2,500 and ≥10% behind after8:00, the next eligible enemy outer/inner structure kill grants an additional50/team member, maximum one bonus objective per4 minutes. The marker is public and requires contestable execution. No hidden rubber-band damage, health or aim bonuses. Optional XP catch-up is disabled in the first greybox ruleset pending abuse tests; RULES-CLARIFICATIONS.md gives the disposition. Shutdown bounties and contestable map/economy recovery remain the initial comeback experiments.

Vision: free2-charge scouting charm for every hero, a **mundane planted pennant** with70s duration,110s recharge,900 vision,3-hit HP; inventory separate. At level7 may exchange at Base for a60s-recharge sweep revealing pennants/traps within600 for6s but not unseen heroes through walls. Limit2 active pennants/player. Brush blocks sight; high threat abilities require silhouette and sound reads when revealed. No purchased infinite vision or tech-themed devices.

## Counterplay and readability standard

Riot's [Clarity in League](https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/) explains silhouette recognition, importance hierarchy and minimizing competing effects; its [Champion Counterplay discussion](https://www.leagueoflegends.com/en-us/news/dev/quick-gameplay-thoughts-may-14/) emphasizes useful opponent responses. Apply these principles, not their character, item, map or effect assets: each new animal has one unmistakable silhouette cue; its main threat announces direction, boundary and recovery; powerful magic gets clearer tells, not a universal ban. A ram is slow enough to intercept, a healer can be zoned away from allies, a diver gives up an escape, and river speed creates predictable pursuit lanes with reachable exits. Every ability brief should name at least one tactical response and one draft/map response.

## Progression outside a match

Propose match power resets: bells, levels, purchases and contracts never persist competitively. Account progression unlocks biography pages, heraldry, alternate non-obstructive cloth colors and training challenges only. All gameplay Conquerors available in competitive testing; no paid stats, species unlock advantage or artificial grind used as a balance lever. A 5-match introductory track teaches last hits, recall/spending, lane kingdom affiliation, vision and a contested objective. Lore rewards describe this pack as hypothetical early-era communities until Phil approves names/history. Do not canonize literal respawns or repeated copies of named individuals from match mechanics.

## Validation plan and decisions still needed

1. Implement behind a separate ruleset, preserving current prototype. Unit-check item combine/sale/undo, XP share sum, role-contract cap, zero friendly-farm rewards and bounty reset. Replay deterministic waves to verify1:00/0:30/every-third cadence and destroyed-gate fallback.
2. Run 30 scripted farming routes per role; report median/10th/90th bells and level at 5/10/15/20 min, travel losses, first/second item and ult timing. Target Support 75–90% of solo marginal income before10minutes, then deliberately 60–75% after10 (180/288=62.5% at maximum proximity uptime); Jungle90–110%; revise camp rewards when missed. These are evaluation targets, not established results.
3. Then 20 internal 5v5 matches across mixed skill, with side swaps; inspect kill concentration, tower arrival, objective-trade choices, wards, duration and wins from 2,500/5,000-bell deficits. Do not infer fair balance from20 games; use them to find gross problems. Follow with at least100 sessions and confidence intervals, separating new/experienced players.
4. Flag action if median<22 or>35min, >40% games decided before10min by tester judgment, first completed item differs>90s between equal-income builds, a single Trial buff takes two full structures without an opposing actionable response, or recovery system rewards intentional losses. Change one economy lever per iteration, record version and rationale.
5. Phil decisions: resolve early-era Tier2 implement; confirm first-drinking rather than Age2-start chronology; approve temporary barracks rebuild and gate fallback; decide whether five tower categories are mechanically equivalent initially (recommended) or introduce budgeted sidegrades. Keep kingdom visuals/minions faction-specific while equalizing initial wave rewards/stats; otherwise draft advantage could arise from cosmetics.

**Delivered scope:** researched design document only; no simulation or playtest was executed, no claim of balance, no changes to confirmed lore or current game files.

## Second-pass rule resolution

See `RULES-CLARIFICATIONS.md` for authoritative proposal details added during the second critique: objective recipients and contesting, minion/camp starting combat blocks, tower ramp semantics, permanent Castle unlock, item recipes, bounty bookkeeping and anti-stall formula. These resolve ambiguities in this specification; none is a played or approved rule. The ideal solo reaches15 near18:15 on wave35; late-match growth then comes from items/objectives, not more levels.
