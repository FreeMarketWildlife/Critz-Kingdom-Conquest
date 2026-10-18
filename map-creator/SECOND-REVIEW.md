> Historical review of the earlier thirty-preset build. Superseded by FIVE-MAPS.md and QA.md; the current tool has five editable point-symmetric maps.

# Focused second review — 18 October 2026

## Verified issue and fix

The original model rejected only coincident paired anchors. A gate at (500,490) with its partner at (500,510) passed while their drawn footprints overlapped. The model now rejects overlap between rotational partner rectangles, projected into the structure's rotated local axes. A gate has a 48×36 authoring footprint. Touching boundaries pass; overlap fails transactionally. Import validation uses the same rule even for retained links while pairing is off. A rotation that would cause overlap is rejected without changing the map; the UI catches it and explains the rejection. Selected structures show the rotated footprint. These dimensions are editor glyph footprints, not invented gameplay collision measurements.

## Lifecycle disposition

- Moving or deleting either red or blue partner applies once to both linked entities while pairing is on. One undo/redo restores/removes the pair with the same IDs and orientations.
- Neutral camps and shops remain independent. They are not silently converted to either team.
- Toggling off and on without editing retains valid links. An independent move, rotation, or deletion while off detaches both reciprocal links. Re-enabling never manufactures or relinks objects.
- Pair imports reject missing, self, asymmetric, cyclic, mismatched kind/team, incorrectly rotated, and overlapping pair data. Rejected imports preserve the current draft.
- Dragex and Moana can be explicitly placed/imported as independent landmarks but may never carry pair IDs. Ordinary pair operations never create, move, rotate, copy, or delete them. Invalid boss-pair imports are rejected rather than repaired by cloning.

## Visual reference check

Both supplied Library PNGs were materialized and visually inspected: the annotated early-fall battlefield and MOBA reference image grid. The editor retains their simple readable roads/jungle/water and structure hierarchy. Its dark desktop toolbox, icon-first palette, short labels, tooltips, and touch portrait layout follow the inspected Tycoon Map Studio and sprite editor. No paused Tycoon work or website animation was edited.

## Source-location correction

The intended source is `/Users/tanoshi/Documents/ChatGPT/Critz-Kingdom Conquest` on the supplied Mac. Its concept file and sibling `/Users/tanoshi/Documents/ChatGPT/Critz-Tycoon` are present and readable. The earlier wrong-host/missing-source inference was incorrect: the delegated task's cwd was empty and the initially inspected public clone lacked local uncommitted application/concept work. The exact ChatGPT paths resolved once supplied; no access denial occurred. The public clone was not used as the implementation base. The isolated editor directory was added to the intended Mac repository and compared byte-for-byte with the tested source.

## Hosting investigation

No `.openai/hosting.json`, Worker/Vercel/Netlify deployment configuration, or CI deployment route was found for Kingdom Conquest. Connected Sites inventory contains the existing Globe, Tycoon, and Tower of Babel projects, none identified as a Kingdom Conquest editor destination. Those projects were not reused or modified. The existing repository instructions document localhost preview only.

Options are to keep the current localhost preview, or establish a dedicated owner-private Sites destination after the user chooses that hosting route. No public Site, DNS change, access-policy change, or lore publication was performed.

## Library delivery correction

The batch helper previously stopped before creating upload sessions with `Library prepare_uploads is not available`. On this review, native local-file upload succeeded for all three screenshots/contact sheet; their final versions preserve the same Library identities. The final source ZIP is delivered through the same supported native local-file route. There is no remaining Library upload blocker.
