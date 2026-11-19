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
- **User interaction:** **Pass turn** alternates between Red and Blue. **Reset** restores Red's first turn and the starting layout.
- **Animation:** a `requestAnimationFrame` loop spins and bobs the crystals, and the pawns of the team to play hover so you can see whose turn it is.

## Files

- `matrix.js`: 4 × 4 matrix utilities (`mult`, `translate`, `scale`, `rotateY`, `lookAt`, `perspective`, `ortho`).
- `game.js`: starting layout and turn state.
- `renderer.js`: builds the tile, pawn and crystal meshes and draws them with WebGL 1, using model-view and projection matrices.
- `main.js`: connects the game state, renderer, buttons and animation loop.

## Planned work

Pawn selection and picking, movement and command rules, energy, camera controls (orbit and zoom) and lighting.
