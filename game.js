// game.js
let game = null;
let multiplier = 1;
let history = [];

// Initialisiert ein neues Spiel
function initGame(settings) {
    const players = settings.playerNames.map(name => ({
        name: name,
        score: Number(settings.startScore),
        legs: 0,
        sets: 0,
        totalPoints: 0, // Für Statistik
        totalDarts: 0,  // Für Statistik
        avg: "0.00"
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
    history = [];
}

// Speichert den aktuellen Stand für die Undo-Funktion
function saveState() {
    history.push(JSON.parse(JSON.stringify({
        players: game.players,
        currentPlayer: game.currentPlayer,
        currentTurnDarts: game.currentTurnDarts,
        currentTurnScore: game.currentTurnScore,
        scoreAtTurnStart: game.scoreAtTurnStart,
        waitingForNextTurn: game.waitingForNextTurn,
        isGameOver: game.isGameOver
    })));
}

// Kern-Funktion: Ein Dart wird geworfen
function addDart(value) {
    if (game.isGameOver || game.waitingForNextTurn) return;

    saveState();
    const points = value * multiplier;
    const player = game.players[game.currentPlayer];
    const newScore = player.score - points;

    // Statistik-Update
    player.totalPoints += points;
    player.totalDarts += 1;
    player.avg = ((player.totalPoints / player.totalDarts) * 3).toFixed(2);

    // Check auf Double-Out & Bust
    const isDouble = (multiplier === 2);
    const isBust = newScore < 0 || (newScore === 1 && game.settings.doubleOut) || (newScore === 0 && game.settings.doubleOut && !isDouble);

    if (isBust) {
        player.score = game.scoreAtTurnStart;
        game.currentTurnDarts.push("BUST");
        game.waitingForNextTurn = true;
        triggerEvent("BUST!");
    } else {
        player.score = newScore;
        game.currentTurnScore += points;
        game.currentTurnDarts.push(points);
        
        if (newScore === 0) {
            handleLegWin();
        } else if (game.currentTurnDarts.length === 3) {
            game.waitingForNextTurn = true;
            if (game.currentTurnScore >= 100) {
                triggerEvent(game.currentTurnScore === 180 ? "180!" : "BIG SCORE!");
            }
        }
    }
    multiplier = 1; // Multiplikator immer zurücksetzen
}

// Logik für Leg- und Set-Gewinn
function handleLegWin() {
    const player = game.players[game.currentPlayer];
    player.legs++;
    
    const legsToWin = Math.ceil(game.settings.bestOfLegs / 2);
    if (player.legs >= legsToWin) {
        player.sets++;
        const setsToWin = Math.ceil(game.settings.bestOfSets / 2);
        
        if (player.sets >= setsToWin) {
            triggerEvent("MATCH WON!");
            game.isGameOver = true;
        } else {
            triggerEvent("SET WON!");
            game.players.forEach(p => p.legs = 0);
        }
    } else {
        triggerEvent("LEG WON!");
    }

    if (!game.isGameOver) {
        game.players.forEach(p => p.score = game.settings.startScore);
        game.waitingForNextTurn = true;
    }
}

// Nächste Aufnahme starten
function nextTurn() {
    if (!game.waitingForNextTurn) return;
    game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
    game.currentTurnDarts = [];
    game.currentTurnScore = 0;
    game.scoreAtTurnStart = game.players[game.currentPlayer].score;
    game.waitingForNextTurn = false;
}

// Rückgängig-Funktion
function undo() {
    if (history.length === 0) return;
    const last = history.pop();
    Object.assign(game, last);
    multiplier = 1;
}

// Visuelles Event triggern (180, Leg etc.)
function triggerEvent(message) {
    const overlay = document.getElementById('event-overlay');
    const text = document.getElementById('event-text');
    if (!overlay || !text) return;

    text.innerText = message;
    overlay.style.display = 'flex';
    
    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(message);
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
    }

    setTimeout(() => { overlay.style.display = 'none'; }, 1500);
}
function getCheckoutSuggestion(score) {
    if (score > 170 || score <= 1) return null;

    const checkouts = {
        170: "T20 T20 Bull", 167: "T20 T19 Bull", 164: "T20 T18 Bull",
        161: "T20 T17 Bull", 160: "T20 T20 D20", 141: "T20 T15 D18",
        121: "T20 T15 D8",  100: "T20 D20",    90: "T20 D15",
        80: "T20 D10",     70: "T10 D20",     60: "20 D20",
        50: "10 D20",      40: "D20",         32: "D16",
        20: "D10",         10: "D5",          4: "D2"
    };

    // Wenn kein exakter Weg drin steht, berechnen wir einen einfachen:
    if (checkouts[score]) return checkouts[score];
    
    // Einfache Logik für kleinere Scores:
    if (score <= 40 && score % 2 === 0) return "D" + (score / 2);
    if (score <= 60) return (score - 40) + " D20";
    
    return "Finish möglich!"; // Platzhalter für sehr komplexe Wege
}
