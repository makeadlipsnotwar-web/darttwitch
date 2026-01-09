let game;

function initGame(settings) {
  game = {
    settings,
    currentPlayer: 0,
    dartsThrownInTurn: 0,
    currentTurnScore: 0,
    players: [
      createPlayer("Spieler A"),
      createPlayer("Spieler B")
    ]
  };
}

function createPlayer(name) {
  return {
    name,
    score: game.settings.startScore,
    legs: 0,
    sets: 0,
    darts: 0,
    points: 0,
    highest: 0
  };
}

const game = {
  settings: {
    startScore: 501,
    doubleOut: true,
    bestOfLegs: 5,
    bestOfSets: 3
  },

  currentPlayer: 0,
  dartsThrownInTurn: 0,
  currentTurnScore: 0,

  players: [
    {
      name: "Spieler A",
      score: 501,
      legs: 0,
      sets: 0,
      darts: 0,
      points: 0,
      highest: 0
    },
    {
      name: "Spieler B",
      score: 501,
      legs: 0,
      sets: 0,
      darts: 0,
      points: 0,
      highest: 0
    }
  ]
};
let multiplier = 1;
let pendingThrow = 0;

function selectNumber(value) {
  pendingThrow = value * multiplier;
}

function setDouble() {
  multiplier = 2;
}

function setTriple() {
  multiplier = 3;
}
function throwDart() {
  const player = game.players[game.currentPlayer];

  // Bust prüfen
  const newScore = player.score - pendingThrow;

  if (newScore < 0 || (game.settings.doubleOut && newScore === 1)) {
    bust();
    return;
  }

  // Check-out prüfen
  if (newScore === 0) {
    if (game.settings.doubleOut && multiplier !== 2) {
      bust();
      return;
    }
    finishLeg();
    return;
  }

  // Normaler Wurf
  player.score = newScore;
  player.darts++;
  player.points += pendingThrow;

  game.currentTurnScore += pendingThrow;
  game.dartsThrownInTurn++;

  player.highest = Math.max(player.highest, pendingThrow);

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

  if (player.legs > game.settings.bestOfLegs / 2) {
    player.sets++;
    resetLegs();
  }

  if (player.sets > game.settings.bestOfSets / 2) {
    alert(`${player.name} gewinnt das Match`);
  }

  endTurn();
}
function resetScores() {
  game.players.forEach(p => p.score = game.settings.startScore);
}

function resetLegs() {
  game.players.forEach(p => p.legs = 0);
}

function resetThrow() {
  multiplier = 1;
  pendingThrow = 0;
}
