// app.js
document.addEventListener("DOMContentLoaded", () => {
    initGame(defaultSettings);
    render();

    // Zahlen-Buttons
    document.querySelectorAll(".numbers button").forEach(btn => {
        btn.addEventListener("click", () => {
            selectNumber(Number(btn.innerText));
            // Optisches Feedback: Den gewählten Wert kurz loggen
            document.querySelector(".turn-score").innerText = `Wurf: ${pendingValue}`;
        });
    });

    // Multiplikatoren
    document.querySelectorAll(".modifier").forEach(btn => {
        btn.onclick = () => {
            setMultiplier(Number(btn.dataset.mult));
            render();
        };
    });

    // OK Button
    document.querySelector(".ok").onclick = () => {
        throwDart();
        render();
    };

    // UNDO Button
    document.querySelector(".undo").onclick = () => {
        if (pendingValue !== null) {
            resetThrow();
        } else {
            undoLastAction();
        }
        render();
    };
});

function render() {
    game.players.forEach((p, i) => {
        const el = document.getElementById(`player-${i}`);
        if (el) {
            el.classList.toggle("active", i === game.currentPlayer);
            el.querySelector(".score").innerText = p.score;
            el.querySelector(".meta").innerText = `Sets ${p.sets} · Legs ${p.legs}`;
            el.querySelector(".name").innerText = p.name;
        }
    });

    document.querySelector(".turn-score").innerText = `CURRENT TURN: ${game.currentTurnScore}`;
    document.querySelector(".turn-darts").innerText = `Darts: ${game.dartsThrownInTurn} / 3`;
    
    // Multiplikator-Farben
    document.querySelectorAll(".modifier").forEach(btn => {
        btn.style.background = (Number(btn.dataset.mult) === multiplier) ? "var(--accent)" : "";
    });
}
