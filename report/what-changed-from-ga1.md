# What changed from GA1 and why

Our GA1 proposal described the finished game: a 7 × 5 board with a rules engine, an action wheel, Phong lighting, colour-ID picking and a scene graph. At the GA2 checkpoint the board, the pieces and every core graphics feature run. Several parts are simpler than planned or have moved later in the schedule. The game itself (the 7 × 5 board, Starting and Energy Crystals, five commands, shared prices) and our two committed advanced features (picking and hierarchical modeling) are unchanged.

## 1. Schedule: graphics first, rules second

**GA1 plan:** the rules engine (GameState, costs, unit tests) would be built in the week of 11/05, alongside the geometry. Lighting, the orbit camera and picking would follow in the week of 11/12, and a playable hot-seat game would be ready by 11/19.

**Now:** the graphics pipeline is in place: our own geometry, model-view transforms, a `lookAt` / `perspective` camera with orbit and zoom, a `requestAnimationFrame` loop and diffuse lighting. The game state only tracks turns: Pass turn and Reset work, but commands and energy do not yet.

**Why:** we wanted a runnable build that shows every required graphics feature before adding game rules on top of it. Each rule we add later (selecting a pawn, highlighting legal tiles, animating an attack) depends on the camera, lighting and picking. Getting those right first means we will not have to rework the rules code when the renderer changes. Picking, the scene graph and the rules engine are now the work for the weeks of 11/19 and 11/26, and the AI moves to the polish week.

## 2. Our own small matrix library instead of MV.js (for now)

**GA1 plan:** use the course's MV.js and initShaders.js.

**Now:** `matrix.js` is about 130 lines of our own code: `mult`, `translate`, `scale`, `rotateY`, `lookAt`, `perspective`, `ortho` and, for lighting, `normalMatrix` and `transformDirection`. It stores column-major `Float32Array`s that go straight to `gl.uniformMatrix4fv`.

**Why:** writing these ourselves made us work through the math from the lectures: the `lookAt` basis vectors, the perspective divide and the inverse transpose behind the normal matrix. It also keeps the checkpoint free of dependencies. Most function names match MV.js, so we can switch to the course library before final submission if required.

## 3. Lighting is staged: diffuse now, Phong next

**GA1 plan:** Phong shading with a white key light and a red and a blue point light inside the two Starting Crystals.

**Now:** every mesh stores a face normal for each vertex. The vertex shader moves the normal to eye space with the normal matrix and applies Lambert diffuse from one directional light plus a fixed ambient term. The light is set in world space and moved into eye space with the view matrix each frame, so the shading stays fixed to the board while the camera orbits. This replaces the first prototype's hand-picked grey "shade" per face, which was not real lighting.

**Why:** we got the normals right before adding specular highlights. Two things needed care:

- **Normals must point outward.** Our face tables were not wound consistently, so each normal is computed from a cross product and flipped if it points toward the mesh centre.
- **Scaled pawns need the normal matrix.** Higher-level pawns are drawn taller with `scale(1, h, 1)`. A non-uniform scale bends normals if they are transformed by the model-view matrix itself, so we use its inverse transpose.

Our meshes are flat-shaded, so per-vertex diffuse looks the same as per-fragment diffuse. Specular highlights and point lights do change across a face, so they need the fragment's eye-space position in the fragment shader. That is the next step.

## 4. Camera: orbit and zoom done, top view later

**GA1 plan:** an orbit camera in spherical coordinates, elevation 15–85°, a 45° field of view and an O key that switches to a top-down orthographic view.

**Now:** dragging changes the azimuth and elevation (clamped to 15–85°) and the scroll wheel changes the radius (5 to 16 units). The eye position is recomputed from these three values every frame and passed to `lookAt`. Zoom is exponential (`radius × e^(deltaY · k)`), so each wheel step feels the same near and far. We use pointer events with pointer capture rather than mouse events, so touch screens work and a drag continues when the cursor leaves the canvas. The field of view stays at 48°, as in our first prototype, because it frames the whole board in our 3:2 canvas. The orthographic top view is not wired up yet, although `ortho()` is already in `matrix.js`.

**Why:** the orbit camera makes the board readable from any side, which matters once pawns stack up to five levels and block each other. The top view is a convenience, and it is already last in our cut order.

## 5. Placeholder geometry

**GA1 plan:** pawns made of stacked frustums, one layer per level, and octahedron crystals.

**Now:** a pawn is two stacked boxes scaled taller per level, and a crystal is an octahedron with a taller top half. Both are generated from our own vertex data.

**Why:** a pawn with one layer per level fits the scene graph naturally (Board → Tile → Pawn → Level layers), so we will build it together with the hierarchical modeling work rather than twice.

## 6. Interface

**GA1 plan:** a HUD with energy, income and live command prices, and an action wheel modeled as its own hierarchy (Wheel → 5 segments → icon + price).

**Now:** a turn label and HTML **Pass turn** and **Reset** buttons.

**Why:** the HUD and the wheel display energy and prices, which do not exist until the rules engine is in. We are also considering building the wheel in HTML instead of WebGL, because it is easier to make accessible and to read at small sizes. The hierarchical modeling requirement would still be met by the board's scene graph.
