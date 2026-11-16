# Tactical Mind 3D

CMPSC 457 · Bakar Demba, Hamza Habbati, Asif Masri

Open `index.html` in a WebGL-enabled browser. The starter has no dependencies or build step.

## First milestone

The game opens to a fixed 3D view of the 7 × 5 board, with three level-1 pawns and one starting crystal per team, plus two neutral energy crystals. **Pass turn** alternates Red and Blue. **Reset** restores Red's first turn and the starting layout.

- `game.js` holds the starting layout and turn state.
- `renderer.js` generates tile, pawn and crystal geometry and draws it with WebGL 1.
- `main.js` connects the game state, renderer and buttons.

Planned work includes pawn selection and picking, command rules and energy, course matrix utilities, camera controls and lighting.
