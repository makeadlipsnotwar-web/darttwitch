// game.js

let game = null;
let multiplier = 1;
let pendingValue = null;

/**
 * Initialisiert ein neues Spiel basierend auf den übergebenen Einstellungen.
 */
function initGame(settings) {
  const players = [];
  // Erstellt dynamisch die Anzahl an Spielern
  for (let i = 0; i < settings.playerCount; i++) {
    const name = settings.playerNames[i] || `Spieler ${i + 1}`;
    players.push(createPlayer(name, settings.startScore));
  }

  game = {
    settings: { ...settings },
    currentPlayer: 0,
    dartsThrownInTurn: 0,
    currentTurnScore: 0,
    // Speichert den Punktestand zu Beginn der Aufnahme für den Bust-Fall
    scoreAtTurnStart: settings.startScore, 
    players: players,
    isGameOver: false
  };
}

function createPlayer(name, startScore) {
  return {
    name,
    score: startScore,
    legs: 0,
    sets: 0,
    dartsTotal: 0,
    highestTurn: 0
  };
}

/* ======================
    INPUT LOGIC (für app.js)
====================== */

function selectNumber(value) {
  pendingValue = value * multiplier;
}

function setMultiplier(m) {
  multiplier = m;
}

/* ======================
    CORE LOGIC
====================== */

function throwDart() {
  if (pendingValue === null || game.isGameOver) return;

  const player = game.players[game.currentPlayer];
  const newScore = player.score - pendingValue;

  // 1. Check auf BUST (Überworfen)
  // Regeln: < 0 ODER genau 1 (da man mit Doppel auf 0 kommen muss) 
  // ODER Score 0 aber kein Doppel beim Double-Out
  const isDouble = (multiplier === 2);
  const isBust = 
    newScore < 0 || 
    (newScore === 1 && game.settings.doubleOut) ||
    (newScore === 0 && game.settings.doubleOut && !isDouble);

  if (isBust) {
    handleBust();
    return;
  }

  // 2. Check auf FINISH (Leg gewonnen)
  if (newScore === 0) {
    player.score = 0;
    player.dartsTotal++;
    finishLeg();
    return;
  }

  // 3. Normaler Wurf
  player.score = newScore;
  player.dartsTotal++;
  game.currentTurnScore += pendingValue;
  game.dartsThrownInTurn++;

  resetThrow();

  // Aufnahme beendet nach 3 Darts
  if (game.dartsThrownInTurn === 3) {
    endTurn();
  }
}

function handleBust() {
  const player = game.players[game.currentPlayer];
  // Score auf den Stand vor der Aufnahme zurücksetzen
  player.score = game.scoreAtTurnStart;
  // Wurf-Statistik trotzdem erhöhen (3 Darts verbraucht)
  player.dartsTotal += (3 - game.dartsThrownInTurn); 
  
  endTurn();
}

function endTurn() {
  const player = game.players[game.currentPlayer];
  
  // Statistik: Höchste Aufnahme
  player.highestTurn = Math.max(player.highestTurn, game.currentTurnScore);

  // Nächster Spieler
  game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
  game.dartsThrownInTurn = 0;
  game.currentTurnScore = 0;
  
  // Neuen Start-Score für die nächste Aufnahme merken
  game.scoreAtTurnStart = game.players[game.currentPlayer].score;
  
  resetThrow();
}

function finishLeg() {
  const player = game.players[game.currentPlayer];
  player.legs++;

  const neededLegs = Math.ceil(game.settings.bestOfLegs / 2);
  
  if (player.legs >= neededLegs) {
    player.sets++;
    if (player.sets >= Math.ceil(game.settings.bestOfSets / 2)) {
      game.isGameOver = true;
      alert(`MATCH GEWONNEN VON ${player.name}`);
    } else {
      resetLegs();
    }
  }

  if (!game.isGameOver) {
    resetScores();
    // Nach einem Leg wechselt das Anwurfrecht normalerweise ab
    endTurn(); 
  }
}

/* ======================
    RESET HELPERS
====================== */

function resetScores() {
  game.players.forEach(p => {
    p.score = game.settings.startScore;
  });
  game.scoreAtTurnStart = game.settings.startScore;
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
