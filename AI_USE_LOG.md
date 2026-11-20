# AI Use Log

| Date | Team member | Tool | Request | Output used |
| --- | --- | --- | --- | --- |
| 2026-11-16 | Asif Masri | ChatGPT Codex | Build a minimal runnable WebGL starter for Tactical Mind 3D. | Generated the starting board, procedural placeholder geometry, fixed camera, turn and reset controls, and README. |
| 2026-11-19 | Asif Masri | Claude | Bring the starter up to the GA2 checkpoint minimum: model-view transformations, a lookAt/perspective camera and requestAnimationFrame animation. | Added `matrix.js` (mult, translate, scale, rotateY, lookAt, perspective, ortho). Rewrote `renderer.js` to draw each mesh with its own model-view matrix, and `main.js` to run an animation loop (spinning crystals, hovering active pawns). Updated README run instructions. |
| 2026-11-19 | Bakar Demba | Claude | Add camera controls (drag to orbit, scroll to zoom) and basic lighting with normals for the GA2 checkpoint, and draft the "What changed from GA1 and why" report section. | Added spherical orbit `CAMERA` and a world-fixed `LIGHT` in `renderer.js`, pointer and wheel events in `main.js`, per-face normals and a Lambert diffuse + ambient shader, `normalMatrix` / `transformDirection` in `matrix.js`. Checked in the browser that drag, zoom and shading work. *To fill in: what Bakar reviewed or changed in the code and the report text.* |
