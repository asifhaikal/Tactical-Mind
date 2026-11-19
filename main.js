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
