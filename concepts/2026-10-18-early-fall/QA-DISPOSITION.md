# Second critique: findings and disposition

18 October 2026. Two independent agents reviewed the current art and map/economy specification, followed by lead inspection and correction. Their original findings remain in `SECOND-PASS-ART.md` and `SECOND-PASS-SYSTEMS.md`; those reports describe the reviewed version, not necessarily the corrected final state.

## Generation provenance

Exact tool: **built-in `tools.image_gen__imagegen` invoked through `functions.exec`**. Thirty independent initial calls each requested one isolated subject; seven targeted edit calls corrected six minion bells and one tower emblem. Thirty selected finals remain. All thirty final PNG hashes match retained original image-generation outputs. No artwork is a cropped panel from a generated batch sheet, no procedural character drawing was substituted, no CLI/API fallback was used, and no Meshy job was run. The contact sheet is deterministic assembly of these separate images. The annotated map is an authored SVG diagram and does not count toward the thirty artworks. See `GENERATION-PROVENANCE.json`.

## Corrected findings

| Finding | Final disposition |
|---|---|
| Six minions lacked visible bells in initial images | Six targeted edits completed and visually inspected; selected files contain physical bells. Superseded originals excluded |
| Milepost tower's antler-like emblem could imply deer rather than pronghorn | Seventh targeted edit removes emblems from banner/pennant; plain sage cloth selected and inspected |
| Stale Ivara staff wording | Changed to dagger/sheath; bill basic and innate ability proposal retained |
| Kavra and Mudling descriptions overstated limb visibility | Replaced with explicit far-side limb/forelimb occlusion caveats |
| Jungle rates ignored clear time before respawn | Corrected reference-kit ceilings to284.7–289.7bells/min inclpassive and352.9–363.6XP/min, before routing losses |
| Recall return numbers contradicted geometry | Corrected Castle-to-outer estimates12s Mid/16s sides; Base approach must be measured separately |
| Fallback called a universally faster reinforcement | Corrected: production persists; travel to former frontline gets longer; benefit depends on siege position |
| Barracks rebuild could re-shield Castle ambiguously | First Barracks permanently unlocks gates; both gate deaths permanently unlock Castle; recovery stops future rams only |
| Buff recipients/contesting unspecified | All five receive bells, living-at-capture players receive personal non-transferable buff; explicit contest/channel/OOC rules added |
| Item efficiency claim exceeded actual ratios | Removed unsupported target; retained83.6–93.1% nominal anchor comparisons and practical-testing requirement; recipes defined |
| Support post10 income contradicted target | Deliberate target now60–75% marginal solo income after10; exact62.5% example disclosed; no invented buff |
| Perfect ultimate timing blurred with observed target | Ideal4:45–4:48 stated separately from5–6minute attendance-loss target |
| Missing minion/camp inputs | Added untested HP/AD/range/cadence/speed/leash/scaling blocks for later greybox |
| Tower timing, bounty bookkeeping, anti-stall formula and XP catch-up ambiguous | Defined in RULES-CLARIFICATIONS; XP catch-up disabled initially pending abuse tests |

## Visual findings retained for production

All thirty have one isolated complete subject, neutral background and readable medieval equipment. No futuristic, steampunk or technological magic weapon was observed. Species cues differ clearly across the ten conquerors: mottled round-eared wild dog; striped okapi; tall spiral-horned kudu; short pronged-horn pronghorn; smooth broad-eared elephant; long-legged bald marabou; pouch-billed pelican; barrel-chested barred bustard; unequal-clawed coconut crab; broad-flat-headed low amphibian proposal.

The nearest silhouette pair is the two mice. Preserve Dustrunner's short dagger/compact shield/short tail versus Dustfoot's long spear/wicker buckler/long tail at intended gameplay zoom. The ungulates also require horn/shield contrast at low detail. These differences exist in the references; LOD validation is still needed.

Single views hide far limbs, shield-side arms, wing joints and tower backs. Crab appendage count must be deliberately reconstructed, not guessed from occluded image fragments. Uld remains a stylized Koolasuchus proposal whose broad amphibian shape can evoke the existing giant salamander; keep the wide skull/high eyes and avoid Tesla-like electrical props. Bird gripping anatomy is deliberately anthropomorphic; decide and rig it consistently. Thin antennae, toes, bell clappers, ropes and ladder rungs need separation/simplification. Fur/feather/stone microdetail belongs mostly in texture/normal detail. These are concrete reference limitations, not proof of usable topology.

Each faction has one representative minion image, not six separately authored wave units. Additional ranged-equipped/visibly innate-casting variants are needed for full3-melee/3-ranged production. No image is falsely assigned an invisible sling or bow. Ten tower visual skins share tier-based gameplay stats; normalize collision/range independently of decorative width/height.

## Canon and readiness

The source repositories remain unchanged. Approved lore is cited separately from every proposed individual, faction, ability, mechanic and number. Living-dragon objectives remain a documented conflict with sleeping Dragex/deceased Moana; match-only trials are labeled alternatives. Cannon wording remains preserved, with a proposed medieval era variant. No humans, invented Fey resurrection, late arcane machinery or descendants replacing first drinkers were added.

**Readiness:** thirty reviewed concept references and an expanded concept specification are ready for author review and controlled blockout. They are not thirty validated meshes, an implemented ruleset or a balanced game. No playtests/simulations were run. Required next validation: measured traversal/farming replays, minion/structure exchanges, class clear times, top-down silhouette/LOD checks, then side-swapped5v5 playtests. Remaining author choices and production caveats are explicit; they do not change the true artwork count.
