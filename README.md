# Tactical Mind 3D

CMPSC 457 · Bakar Demba, Hamza Habbati, Asif Masri

## How to run

Open `index.html` in a WebGL-enabled browser (Chrome, Firefox, Edge or Safari). The project has no dependencies or build step.

If your browser blocks local files, run a small local server from the project folder and open the address it prints:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## What works now (GA2 checkpoint)

The game opens on a 3D view of the 7 × 5 board. Each team has three level-1 pawns and one starting crystal, and there are two neutral energy crystals.

- **3D geometry with model-view transformations:** each tile, pawn and crystal mesh is built once in its own local coordinates. Every object is then drawn with its own model matrix (`translate`, `rotateY`, `scale`) multiplied by the camera's view matrix.
- **Camera:** `lookAt` builds the view matrix and `perspective` builds the projection matrix (see `matrix.js`). `ortho` is also available.
- **Pawn selection and picking:** click one of your pawns to select it. The selected pawn is tinted brighter. Clicking another friendly pawn changes the selection; clicking outside the board clears it. Selection uses a separate color-ID render pass with depth testing.
- **Movement:** click an empty tile next to the selected pawn to move one tile horizontally, vertically or diagonally. A successful move clears selection and passes the turn. Occupied, distant and off-board tiles are blocked. Invalid moves do not use a turn. This checkpoint allows level-1 pawns to move so selection and movement can be demonstrated; final level-5 movement restrictions will be integrated with upgrades later.
- **Turn controls:** **Pass turn** alternates between Red and Blue and clears selection. **Reset** restores Red's first turn and the starting layout.
- **Animation:** a `requestAnimationFrame` loop spins and bobs the crystals, and the pawns of the team to play hover so you can see whose turn it is.

## Files

- `matrix.js`: 4 × 4 matrix utilities (`mult`, `translate`, `scale`, `rotateY`, `lookAt`, `perspective`, `ortho`).
- `game.js`: starting layout, selection state, movement validation and turn changes.
- `renderer.js`: mesh drawing, selected-pawn tint and offscreen color-ID picking using the same camera and geometry as the visible scene.
- `main.js`: connects mouse clicks, game state, renderer, buttons and animation loop.

## What still needs to be done

- Add spawn, upgrade, attack and disable commands, with clear legal-target feedback.
- Add energy collection, shared command prices and the final pawn action rules. When upgrades work, connect movement to the agreed level requirement.
- Add victory detection when an enemy starting crystal is attacked, plus a winner message and restart flow.
- Make the camera movable with orbit and zoom controls. The current camera is fixed.
- Add actual lighting with vertex normals and a light source. The current face shades are preset colors, not lighting calculations.
- Add hierarchical pawn modeling as the second advanced feature. The current pawn is a single combined mesh.
- Align the matrix helpers with the instructor's required MV.js setup and check the rendering still works.
- Test full matches, picking after resize and on different screens, then finish the final demo and AI Use Log.

Extra maps, sound and particles can wait until the required features work reliably.

## Updated timeline through 12/10

These are planned tasks. Owners are proposed for the team to confirm.

| Dates | Goal | Main responsibility |
| --- | --- | --- |
| 11/19-11/22 | Integrate and review selection, picking and movement. Test invalid targets, turn switching and reset. | Hamza; Asif helps with integration |
| 11/23-11/25 | Add command handling and energy rules. Work on camera controls and hierarchical pawn parts. | Hamza: rules; Asif: controls; Bakar: models |
| 11/26-12/02 | Complete lighting, victory detection and command integration. Check all six requirements and both advanced features. | All members; Bakar leads lighting |
| 12/03-12/06 | Freeze features, fix bugs, test lab hardware, confirm MV.js compatibility and update documentation. | All members |
| 12/07-12/09 | Rehearse the demo, divide speaking parts and prepare a backup local copy. | All members |
| 12/10 | Final presentation and submission. | All members |
