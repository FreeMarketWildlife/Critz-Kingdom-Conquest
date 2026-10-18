# Current saved state — reference and brush update completed

The latest editor has one faithful editable supplied-reference reconstruction plus four original defaults. Bush painting/erasing, base ground and healing-zone fountains are implemented.88 computational tests and28 browser checks pass. See README.md, REFERENCE-REVIEW.md and QA.md. The earlier restart checkpoint below is historical, not pending work.

# Completed after desktop restart

The five-map rebuild is now implemented and tested. See map-creator/README.md, FIVE-MAPS.md and QA.md for the current state. Five defaults and editable geometry UI are complete;78 computational tests and21 browser checks pass. The earlier paused plan below is retained as historical context, not pending instructions.

# Safe restart checkpoint — five-map rebuild

User changed scope on 18 October 2026: remove the rejected 30 defaults. Deliver exactly FIVE strong square maps, all terrain/lane/river geometry with exact point symmetry (180° rotation, order 2). Construct in code through editable editor geometry, no image generation. Add path drawing, control-point movement, width editing, deletion, undo/redo; jungle and river geometry must remain exactly paired. Preserve existing legacy drafts under migration labels. Dragex/Moana remain explicit independent exceptions to entity pairing, never terrain exceptions.

## Saved working baseline

- Intended Mac repo: `/Users/tanoshi/Documents/ChatGPT/Critz-Kingdom Conquest/map-creator`.
- Editable staging copy: `/Users/tanoshi/Documents/Codex/2026-10-18/task/map-creator`.
- Prior completed editor source ZIP native Library ID: `libfile_52ac56a2b5948191ada7f49973afa8fe` (v0). It is a backup of the previous 30-map build, NOT acceptance of the newly rejected presets.
- Previous baseline verification: 49 model tests +17 browser flows pass. `qa-output/unit-results.txt`, `results.json` and screenshots retained.
- Prior native screenshots: desktop `libfile_c80453a878988191942d0ac8f7ee51d4`, portrait `libfile_800fc027cd1c8191aad1cfaf1fd7738a`, old30 contact sheet `libfile_a77c83fb8548819186140067ae45e6b1`. The old sheet is superseded as a design direction.
- No source commit, push, deployment, DNS, or access change. No desktop app update performed.
- Four unrelated tracked modifications are protected by `preservation-baseline.json`. Tycoon and website animation not edited.

## Rebuild architecture decided

Saved intermediate implementation: `map-creator/geometry.mjs` and `geometry.test.mjs`. Seven new geometry tests pass, covering exact transforms, moving either partner, immutable edits, self-symmetric controls, fixed center, width/deletion, river/polygon JSON, malformed data, and lane-segment intersection connectivity. These files are NOT integrated into the UI/model yet; existing editor behavior remains the saved baseline. The geometry contributor has stopped with no running operations.

Add `geometry.mjs` with editable typed features: `{id,type:'lane'|'river'|'jungle',points:[[x,y]],width,pairId}`. Every ordinary feature has an exact transformed partner with `(size-x,size-y)` coordinates. Geometry symmetry always remains on, independent of the structure-pair toggle. Self-symmetric full lanes may use `pairId === id`, `selfSymmetric:true`, with reversed control indices paired and center control fixed at the square center.

New documents use additive `pointSymmetry:true` and `geometry:[]` fields while retaining legacy schema compatibility. New defaults leave the old `lanes/rivers/jungles/objectiveZones` arrays empty. Imported legacy drafts remain explicitly labeled legacy and are not silently converted or discarded.

Next integration tasks:

1. Integrate validated geometry preservation into `model.mjs`/createDocument and enforce square documents for pointSymmetry.
2. Replace `presets.mjs` with five original layouts using geometry constructors; meaningful route/jungle topology differences; exact transforms.
3. Add icon-led lane/river/polygon draw tools, finish/cancel, selectable control handles, width field, deletion, paired geometry edits/history on desktop and portrait.
4. Keep legacy stored drafts recoverable and selectable; no rejected30 defaults primary.
5. Computational geometry equality, connectivity and team pairing checks; actual editing/undo/save/reload/mobile flows; five-map contact sheet and fresh native ZIP/screenshots.

## Restart guidance

The parent coordinates the desktop app update/restart. Stop any active agent/tool operation before restarting. All relevant source is saved on disk; do not restart in the middle of Library uploads, repository sync, or file writes. The localhost preview is disposable and can be restarted from README after the app resumes.
