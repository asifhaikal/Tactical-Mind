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
    turnLabel.textContent = `Turn ${game.turn} · ${game.player} to play${game.selectedPawn ? " · Pawn selected: click an empty nearby tile" : " · Click one of your pawns"}`;
  };

  // A picking pass returns the board cell under the mouse, including pawn surfaces.
  canvas.addEventListener("click", event => {
    const cell = draw.pick(game, performance.now() / 1000, event.clientX, event.clientY);
    if (!cell) {
      game.selectedPawn = null;
    } else {
      const piece = pieceAt(game, cell.x, cell.z);
      if (piece && piece.kind === "pawn" && piece.team === game.player) {
        selectPawn(game, cell.x, cell.z);
      } else if (!movePawn(game, cell.x, cell.z)) {
        // Invalid targets do not consume a turn or discard the selected pawn.
        turnLabel.textContent = `Turn ${game.turn} · ${game.player}: choose an empty adjacent tile`;
        return;
      }
    }
    updateLabel();
  });

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
