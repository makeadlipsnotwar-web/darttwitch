// game.js

let game = null;
let multiplier = 1;
let pendingValue = null;

function initGame(settings) {
  game = {
    settings: { ...settings },
    currentPlayer: 0,
    dartsThrownInTurn: 0,
    currentTurnScore: 0,
    players: [
      createPlayer("Spieler A", settings.startScore),
      createPlayer("Spieler B", settings.startScore)
    ]
  };
}

function createPlayer(name, startScore) {
  return {
    name,
    score: startScore,
    legs: 0,
    sets: 0,
    darts: 0,
    points: 0,
    highest: 0
  };
}

/* ======================
   INPUT
====================== */

function selectNumber(value) {
  pendingValue = value * multiplier;
}

function setDouble() {
  multiplier = 2;
}

function setTriple() {
  multiplier = 3;
}

/* ======================
   CORE LOGIC
====================== */

function throwDart() {
  if (pendingValue === null) return;

  const player = game.players[game.currentPlayer];
  const newScore = player.score - pendingValue;

  // Bust
  if (
    newScore < 0 ||
    (game.settings.doubleOut && newScore === 1)
  ) {
    bust();
    return;
  }

  // Finish
  if (newScore === 0) {
    if (game.settings.doubleOut && multiplier !== 2) {
      bust();
      return;
    }
    finishLeg();
    return;
  }

  // Normal throw
  player.score = newScore;
  player.darts++;
  player.points += pendingValue;
  player.highest = Math.max(player.highest, pendingValue);

  game.currentTurnScore += pendingValue;
  game.dartsThrownInTurn++;

  resetThrow();

  if (game.dartsThrownInTurn === 3) {
    endTurn();
  }
}

function bust() {
  const player = game.players[game.currentPlayer];
  player.score += game.currentTurnScore;
  endTurn();
}

function endTurn() {
  game.currentTurnScore = 0;
  game.dartsThrownInTurn = 0;
  game.currentPlayer = game.currentPlayer === 0 ? 1 : 0;
  resetThrow();
}

function finishLeg() {
  const player = game.players[game.currentPlayer];
  player.legs++;

  resetScores();

  const neededLegs = Math.ceil(game.settings.bestOfLegs / 2);
  if (player.legs >= neededLegs) {
    player.sets++;
    resetLegs();
  }

  const neededSets = Math.ceil(game.settings.bestOfSets / 2);
  if (player.sets >= neededSets) {
    alert(`${player.name} gewinnt das Match`);
  }

  endTurn();
}

/* ======================
   RESET HELPERS
====================== */

function resetScores() {
  game.players.forEach(p => {
    p.score = game.settings.startScore;
  });
}

function resetLegs() {
  game.players.forEach(p => {
    p.legs = 0;
  });
}

function resetThrow() {
  multiplier = 1;
  pendingValue = null;
}
