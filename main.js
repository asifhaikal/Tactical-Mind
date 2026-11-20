"use strict";

const canvas = document.querySelector("#board");
const turnLabel = document.querySelector("#turn");
const passButton = document.querySelector("#pass");
const resetButton = document.querySelector("#reset");

function showError(error) {
  const message = document.querySelector("#error");
  message.hidden = false;
  message.textContent = `Could not start Tactical Mind 3D. ${error.message}`;
}

try {
  let game = createGame();
  const draw = createRenderer(canvas);
  const updateLabel = () => {
    turnLabel.textContent = `Turn ${game.turn} · ${game.player} to play`;
  };

  passButton.addEventListener("click", () => {
    passTurn(game);
    updateLabel();
  });
  resetButton.addEventListener("click", () => {
    game = createGame();
    updateLabel();
  });

  // Camera controls: drag to orbit, scroll to zoom. Pointer events cover the
  // mouse, pen and touch; pointer capture keeps the drag going off the canvas.
  let drag = null;
  canvas.addEventListener("pointerdown", event => {
    drag = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", event => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag = { x: event.clientX, y: event.clientY };
    // Horizontal drag spins around the board, vertical drag tilts it.
    CAMERA.azimuth -= dx * .4;
    CAMERA.elevation = Math.min(CAMERA.maxElevation,
      Math.max(CAMERA.minElevation, CAMERA.elevation + dy * .3));
  });
  const endDrag = () => { drag = null; };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  // Exponential zoom feels even at every distance; passive: false so the
  // page does not scroll while zooming.
  canvas.addEventListener("wheel", event => {
    event.preventDefault();
    CAMERA.radius = Math.min(CAMERA.maxRadius,
      Math.max(CAMERA.minRadius, CAMERA.radius * Math.exp(event.deltaY * .001)));
  }, { passive: false });

  // Animation loop: redraws every frame, so resizing is handled here too.
  const frame = now => {
    try {
      draw(game, now / 1000);
      requestAnimationFrame(frame);
    } catch (error) {
      showError(error);
    }
  };

  updateLabel();
  draw(game, performance.now() / 1000);
  passButton.disabled = false;
  resetButton.disabled = false;
  requestAnimationFrame(frame);
} catch (error) {
  showError(error);
}
