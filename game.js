"use strict";

const BOARD_WIDTH = 7;
const BOARD_DEPTH = 5;

function createGame() {
  return {
    player: "Red",
    selectedPawn: null,
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
  game.selectedPawn = null;
  game.player = game.player === "Red" ? "Blue" : "Red";
  game.turn += 1;
}

// Only the current player's pawns can be selected.
function pieceAt(game, x, z) {
  return game.pieces.find(piece => piece.x === x && piece.z === z) || null;
}

function selectPawn(game, x, z) {
  const piece = pieceAt(game, x, z);
  game.selectedPawn = piece && piece.kind === "pawn" && piece.team === game.player ? piece : null;
  return game.selectedPawn;
}

function canMovePawn(game, x, z) {
  const pawn = game.selectedPawn;
  if (!pawn || !game.pieces.includes(pawn) || pawn.kind !== "pawn" || pawn.team !== game.player) return false;
  if (!Number.isInteger(x) || !Number.isInteger(z) || x < 0 || z < 0 || x >= BOARD_WIDTH || z >= BOARD_DEPTH) return false;
  // One tile in any direction, including a diagonal. Occupied tiles are blocked.
  const distance = Math.max(Math.abs(pawn.x - x), Math.abs(pawn.z - z));
  return distance === 1 && !pieceAt(game, x, z);
}

function movePawn(game, x, z) {
  if (!canMovePawn(game, x, z)) return false;
  game.selectedPawn.x = x;
  game.selectedPawn.z = z;
  passTurn(game);
  return true;
}
