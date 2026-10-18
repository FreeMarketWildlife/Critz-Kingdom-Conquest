# Reference, bushes, bases and fountains — final verification

18 October2026. This report supersedes the earlier five-original and thirty-preset review stages.

- **88 computational tests pass** across model, paired structures, editable geometry, presets and bushes.
- **28 browser checks pass; zero JavaScript errors.** Isolated desktop1440×900 and portrait390×844 touch contexts.
- Exactly five defaults: one supplied-reference reconstruction preserving source asymmetry, plus four original maps with exact point-symmetric geometry and connected castle routes.
- Reference uses280 editable polygons and3063 bush-paint dabs. Actual source shapes are traced; no image background, generated replacement map or generic lane overlay is used.
- Actual mouse/touch bush painting and erasing, radius selection, paired and independent strokes, center deduplication, one-stroke undo/redo, empty/outside no-op history, persistence and real JSON export/import pass.
- Team base-ground polygon creation, counterpart geometry/team swap, fountain healing-zone metadata, paired adjustable radii, independent source fountain positions, precise per-axis edits and undo pass.
- Reference contour edits preserve independent geometry and fractional coordinates. Legacy drafts remain intact and separately labeled. Malformed imports preserve current drafts.
- Dragex/Moana exclusions, ordinary team pairing lifecycle and footprint guards remain tested.

## Visual comparison

The supplied source is cropped13,15–689,691 into a676square and compared with an actual editorSVG raster at that normalization. Palette-grouped terrain-class agreement is97.916%. Intersection-over-union: walls97.83%, river98.04%, ground97.04%, bushes89.20%, blue base95.09%, red base96.03%. These are segmentation metrics, not a pixel-perfect assertion. Fountain cross/zone annotations, contour simplification, antialiasing and bush-dab edge coverage are known differences.

The source comparison, desktop editor, portrait editor/brush controls and five-default contact sheet were visually inspected. The four original maps retain their earlier mathematical and raster180° checks. Reference asymmetry is deliberately not asserted away.

A dense reference-mask stroke with10pointer steps completed in roughly0.55seconds including rendering and serialized snapshot overhead. This is a practical sanity check, not a performance benchmark.

## Deliverables

qa-output/reference-side-by-side.jpg, reference-coverage.json, reference-source.png, desktop-1440.png, portrait-390.png, portrait-bush-controls.png, five-presets-contact-sheet.jpg, results.json and unit-results.txt retain the actual evidence. Source rebuilding uses:

```sh
python3 scripts/trace-reference.py qa-output/reference-source.png reference-layout.mjs
```

The trace script requires Pillow and numpy. The editor itself has no package dependencies and does not read the QA reference PNG at runtime.

No healing/gameplay simulation, public deployment, DNS/access change, commit or push is claimed. Source stays isolated under map-creator; unrelated existing art/lore, Tycoon and animation work are unchanged.
