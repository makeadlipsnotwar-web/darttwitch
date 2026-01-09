class DartsGame {
    constructor(settings) {
        this.settings = {
            startScore: 501,
            doubleOut: true,
            bestOfLegs: 3,
            bestOfSets: 1,
            ...settings
        };
        
        this.players = [
            this.createPlayer("Spieler A"),
            this.createPlayer("Spieler B")
        ];
        
        this.currentPlayerIndex = 0;
        this.turnDarts = 0;
        this.turnScore = 0;
        this.multiplier = 1;
        this.scoreAtTurnStart = this.settings.startScore;
    }

    createPlayer(name) {
        return {
            name,
            score: this.settings.startScore,
            legs: 0,
            sets: 0,
            stats: { dartsThrown: 0, highestTurn: 0 }
        };
    }

    // Input-Methoden
    setMultiplier(m) { this.multiplier = m; }

    throwValue(value) {
        const points = value * this.multiplier;
        const player = this.players[this.currentPlayerIndex];
        const isDouble = this.multiplier === 2;
        
        const remainingAfterThrow = player.score - points;

        // Validierung der Darts-Regeln
        const isBust = 
            remainingAfterThrow < 0 || 
            remainingAfterThrow === 1 || 
            (remainingAfterThrow === 0 && this.settings.doubleOut && !isDouble);

        if (isBust) {
            this.handleBust();
        } else if (remainingAfterThrow === 0) {
            this.handleLegWin(points);
        } else {
            this.handleNormalThrow(points);
        }
        
        this.multiplier = 1; // Reset Multiplier nach jedem Wurf
    }

    handleNormalThrow(points) {
        const player = this.players[this.currentPlayerIndex];
        player.score -= points;
        this.turnScore += points;
        this.turnDarts++;
        player.stats.dartsThrown++;

        if (this.turnDarts === 3) {
            this.endTurn();
        }
    }

    handleBust() {
        const player = this.players[this.currentPlayerIndex];
        player.score = this.scoreAtTurnStart; // Zurück auf Anfang der Runde
        this.endTurn();
    }

    endTurn() {
        const player = this.players[this.currentPlayerIndex];
        player.stats.highestTurn = Math.max(player.stats.highestTurn, this.turnScore);
        
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.turnDarts = 0;
        this.turnScore = 0;
        this.scoreAtTurnStart = this.players[this.currentPlayerIndex].score;
    }

    handleLegWin(points) {
        const player = this.players[this.currentPlayerIndex];
        player.legs++;
        player.stats.dartsThrown++;
        
        console.log(`${player.name} gewinnt das Leg!`);

        const legsToWinSet = Math.ceil(this.settings.bestOfLegs / 2);
        if (player.legs >= legsToWinSet) {
            this.handleSetWin(player);
        } else {
            this.resetForNextLeg();
        }
    }

    handleSetWin(player) {
        player.sets++;
        const setsToWinMatch = Math.ceil(this.settings.bestOfSets / 2);
        
        if (player.sets >= setsToWinMatch) {
            console.log(`MATCH GEWONNEN VON ${player.name}`);
        } else {
            this.resetForNextSet();
        }
    }

    resetForNextLeg() {
        this.players.forEach(p => p.score = this.settings.startScore);
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length; // Wechselndes Anwurf-Recht
        this.scoreAtTurnStart = this.settings.startScore;
        this.turnDarts = 0;
    }
}

// Beispielnutzung:
const myGame = new DartsGame({ startScore: 301, bestOfLegs: 3 });
myGame.setMultiplier(3);
myGame.throwValue(20); // 60 Punkte
