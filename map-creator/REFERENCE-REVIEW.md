# Supplied-reference reconstruction, bushes, base ground and fountains

The default library remains five maps: the supplied-reference reconstruction replaces Diamond, while Braided Marches, Island Crown, Crescent Divide and Highland Switchbacks remain unchanged. Saved Diamond and other user drafts are retained separately; they are not silently replaced.

## Actual source shapes

The supplied Library PNG `libfile_0c16c28080ac8191b53f9a491927a99c` was downloaded and visually inspected. Its board is normalized from source crop `(13,15)-(689,691)`, a676×676 square, into1000×1000 map coordinates. The generator `scripts/trace-reference.py` segments actual flat colors and traces their boundaries into280 editable polygons. Those polygons include the olive ground outline, both river banks, detailed curved black jungle walls/corridors, two team base-ground areas and their internal details. The actual bright-green mask becomes3063 small editable bush dabs. No reference bitmap is used as the map background, no generated replacement image was used, and no generic lane lines were overlaid to stand in for the source shapes.

The side-by-side comparison uses the actual editorSVG raster and the normalized source. Terrain-class agreement is approximately97.9% under the documented palette segmentation, not a pixel-perfect claim. This metric groups related base colors and is supporting evidence, not a substitute for the visual comparison. Remaining differences include antialiased/simplified contour edges, small brush-dab edge scalloping, palette quantization and fountain healing-cross/zone annotations. The source's hand-drawn asymmetries and distinct southwest/northeast fountain positions are intentionally preserved. This reference preset does **not** claim exact point symmetry. Its rotation toggle starts off; new geometry, structures, bush painting and erasing can still use180° counterparts. The other four original maps retain exact point-symmetric geometry.

## Bush layer and history

Bushes are a separate bright-green paint layer, not jungle polygons. Mouse and touch strokes interpolate smoothly at the chosen radius. The rotation toggle applies to both painting and erasing, with center deduplication. One pointer stroke creates one undo/redo entry; cancel restores the pre-stroke document. Empty erasing and outside-map clicks do not add history. Imported reference dabs can be erased normally. Paint masks and each dab's radius persist in drafts and JSON. The layer is bounded at10000 stamps; rejected oversized operations leave the draft unchanged.

## Base and fountain semantics

Base ground is an independently editable team-affiliated polygon type. New paired base areas rotate their geometry and swap teams. The reference starts with separately traced blue southwest and red northeast areas so their actual outlines are not forced into a false exact pair.

Fountains are healing-zone map objects (`kind: fountain`, `healingZone: true`, team, position, orientation and editable radius5–150). With pairing on, new placement and radius edits propagate to the opposing team partner; off uses the existing independent/detach policy. The reference's two starting fountains retain the drawn coordinates and are independent. The cross and circular zone are editor annotations requested for clarity, not gameplay simulation or an assertion that the source contained those symbols. Dragex/Moana exclusions remain unchanged.

## Preservation and limits

The only project changes are under the existing Mac repository's map-creator directory. The earlier unrelated tracked art/lore edits are verified unchanged. Existing draft storage and validated import/export remain compatible. No commit/push, public deployment, DNS or access change was performed. Gameplay healing, movement/pathfinding, collision and competitive balance are not simulated. Source reference images are retained only as QA/provenance material; the running editor renders geometry and paint data.
