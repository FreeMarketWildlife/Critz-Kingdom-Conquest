# Independent second pass — map and systems

18 October 2026. Reviewed the current **pack/map.md**, **pack/systems.md** and their stated geometry/rules. This is a desk review with independently recomputed arithmetic, **not a simulation, implementation test or playtest**. The documents consistently mark their values as untested proposals. Existing canon/roster and image counts were outside this pass.

## Material findings and precise suggested corrections

### 1. Jungle cycle arithmetic uses the wrong renewal interval

Both documents use four camps every 90 seconds to derive 186.7 camp bells/min and 400 XP/min. But respawn is **90 seconds after clearing**, and clearing takes 9–12 seconds. Even with zero travel and perfect scheduling, a particular camp can pay again only after **99–102 seconds** from its previous clear. The 90-second number is a loose unattainable ceiling under the stated clear durations. It should not be compared directly to the lane economy as a plausible route.

**Correct baseline:** four camps ×70 bells ×60/(90+clear duration) = **164.7–169.7 camp bells/min**, or **284.7–289.7 including passive**. Four camps ×160 XP ×0.75×1.25 ×60/(90+clear duration) = **352.9–363.6 XP/min**, before routing loss. State these as timing ceilings; retain 306.7/400 only if clearly presented as a zero-clear-time mathematical bound. Proposed correction: retain actual rules initially, replace comparison text with the corrected ceiling and collect measured route rates before buffing rewards. Do not invent a compensating buff without route tests.

**Test:** record each camp's clear completion timestamps and derive rewards per full recurring circuit, including initial spawn wait, clear, travel, recall and objective rotations. First circuit 60–75 seconds does not imply a repeatable 60–75-second farming cycle.

### 2. Mid reinforcement timing conflicts with the stated lane distances

Mid Castle-to-Castle distance is 210 m. Each outer gate is 36 m from the central clash. With mirrored geometry and Castle/base departure coincident, Castle-to-outer is `(210−2×36)/2 =69 m`, or **11.5 seconds** at6m/s. Side lanes similarly give `(276−2×43.2)/2=94.8m`, or **15.8 seconds**. The claimed **17–23 seconds Base-to-outer** therefore requires an unstated Base-to-Castle path of33–69m for Mid, or some other route constraint.

**Suggested correction:** use **approximately12s Mid /16s side lanes from Castle to outer**, and explicitly add measured spawn/shop-to-Castle travel if Base is behind it. Accordingly, complete recall cycle is approximately **26s Mid /30s side** with8s recall and6s healing/shopping, before that extra Base distance. Alternatively keep17–23s and redraw/path-measure the missing Base approach. The current240m-wide rectangle leaves limited straight-line room behind Castles210m apart, so adding a long approach must be a designed routed path rather than an invisible distance adjustment.

### 3. Destroyed-gate fallback is not inherently faster lane reinforcement

Map text calls retreating a spawn from outer to inner a “shorter defender travel” comeback lever. For the **same frontline**, the inner gate is farther away, so reinforcement is slower. The travel becomes short only after the frontline itself moves back toward the inner defenses. The proposal can remain useful, but its causal explanation is currently misleading.

**Suggested correction:** “Fallback gates preserve wave production and concentrate defenders near their remaining structures as the siege advances; they increase travel time to the former outer frontline.” Measure wave spacing and objective response after every gate loss. Do not claim a comeback benefit until the new reinforcement geometry supports it.

### 4. Barracks recovery can make Castle eligibility ambiguous mid-siege

Both docs now agree on180-second Barracks recovery. They do not establish whether a rebuilt Barracks re-shields gate defenders or the Castle, whether prior gate destruction remains permanent, or whether the Castle can become untargetable during an active assault. “After any Barracks is destroyed” could mean a permanent unlock or a currently destroyed-state requirement. This materially affects endgame pacing.

**Suggested correction for the first ruleset:** the **first** enemy Barracks destruction permanently unlocks gate defenders for that match; gate defenders never rebuild; their destruction permanently unlocks Castle damage. Barracks recovery stops future Tier3 departures only, never erases existing rams or re-shields the Castle. Label this a new proposal. On rebuild, already spawned Tier3 engines finish their route. If temporary protection is preferred instead, state the exact re-shield transition and show a public timer; do not leave the behavior implicit.

### 5. Item efficiency target conflicts with almost every listed finished item

The catalogue declares a105–115% efficiency target, but its own calibration gives Longbow40×30+20×20 =**1,600/1,800 =88.9%**; Harness35×30+250×2.5 =**1,675/1,800 =93.1%**; Lamellar400×2.5+35×18 =**1,630/1,800 =90.6%**; Cloak350×2.5+35×18 =**1,505/1,800 =83.6%**. The document notices Lamellar's conservatism, but that exception does not reconcile the catalogue-wide target. Mana has no valuation anchor, preventing the caster item's comparison. The Medic's healing modifier has no benchmark either.

**Suggested correction:** call these values **initial cost anchors, not a105–115% target achieved by this catalogue**. Retain current prices/stats until measured item comparisons exist, add the missing mana anchor only when actually used, and show nominal value ratios in a spreadsheet. Do not arbitrarily inflate every stat to satisfy a generic efficiency percentage: defense synergy, mana utility, animation applicability and healing need separate practical comparisons. Show exact component recipes for every completed item, including whether components are consumed and their stats replaced by final totals.

### 6. Support income target falls off after10 minutes

Pre10-minute maximum proximity income is108/min plus120 passive =228/min versus a70%-CS solo's288/min, **79.2%**, matching the stated75–90% target. Post10-minute proximity income drops to60/min, making support income180/min, or **62.5% of that solo** before assists. With400 start and the stated first-ten-minute maxima, a20-minute Support earns approximately**4,360** versus the solo's5,956 (**73.2%**), even before deaths, fountain exclusions and travel reduce proximity income.

**Suggested correction:** keep the deliberate early-to-late drop only if the design target explicitly becomes **60–75% marginal solo income after10**, with team-utility purchases priced for it. If75–90% remains the intended marginal target, the post10 proximity rate must be about**96–139 bells/min** at perfect uptime; **108/min** preserves the initial79.2% ratio and is a concrete test alternative. This is not a recommendation to buff unseen play results; it is an explicit choice between two conflicting intended outcomes.

### 7. First ultimate target is slightly later than the ideal lane calculation

The0.65 lane XP scalar arithmetic is correct: wave8 yields `(8×270+2×90)×0.65 =1,521 XP`, exceeding level6's1,500 threshold. Wave8 departs4:30; arrival is approximately**4:45 Mid /4:48 sides**, before recall/travel losses. Thus “first ultimate at5–6 minutes” is plausible for imperfect attendance, but **not the perfect-farm timing**.

**Suggested correction:** say **ideal4:45–4:48; observed target5–6 minutes after normal attendance losses**. If5:00 must be a hard earliest solo timing, change lane scalar to0.64 (wave8=1,497.6; wave9=1,728), producing level6 on wave9 at5:15–5:18; evaluate duo/Jungle levels again. Existing total-to15=6,720, level6=1,500, level10=3,420,10-minute XP≈3,685.5 and duo≈2,211 are arithmetically correct.

### 8. Objective buff and provision ownership require explicit recipients

Systems says Trial buff ends on death, but does not identify whether all five teammates, only living teammates at capture or only local participants receive it. Map describes a crate where “each living player” consumes once; systems says one provision without spelling out per-player ownership. Dead teammates earning objective bells is clear; buff eligibility is not. A team cannot evaluate capture versus respawn tradeoffs without this.

**Suggested correction:** “All five teammates receive objective bells. At capture, **each living teammate** receives one non-transferable provision / one Trial carrier buff; dead teammates receive no delayed buff. Provision is individual, usable once, expires120s from capture; Trial expires180s from capture and on death; multiple carriers never stack.” Alternative ownership is fine if explicitly stated. Specify an exact out-of-combat condition, such as no hero damage dealt/received for8s. Add a3s default player-damage interruption/contest reset for objectives only if desired, as a labeled tuning proposal.

## Important limitations that prevent numerical pacing conclusions

- **No minion combat stat block:** Tier1/2/3 HP, AD, armor, attack cadence, structure modifiers, aggro and collision are absent. Outer tower7–11min and Castle24–30min cannot be calculated or validated from tower HP alone. Add one equal mechanical block per tier before testing faction skins; otherwise kingdom choice can introduce unbudgeted power differences.
- **No camp HP/damage/range or leash rules:**9–12s clears, first circuit60–75s and Jungle durability are targets without encounter inputs. Specify neutral reset behavior and attack patterns before interpreting Jungle income parity.
- **Tower damage is partial:** first-shot damage to a level1 ranged hunter with18armor is≈127HP, reaching≈254HP at capped ramp; one-shot avoidance is supported, but dive safety is not established. Clarify whether ramp persists across retargeting, reset on target exit, and whether0.6s windup overlaps the1.1s shot cadence. Gate defender range/damage remains unspecified despite “short range.”
- **Level progression caps before late game at ideal farm:** at wave35, ideal solo lane XP is6,786, reaching15 at approximately18:15 plus losses. This is compatible with a24–30-minute match only if intended; state that late-game progression then comes from items, waves and objectives rather than additional levels.
- **Bounty bookkeeping needs exact definitions:** “net takedowns,” earned-bell lead, disconnected-player exclusion, what resets, and one-level bonus-XP cap are not executable rules. Count kills and assists explicitly, compare lifetime earned bells excluding starting allocation, and define how the cap tracks threshold crossing. Avoid implementing text ambiguities as invisible rubber-banding.
- **No objective XP is given:** this appears intentional; say both trials give **zero XP** rather than leaving it inferred. Capture times, no-combat damage and open entrances may make trial rushing easy unless contested-state and channel-presence rules are precise.
- **Anti-stall ramp needs a formula:** map's “after24:00” could start at24:00 or25:00. Suggested explicit definition: structure damage multiplier `1 + min(0.30, 0.05×floor(max(0,t−24)))`, t in minutes; first+5% at25:00, cap30% at30:00, applies to lane-minion outgoing structure damage only.
- **Minor unit sentence:**335units=6m means335units/s=**exactly6m/s** under that definition, not6.03. Use one exact conversion consistently; rounded670units≈12m is correct. This is editorial, not a substantive balance difference.

## What is already coherent

The current pack has resolved the earlier90/180-second Barracks discrepancy, 12m/900-unit Trial aura mismatch, cannon-era conflict labeling and tower-health disagreements. Map and systems agree on the5:00/4min Offering,12:00/5min Trial,80/120 bells per teammate,20% minion structure-damage reduction and180-second duration. Wave bell arithmetic, XP advancement thresholds, six item slots and15 skill points match their formulas. Both documents preserve the first-generation setting and explicitly separate proposed match trials from literal dragon resurrection or awakening.

**Recommended readiness label:** concept specification ready for author review and greybox construction; **not yet an implementable complete balance ruleset**. Prioritize findings1–4 and8, then create minion/camp blocks and a deterministic no-combat farming/traversal replay. Only after those inputs are fixed should the proposed playtests be used to discuss actual match duration, comeback frequency or fairness.
