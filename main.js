"use strict";

const canvas = document.querySelector("#board");
const turnLabel = document.querySelector("#turn");
const passButton = document.querySelector("#pass");
const resetButton = document.querySelector("#reset");

try {
  let game = createGame();
  const draw = createRenderer(canvas);
  const render = () => {
    turnLabel.textContent = `Turn ${game.turn} · ${game.player} to play`;
    draw(game);
  };

  render();
  passButton.disabled = false;
  resetButton.disabled = false;
  passButton.addEventListener("click", () => {
    passTurn(game);
    render();
  });
  resetButton.addEventListener("click", () => {
    game = createGame();
    render();
  });
  window.addEventListener("resize", render);
} catch (error) {
  const message = document.querySelector("#error");
  message.hidden = false;
  message.textContent = `Could not start Tactical Mind 3D. ${error.message}`;
}
