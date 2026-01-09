// game.js
let game = null;
let multiplier = 1;
let pendingValue = null;
let history = []; 

function initGame(settings) {
    const players = [];
    for (let i = 0; i < settings.playerCount; i++) {
        players.push({
            name: settings.playerNames[i] || `Spieler ${i + 1}`,
            score: Number(settings.startScore),
            legs: 0,
            sets: 0
        });
    }

    game = {
        settings: { ...settings },
        currentPlayer: 0,
        dartsThrownInTurn: 0,
        currentTurnScore: 0,
        scoreAtTurnStart: Number(settings.startScore),
        players: players,
        isGameOver: false
    };
    console.log("Spiel initialisiert", game);
}

function setMultiplier(m) {
    multiplier = m;
}

function selectNumber(value) {
    pendingValue = Number(value) * multiplier;
}

function throwDart() {
    if (pendingValue === null || !game || game.isGameOver) return;
    
    // State für Undo speichern
    history.push(JSON.parse(JSON.stringify({
        players: game.players,
        currentPlayer: game.currentPlayer,
        dartsThrownInTurn: game.dartsThrownInTurn,
        currentTurnScore: game.currentTurnScore,
        scoreAtTurnStart: game.scoreAtTurnStart
    })));

    const player = game.players[game.currentPlayer];
    const newScore = player.score - pendingValue;
    const isDouble = (multiplier === 2);
    
    // Bust Regeln
    const isBust = newScore < 0 || (newScore === 1 && game.settings.doubleOut) || (newScore === 0 && game.settings.doubleOut && !isDouble);

    if (isBust) {
        player.score = game.scoreAtTurnStart;
        endTurn();
    } else if (newScore === 0) {
        player.score = 0;
        finishLeg();
    } else {
        player.score = newScore;
        game.currentTurnScore += pendingValue;
        game.dartsThrownInTurn++;
        if (game.dartsThrownInTurn === 3) endTurn();
    }
    resetThrow();
}

function endTurn() {
    game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
    game.dartsThrownInTurn = 0;
    game.currentTurnScore = 0;
    game.scoreAtTurnStart = game.players[game.currentPlayer].score;
    resetThrow();
}

function finishLeg() {
    const player = game.players[game.currentPlayer];
    player.legs++;
    if (player.legs >= Math.ceil(game.settings.bestOfLegs / 2)) {
        player.sets++;
        game.players.forEach(p => p.legs = 0);
    }
    game.players.forEach(p => p.score = game.settings.startScore);
    endTurn();
}

function undoLastAction() {
    if (history.length === 0) return;
    const last = history.pop();
    Object.assign(game, last);
    resetThrow();
}

function resetThrow() {
    multiplier = 1;
    pendingValue = null;
}
