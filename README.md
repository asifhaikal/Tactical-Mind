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
- **Camera:** `lookAt` builds the view matrix and `perspective` builds the projection matrix (see `matrix.js`). `ortho` is also available. The camera orbits the board in spherical coordinates (azimuth, elevation, radius); the eye position is recomputed every frame in `renderer.js`.
- **User interaction:** **drag** on the board to orbit (elevation is kept between 15° and 85°) and **scroll** to zoom. Touch drag works too. **Pass turn** alternates between Red and Blue. **Reset** restores Red's first turn and the starting layout.
- **Lighting (in progress):** every mesh stores a face normal per vertex. The vertex shader moves it to eye space with the normal matrix (the inverse transpose of the model-view, needed because taller pawns are scaled unevenly) and applies Lambert diffuse from one directional light plus ambient. The light is fixed in the world, so shading stays put while the camera orbits. Specular highlights and the two crystal point lights are next.
- **Animation:** a `requestAnimationFrame` loop spins and bobs the crystals, and the pawns of the team to play hover so you can see whose turn it is.

## Files

- `matrix.js`: 4 × 4 matrix utilities (`mult`, `translate`, `scale`, `rotateY`, `lookAt`, `perspective`, `ortho`), plus `normalMatrix` and `transformDirection` for lighting.
- `game.js`: starting layout and turn state.
- `renderer.js`: builds the tile, pawn and crystal meshes (positions and normals) and draws them with WebGL 1 and a lit shader. Holds the orbit `CAMERA` and the `LIGHT`.
- `main.js`: connects the game state, renderer, buttons, camera controls and animation loop.

## Planned work

Pawn selection and picking, movement and command rules, energy, specular (Phong) lighting with point lights in the Starting Crystals, and a top-down ortho view.
