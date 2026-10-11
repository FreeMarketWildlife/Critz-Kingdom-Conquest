# PC handoff: Gorilla Conqueror

The latest character is `art/conquerors/gorilla/gorilla_rodin_rigged.blend`.
For Unreal, start with `art/conquerors/gorilla/gorilla_rodin_rigged.fbx`.
The matching GLB contains embedded textures and six animations. Standalone textures are in `art/conquerors/gorilla/textures/`.

## Get the project on Windows

Clone this repository and check out `codex/gorilla-pc-handoff`, or download that branch as a ZIP from GitHub. Open the folder in your desktop app. Local Blender installations and plugins must be installed separately on the PC.

Open the latest Blender file to inspect the textured character and six actions. The file was created with Blender 5.2.2. The saved rig and animation actions can be inspected without Game Rig Tools. Plugin-specific tools require the matching extensions.

## First Unreal test

Create a small Unreal test project. Import the FBX as a skeletal mesh with animations and create its own skeleton. This is a custom gorilla skeleton, not an exact Manny skeleton. Inspect materials and assign the supplied textures if the importer does not reconstruct them correctly.

Preview Idle, Walk, HeavyPunch, GroundSlam, Challenge and HitReact. Check scale, feet against the ground, texture appearance, and shoulder deformation. Then make a simple top-down playable character using the gorilla, and test movement and one attack before expanding the game.

`unreal_retarget_chains.json` documents intended bone chains for manually creating an IK Rig and retargeter; it is not an Unreal asset that can be imported directly. Do not assume human animations will retarget cleanly to these gorilla proportions.

## Current limitations

The FBX has not yet been tested inside Unreal. These are first-pass FK clips. Strong attacks still stretch the shoulder/torso region and need topology/weight polishing. Optional IK constraints are disabled pending calibration. There are no individual finger or facial bones.

The existing playable game under `prototype/` is a browser prototype, not an Unreal project or online multiplayer implementation. Its README explains controls. Run `python -m http.server 8765 --directory prototype` and open http://localhost:8765/.

## Resume the work

Ask: “Read PC_HANDOFF.md and the gorilla README. Help me import the textured gorilla into Unreal on this PC, verify all six animations, and build a top-down movement and attack test.”

The asset README and validation JSON files describe the modeling, textures, skeleton and export checks. Original geometry, source textures, references and rebuild scripts are preserved alongside the character.
