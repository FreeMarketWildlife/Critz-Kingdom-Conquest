> Historical five-original-map review. The current five defaults replace Diamond with the supplied reference reconstruction; see REFERENCE-REVIEW.md. Four original maps retain enforced point symmetry, while the reference preserves source asymmetry.

# Five-map review — resumed after desktop update

The requested term is **point symmetry**, also called **180° rotational symmetry of order 2**. The five new defaults replace the rejected thirty. They are original programmatically authored geometry, not generated map pictures or traced reference images.

## Construction

Each source path or polygon is paired using `R(x,y)=(1000-x,1000-y)`. Ordinary partner features use the exact transformed coordinates in the same point order. Self-symmetric paths are assembled from a source half and its rotated reversed half. Jungle polygons, river paths and lane paths all follow this contract. Feature widths and edits propagate through reciprocal IDs. Every map has a 1000×1000 coordinate square and no hidden legacy terrain arrays.

The five designs have distinct road networks and region topology: a three-lane diamond, west/east braid, ring with spokes, wide crescent flanks, and five switchback corridors. Connecting roads are distinct from the nominal lane count.

## Authoring verification

Actual browser flows draw lane, river and polygon terrain through the visible tools, finish their pairs, drag control points, change widths, delete paired geometry, undo/redo, export/import, switch maps, reload drafts and use portrait touch input. The geometry is stored in the editable document, not in a background raster. Invalid legacy imports while editing geometry were reviewed and the stale-selection failure was fixed. Legacy saved draft data remains intact and is explicitly labeled.

## Symmetry and connectivity verification

- Independent computational checks compare every generated partner to the exact rotated coordinates and compare canonical point sets, including self-symmetric paths.
- All five lane networks have one connected component and touch both castle centers. The checker includes centerline segment intersections.
- Default team structures use paired team swaps and orientations. Dragex and Moana are independent neutral landmarks by explicit instruction; they are intentionally omitted from automatic structure pairing and from terrain raster comparisons.
- Actual SVG terrain renders are rasterized at 1000×1000 and compared with their 180° rotation. Mathematical geometry matches exactly. Browser edge antialiasing causes small raster differences: worst map 0.0598% of pixels exceeded an 8/255 channel delta; mean channel error was at most 0.004335/255. Island Crown matched pixel-for-pixel. See results.json for each map.

## Scope

These are usable map-authoring presets, not playtested game levels. Route checks are diagram centerline connectivity, not gameplay pathfinding, combat balance, river traversal or jungle collision simulation. Terrain symmetry remains mandatory during editing; disconnected drafts are allowed with a warning. Legacy terrain is preserved read-only rather than silently rewritten. Browser history is session-local.

No imagegen, public hosting, DNS or access-policy change was performed. The only source changes are in the new map-creator directory of the intended Mac repository. The old native ZIP/contact sheet remain historical backups and are not the new design recommendation.
