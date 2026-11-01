# Critz Kingdom Conquest — Idea Vault

This folder stores the evolving creator-directed design, **not finished production specs**.

1. [Vision and world lore](00-vision-and-lore.md)
2. [Full working Conqueror roster](01-conqueror-roster.md)
3. [Ability kits and inspiration mapping](02-character-kits-and-inspirations.md)
4. [Minion factions and outstanding questions](03-minions-and-open-questions.md)

Decisions are separated from suggestions. Voice-dictated names, the ancient tortoise's proper spelling, and undecided animal species are explicitly marked pending rather than guessed.

## Proposed technical vocabulary for future prototypes

Source: [Game Development Cheat Sheet](https://gamedev-cheatsheet.com/) (reviewed November 1, 2026). These are original project-specific applications of its terminology, not copied implementation recipes or new confirmed design decisions. This repository is a design vault; no engine or production architecture is selected by this note.

- **Steering / arrival / separation:** useful for lane-minion crowds approaching targets without stacking or oscillating. Treat obstacle routing and lane rules separately; steering alone is not pathfinding.
- **Finite state machines:** useful vocabulary for documenting minion target acquisition, attack, target loss and lane return. Specify transitions and priorities before choosing FSM, behavior tree or another implementation.
- **Raycasting and swept collision (tunneling):** describe line-of-sight and fast skill-shot collision separately. Define wall blocking, friendly targets, projectile radius and exactly-once hit rules before implementation.
- **Time slicing / frame budget:** potentially useful for many minions, but only after measuring a prototype. Stagger expensive decisions, not authoritative movement, damage or cooldown timing. State acceptable reaction latency.

### Planning prompt

> For the proposed lane-minion prototype, describe desired crowd behavior using arrival and separation. Map acquire/attack/lose-target/return transitions and unresolved targeting priorities. Preserve the confirmed Conqueror/minion design and bells currency. Propose measurable acceptance cases for narrow lanes, target death, obstructed sight and crowded towers. Do not choose an engine, invent balance values or mark open design decisions confirmed.

For any later implementation request, add the actual engine and existing architecture, tunable units, edge cases, tests and explicitly unchanged behavior. The site's web/2D snippets and example timings are not project specifications; do not introduce platformer coyote time or global hit-stop merely because they appear in the glossary.
