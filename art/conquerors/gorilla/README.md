# Gorilla Conqueror — first model

Open `gorilla_conqueror_v01.blend` in Blender. The editable character includes a connected low-poly body, separate bronze armor and teal cloth, painted colors, a packed 1024px body diffuse texture, and a 22-bone deform skeleton. Approximately 10,614 triangles total.

Select `Gorilla_Rig` and use the Dope Sheet's Action Editor to select:

- `Gorilla_Idle`: frames 1–49
- `Gorilla_KnuckleWalk`: frames 1–33
- `Gorilla_HeavyPunch`: frames 1–25
- `Gorilla_Challenge`: frames 1–49

Set the timeline to the clip's frame range and press Space to preview. Clips are in place, at 24 fps. They are also registered in the installed Game Rig Tools Action Bakery with the source armature and frame ranges assigned.

These are original first-pass FK animation studies, not polished motion capture. Further work should improve contact timing, introduce IK controls, and refine shoulder deformation and the face. The model is an art-direction prototype, not a finished shipping asset.

`gorilla_conqueror_v01.glb` contains a portable character export with animation. It has not yet been tested in Unreal. Studio cameras, floor, and lights are excluded.

Renders show the actual mesh. The original concept is under `reference/`. Rebuild using Blender's background mode and `scripts/build_gorilla.py`; validate/export/render motion with `scripts/finish_gorilla.py`. Both scripts work on their own scene rather than modifying another open file. No paid cloud generation is used.


## Rodin gorilla — rigging prototype

Open `gorilla_rodin_rigged.blend` for the latest Rodin-based character. The original download is preserved as `gorilla_rodin_geometry.glb` and `.blend`.

The cleaned mesh has 8,248 welded vertices and 16,510 triangles. UV coordinates are retained. A custom 25-bone deform skeleton follows the gorilla proportions. Eight optional IK target/pole bones are present; their constraints start disabled during the FK clips. Enable and calibrate each limb before using those controls. There are no separate finger or facial controls yet.

Six editable actions, at 24 fps:

| Action | Frames |
| --- | --- |
| Rodin_Idle | 1–49 |
| Rodin_Walk | 1–33 |
| Rodin_HeavyPunch | 1–25 |
| Rodin_GroundSlam | 1–37 |
| Rodin_Challenge | 1–49 |
| Rodin_HitReact | 1–19 |

Select `Gorilla_Rodin_Rig`, select a clip in the Action Editor, set the corresponding timeline range, and press Space. The six clips are registered in Game Rig Tools Action Bakery when the installed extension is loaded; see `rodin_plugin_integration.json`.

`gorilla_rodin_rigged.glb` includes the rig and all six actions. `gorilla_rodin_rigged.fbx` is the skeletal interchange export for Unreal. Studio objects are excluded. The FBX has not been imported into Unreal yet; bone names follow familiar Unreal naming, but this is a custom skeleton rather than an exact Manny skeleton. `unreal_retarget_chains.json` lists the intended chain mapping for manual IK Rig setup.

The mesh has confirmed Rodin PBR textures, packed in the Blender file and embedded in the GLB. Material UVs were matched to all 16,510 faces of the welded mesh. Raw PBR and shaded downloads are preserved under `rodin_download/`. The geometry used the approved 0.5 credits; texture generation was authorized for up to 0.5 more, and the visible wallet remained at 354 after texture confirmation. The source figure was refined to a more upright, separated-arm pose, rather than a full T-pose.

These are first-pass motion studies. Normalized weights and finite deformation were checked across every clip. Ground penetration was corrected, but stronger arm poses still expose stretching around the fused shoulder/torso geometry; production work should improve topology, separate rigid armor, refine weights and polish contacts. The generated hands are closed fists, so broad attacks work without independent finger motion.

Rebuild with `scripts/rig_rodin_gorilla.py` using Blender background mode, then run `scripts/apply_rodin_texture.py` to restore the confirmed textures. This script uses the original geometry, saves a separate rigged artifact, exports GLB/FBX and renders stills. It does not replace the original manually built gorilla.

Textured animation GIF previews are under `renders/Rodin_Walk_textured.gif`, `Rodin_HeavyPunch_textured.gif`, and `Rodin_GroundSlam_textured.gif`. Strong arm deformation still needs refinement before these clips are used in production.
