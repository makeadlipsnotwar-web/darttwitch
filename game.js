let game = null;
let multiplier = 1;
let history = [];

function initGame(settings) {
    const players = settings.playerNames.map(name => ({
        name: name,
        score: Number(settings.startScore),
        legs: 0,
        sets: 0
    }));

    game = {
        settings: { ...settings },
        currentPlayer: 0,
        currentTurnDarts: [],
        currentTurnScore: 0,
        scoreAtTurnStart: Number(settings.startScore),
        players: players,
        isGameOver: false,
        waitingForNextTurn: false
    };
}

function saveState() {
    history.push(JSON.parse(JSON.stringify({
        players: game.players,
        currentPlayer: game.currentPlayer,
        currentTurnDarts: game.currentTurnDarts,
        currentTurnScore: game.currentTurnScore,
        scoreAtTurnStart: game.scoreAtTurnStart,
        waitingForNextTurn: game.waitingForNextTurn
    })));
}

function addDart(value) {
    if (game.isGameOver || game.waitingForNextTurn || game.currentTurnDarts.length >= 3) return;

    saveState();
    const points = value * multiplier;
    const player = game.players[game.currentPlayer];
    const newScore = player.score - points;

    const isDouble = (multiplier === 2);
    const isBust = newScore < 0 || (newScore === 1 && game.settings.doubleOut) || (newScore === 0 && game.settings.doubleOut && !isDouble);

    if (isBust) {
        player.score = game.scoreAtTurnStart;
        game.currentTurnDarts.push("BUST");
        game.waitingForNextTurn = true;
    } else {
        player.score = newScore;
        game.currentTurnScore += points;
        game.currentTurnDarts.push(points);
        
        if (newScore === 0) {
            game.isGameOver = true;
            finishLeg();
        } else if (game.currentTurnDarts.length === 3) {
            game.waitingForNextTurn = true;
        }
    }
    multiplier = 1; 
}

function nextTurn() {
    if (!game.waitingForNextTurn) return;
    game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
    game.currentTurnDarts = [];
    game.currentTurnScore = 0;
    game.scoreAtTurnStart = game.players[game.currentPlayer].score;
    game.waitingForNextTurn = false;
}

function finishLeg() {
    const player = game.players[game.currentPlayer];
    player.legs++;
    alert(player.name + " GEWINNT DAS LEG!");
    // Hier könnte man automatisch das nächste Leg starten
}

function undo() {
    if (history.length === 0) return;
    const last = history.pop();
    Object.assign(game, last);
    multiplier = 1;
}
