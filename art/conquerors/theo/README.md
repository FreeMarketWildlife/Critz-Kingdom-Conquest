# Theo — possum conqueror concept

## Current deliverable — v02 with two ability animations

Use `theo_rigged_v02.blend`, `theo_rigged_v02.glb` or `theo_rigged_v02.fbx` for the latest character. V02 contains the original six clips plus:

| Action | Frames at 24 fps | Duration | Motion |
| --- | --- | --- | --- |
| `Theo_MoonshineDrink` | 1–73 | 3 seconds | Raise a bottle, tip it at the mouth, gulp, lower it. |
| `Theo_CrackAbility` | 1–73 | 3 seconds | Raise the stylized pipe, pause at the mouth, exhale small stylized smoke puffs, lower it. |

The bottle, pipe and smoke are separate meshes, rigidly controlled by dedicated ability bones. The cigarette is temporarily hidden during mouth contact. Prop visibility is baked into the actions using a tiny positive bone scale for inactive props; engines can replace that with explicit equip/hide events. The original six clips contain neither equipped ability prop. Both new clips are non-looping; GIF previews repeat for inspection.

Standalone props are in `props/theo_moonshine_bottle_v01.glb` (152 triangles) and `props/theo_crack_pipe_v01.glb` (76 triangles). These are locally authored low-poly game props, not new Meshy generations. The bottle has its origin at the bottom and is uncorked for drinking. Separate props support later swapping, dropping, throwing or a broken-bottle variant. The current file contains the intact bottle.

Preview both motions in `renders/abilities/theo_two_abilities.gif`. Individual GIFs and a contact sheet are in the same directory. In Blender select `Theo_Rig`, choose either ability action in the Action Editor, set frames 1–73 and press Space. All eight actions are registered in Game Rig Tools Action Bakery. V01 remains preserved as the original six-animation deliverable.

`theo_ability_validation.json` records full-frame finite geometry and floor checks plus mouth-contact distances. `theo_ability_export_validation.json` confirms eight clips and correct durations in GLB and FBX, correct prop visibility after GLB re-import, standalone unrigged prop models, and unchanged sampled body poses for the original six clips. The abilities are animation assets; gameplay stat bonuses, cooldowns, damage, audio and ability-slot assignments remain undecided/unimplemented. The existing prototype deformation limitations below still apply.

Rebuild V02 from V01 with `scripts/add_ability_animations.py`, verify with `scripts/verify_theo_abilities.py`, and assemble previews with `scripts/make_ability_previews.py`. No cloud generation or additional credit spend is required for those scripts. This update cost zero Meshy credits; the prior total remains 35.

## V01 — original rigged Theo with six animations

Open `theo_rigged_v01.blend` for the editable character. `theo_rigged_v01.glb` and `theo_rigged_v01.fbx` contain the textured character, skeleton and all six animations. The original Meshy downloads are preserved unchanged in the project folder below. Studio objects are excluded from both exports.

Theo's body has 6,201 welded vertices and 12,467 triangles, reduced from 1,261,590 source triangles. A separate 84-triangle cigarette follows the head. Textures are packed into the Blender file and embedded in GLB/FBX. Theo is approximately 1.1 metres tall in the rest pose, with -Y forward and Z up in Blender.

The custom skeleton includes 37 weighted bones, including six tail segments, two mullet bones, finger/thumb controls and normal limb chains. Two unweighted hand attachment bones (`socket_weapon_l/r`) are exported for future bottle props. Eight optional IK controls are present in Blender and disabled during baked animation playback. The rig is custom, not an exact Unreal Manny skeleton; `unreal_retarget_chains.json` provides the intended mapping.

### Animation clips — matching the gorilla's six clips and timing

| Blender action | Frames at 24 fps | Duration | Loop |
| --- | --- | --- | --- |
| `Theo_Idle` | 1–49 | 2.00 s | Yes |
| `Theo_Walk` | 1–33 | 1.33 s | Yes |
| `Theo_HeavyPunch` | 1–25 | 1.00 s | No |
| `Theo_GroundSlam` | 1–37 | 1.50 s | No |
| `Theo_Challenge` | 1–49 | 2.00 s | No |
| `Theo_HitReact` | 1–19 | 0.75 s | No |

These are new Theo-specific motion studies, not direct copies of gorilla joint transforms. Ground slam uses a deep crouch to accommodate his short arms; challenge uses a comic gesture and head movement. The moonshine weapon remains a future separate prop.

Select `Theo_Rig`, choose an action in the Dope Sheet's Action Editor, set the timeline to its frame range and press Space. All six clips are registered in the installed Game Rig Tools Action Bakery. The file opens with Idle selected. Optional editor IK needs pole calibration before enabling. Existing clips are baked FK and do not require IK constraints.

### Previews and verification

`renders/theo_six_animations.gif` shows all six motions. Individual GIFs use their respective clip durations; `renders/theo_motion_contact_sheet.png` compares four poses per clip. Hero, rear, gameplay and impact stills are also saved under `renders/`.

`theo_rig_validation.json` records checks across every animation frame: normalized weights, no more than four influences, finite geometry, less than 1 mm floor penetration, and identical endpoint poses for the loops. `theo_export_validation.json` confirms six clips with matching durations in GLB, six actions in the FBX re-import, packed textures, and matching posed body bounds after GLB re-import at start/middle/end frames. These checks do not establish production-quality topology or collision behavior.

The six editable animations are first-pass prototypes at the same stage as the gorilla. Strong poses still compress some fur/overalls and stretch small triangles around joints; shoulder topology, fist shapes and cloth folds can be improved for production. No facial animation, gameplay abilities, bottle prop or Unreal integration is included. The rig and exported animations have been checked in Blender, not imported into Unreal.

### Cost and task lineage

- Image-to-3D source: `01a12970-c0a9-7410-800f-52293de58c21`, 30 credits.
- Remesh: `01a12977-fdde-72b0-8b4e-d2e4211e58a8`, resource `remesh`, 5 credits consumed; requested 12,000 triangles, delivered 12,467.
- Rigging and animations were authored locally in Blender, with no additional cloud submissions. Total Meshy spend: 35 credits. Balance after remesh: 1,515 credits.
- CLI project: `meshy_output/20261010_223026_theo-v03_01a12970/`; snapshots and metadata retain both producing tasks for future reuse.

Rebuild locally with `scripts/prepare_theo.py`, `scripts/rig_theo.py`, then `scripts/finalize_theo.py` in Blender background mode. Check exports with `scripts/verify_theo_exports.py`. `scripts/make_previews.py` assembles already-rendered frames with Pillow. Rebuilding does not call Meshy or spend credits.

## Meshy source model — generated

Approved v03 was generated through Meshy image-to-3d in an A-pose with 2K PBR textures. Task `01a12970-c0a9-7410-800f-52293de58c21`, resource `image-to-3d`, consumed 30 credits. Verified balance after generation: 1520 credits.

Project folder: `meshy_output/20261010_223026_theo-v03_01a12970/`.

- `theo_meshy_textured_v01.glb`: original textured download, unchanged.
- `theo_meshy_textured_v01.blend`: imported source with packed textures and an inspection studio.
- `preview.png`: Meshy's rendered thumbnail.
- `inspection_front.png` and `inspection_rear.png`: Blender renders inspected for silhouette and rear details.
- `local_inspection.json`: local mesh counts and material evidence.
- `task_01a12970-c0a9-7410-800f-52293de58c21.json` and project metadata: task trail for reuse, not regeneration.

Source inspection found one mesh, 1,261,590 triangles, 687,410 vertices, and no armature. Tail and mullet are present; cigarette was omitted from the source and restored as a separate accessory in the rigged deliverable. The muzzle appears shorter than the concept. This dense source is preserved for future edits; the current reduced and rigged deliverable is described above.

## Current revision: v03

`reference/theo-concept-v03.png` supersedes v02 for review. Localized correction removes the protruding furry rump on image left, tucks hips into the overalls and retains a natural tail attachment. Other character details preserved. Built-in ImageGen edit; prompt saved in `reference/theo-concept-v03-prompt.txt`.

## Current revision: v02

`reference/theo-concept-v02.png` supersedes v01 for review. User correction: dramatically shorter and more possum-like, literally a possum standing on its hind legs, rather than a humanoid bruiser. Short hind legs, compact animal torso, small forepaws, long snout and bare tail. Keep mullet and cap, increase chin tuft, place cigarette at mouth rather than nose. Remove moonshine bottle from character reference; it will be a separate prop. Prioritize the gorilla's PS2-era League of Legends game-model aesthetic. Generated with built-in ImageGen; exact prompt saved alongside image. No Meshy job submitted.

First concept for review: `reference/theo-concept-v01.png`. Created with the built-in ImageGen tool, using the gorilla concept as a style reference. This is concept art, not a generated Meshy model. The prompt is preserved in `reference/theo-concept-v01-prompt.txt`.

## Character direction

Theo is an original fictional adult possum conqueror with Theo Von-inspired comic hillbilly swagger. Keep animal anatomy, an upright stance, lanky limbs with bruiser strength, messy fur, a prominent mullet beneath a snapback, and a small matching chin tuft without a mustache. Worn stained overalls, no armor, cigarette, moonshine bottle weapon, bare animal paws and long bare tail. Possible all-fours sprint remains an animation idea.

The first image interprets the cap as a plain two-tone forward-facing snapback and the overalls as worn over bare fur; these details remain open to review.

## Proposed shared art direction

Stylized low-poly fantasy with hand-painted textures: chunky faceted forms, broad painted shading, muted colors and strong silhouettes readable at gameplay distance. Early PS2 visual character with MOBA-style proportion and readability. This description is a proposed art-bible starting point, not a finalized art bible.

## User's kit ideas — provisional, not balanced or implemented

- Passive: at zero health, play dead completely still for about five seconds, then return with 1 HP. Cooldown and counterplay remain undecided.
- Q: break moonshine bottle on a target, then perform three quick empowered broken-bottle stabs with magical damage before tossing the bottle. Fist attacks while Q is on cooldown; pull out a new bottle when ready. Exact crit behavior remains undecided.
- W: drink moonshine for a temporary strength/stat bonus; about three seconds suggested, duration undecided.
- E: undecided.
- Additional crack-use ability: confirmed as an animation concept; ability slot, effect and balance undecided.
- R: tell a joke that taunts enemies across a very wide area. Range and duration undecided.

## Modeling follow-up

The single-character v03 concept was selected for Meshy generation. Future intact and broken bottle props should remain separate for weapon changes, with an empty hand available for fist attacks. Use the existing task lineage for follow-ups.
