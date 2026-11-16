"use strict";

const BOARD_WIDTH = 7;
const BOARD_DEPTH = 5;

function createGame() {
  return {
    player: "Red",
    turn: 1,
    pieces: [
      { x: 0, z: 2, kind: "crystal", team: "Red" },
      { x: 6, z: 2, kind: "crystal", team: "Blue" },
      { x: 3, z: 1, kind: "crystal", team: "Neutral" },
      { x: 3, z: 3, kind: "crystal", team: "Neutral" },
      ...[1, 2, 3].map(z => ({ x: 1, z, kind: "pawn", team: "Red", level: 1 })),
      ...[1, 2, 3].map(z => ({ x: 5, z, kind: "pawn", team: "Blue", level: 1 })),
    ],
  };
}

function passTurn(game) {
  game.player = game.player === "Red" ? "Blue" : "Red";
  game.turn += 1;
}
