# Kingdom Conquest · Five Map Creator

A working, dependency-free editor with five square defaults: one supplied-reference reconstruction and four original maps. **Point symmetry** means rotation by 180° about the square center reproduces the terrain; this is rotational symmetry of order 2.

## Open

From the repository root:

```sh
python3 -m http.server 8787 --directory map-creator
```

Open http://localhost:8787. Use HTTP rather than opening index.html directly: the editor uses JavaScript modules. No account, external fonts, image generation or remote assets are required.

## Five defaults

| Map | Route structure |
| --- | --- |
| Attached Reference | Traced black jungle walls, split river, bushes and corner bases; source asymmetry retained |
| Braided Marches | West/east routes with shared junctions and cross-links |
| Island Crown | Ring, spokes and a central island |
| Crescent Divide | Two wide flanks around a large jungle, joined by a narrow crossing |
| Highland Switchbacks | Five stepped corridors and connecting passes |

The reference is reconstructed from the actual supplied raster color boundaries as editable vector polygons, not a background image or invented replacement. Its hand-drawn asymmetries are retained. The remaining four maps use exact rotational geometry. All paths and polygons are editable. No map image was generated. The rejected thirty presets are not defaults; existing saved drafts remain separately labeled Legacy.

## Author terrain

Choose Lane, River or Jungle, then click/tap points on the map. The rotated partner is previewed immediately. Finish commits the pair; Cancel discards the unfinished drawing. A jungle region needs at least three non-collinear points; paths need two.

Choose Edit terrain, select a feature, and drag its control handles. The inspector also provides point selection and exact X/Y fields. Lane and river widths apply to both partners. Delete pair removes both halves. Undo/redo restores the whole operation, including a complete drag. A self-symmetric center path uses reversed point indices: opposite controls move together, and its center point stays fixed.

The four original maps keep terrain pairing active. The reference preserves independent traced contours; its new regions follow the rotation toggle. Bush painting and erasing always follow that toggle, including on the original maps, so an unpaired bush stroke may make the foliage layer asymmetric. The status explicitly labels geometry symmetry. The status bar checks terrain symmetry and lane-centerline connectivity. Disconnected creative drafts are allowed and warned about; the four original maps each have one connected lane network linking the castles. Reference corridors are represented by their open-ground and wall contours, without invented lane overlays. This is not gameplay navigation or balance testing.

## Structures

Drag a palette icon, or select it and tap the map. Red and blue ordinary structures pair at `(width-x,height-y)`, with their orientations differing by 180°. Move, rotate and delete either partner to edit the pair. This is rotation, not left/right reflection. Pair IDs are reciprocal; history restores the same IDs.

Neutral objects remain single. **Dragex and Moana are independent landmark exceptions:** they are never automatically paired, copied, moved, rotated or deleted by the pairing system. Their distinct placements do not make the terrain asymmetric, and imply no living boss combat or canon change.

Turning structure pairing off preserves untouched links. Editing a linked structure while off detaches that pair; turning it back on does not manufacture partners. Paired glyph footprints cannot overlap near the center; touching edges pass. These are authoring footprints, not game hitboxes. Unrelated, neutral or detached structures may overlap.

## Drafts and files

Drafts autosave locally for each map. Switching presets retains edits. Old saved drafts remain in the same storage with their original terrain and placements; their selector labels say Legacy. Their structures remain editable, but the old asymmetric terrain is read-only rather than silently converted. Choose one of the four original point-symmetric maps for enforced paired terrain authoring, or the supplied reference for independent contour editing.

Export JSON for durable backup or device transfer. Import validates the complete document before replacing it. A malformed or asymmetric point-symmetric import is rejected without changing the draft. Browser history is session-local; saved documents persist across reload. There is no cloud draft synchronization.

## Checks

```sh
node --test model.test.mjs pairing-lifecycle.test.mjs geometry.test.mjs presets.test.mjs bushes.test.mjs
node browser.test.cjs
```

Run these from map-creator/. Browser checks use isolated Chrome contexts; set KINGDOM_PLAYWRIGHT_MODULE if needed. Actual results, five-map renders, desktop/portrait captures and the contact sheet are in qa-output/. See QA.md and REFERENCE-REVIEW.md; FIVE-MAPS.md records the historical five-original baseline.

The tool does not yet import maps into the existing game/Unreal, simulate collisions or units, or establish competitive balance. No deployment, DNS or access settings were changed. Existing unrelated art, lore, Tycoon work and website animation were preserved.

## Bush brush, bases and fountains

Choose the bright-green bush brush or eraser and set Radius (1–100 map units). Drag with a mouse or touch to paint/erase continuously. The rotation button next to brush size is the same180° toggle as structure pairing. A whole stroke is one undo/redo operation. Center dabs are deduplicated; empty erasing and outside-map clicks add no history. The complete bush mask, including each painted dab’s radius, persists in JSON and local drafts. The bush layer is separate from jungle polygons. The reference starts with3063 small editable paint dabs sampled from its actual green patches.

Base ground is its own team-affiliated polygon tool and editable contour type. Fountains are healing-zone map objects, separate from castles or base ground, with team affiliation and adjustable healing radius5–150. Rotation pairing creates the opposing team counterpart when enabled, including radius edits; when disabled the standard detach-on-edit rule applies. No healing gameplay simulation is implied.

The source reference starts with independently positioned blue southwest and red northeast fountains and rotation off, preserving their drawn locations. The healing cross and zone annotation are explicit editor additions; the source contours are simplified/quantized vector traces rather than a pixel-identical image copy. See REFERENCE-REVIEW.md for fidelity measurements and source normalization. Dragex/Moana exclusions remain unchanged.
