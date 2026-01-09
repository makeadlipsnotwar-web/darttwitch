// app.js
function render() {
    if (!game) return;

    game.players.forEach((p, i) => {
        const el = document.getElementById(`player-${i}`);
        if (el) {
            el.classList.toggle("active", i === game.currentPlayer);
            el.querySelector(".score").innerText = p.score;
            el.querySelector(".meta").innerText = `Sets ${p.sets} · Legs ${p.legs}`;
        }
    });

    document.querySelector(".turn-score").innerText = `CURRENT TURN: ${game.currentTurnScore}`;
    document.querySelector(".turn-darts").innerText = `Darts: ${game.dartsThrownInTurn} / 3`;
    
    // Button Farben
    document.querySelectorAll(".modifier").forEach(btn => {
        btn.style.background = (Number(btn.dataset.mult) === multiplier) ? "var(--accent)" : "";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. Spiel starten
    initGame(currentSettings);

    // 2. Zahlen-Buttons binden
    document.querySelectorAll(".numbers button").forEach(btn => {
        btn.onclick = () => {
            selectNumber(btn.innerText);
            // Kleiner Trick: Zeige den aktuell gewählten Wert kurz an
            document.querySelector(".turn-score").innerText = `Gewählt: ${pendingValue}`;
        };
    });

    // 3. Multiplikatoren
    document.querySelectorAll(".modifier").forEach(btn => {
        btn.onclick = () => {
            setMultiplier(Number(btn.dataset.mult));
            render();
        };
    });

    // 4. OK Button
    document.querySelector(".ok").onclick = () => {
        throwDart();
        render();
    };

    // 5. UNDO Button
    document.querySelector(".undo").onclick = () => {
        if (pendingValue !== null) {
            resetThrow();
        } else {
            undoLastAction();
        }
        render();
    };

    // 6. Erster Render
    render();
});
