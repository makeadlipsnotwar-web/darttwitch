document.addEventListener("DOMContentLoaded", () => {
    initGame(currentSettings);

    const viberate = () => { if(navigator.vibrate) navigator.vibrate(40); };

    // Zahlen-Eingabe
    document.querySelectorAll(".numbers button").forEach(btn => {
        btn.onclick = () => {
            if (game.waitingForNextTurn) return;
            viberate();
            addDart(Number(btn.innerText));
            render();
        };
    });

    // Multiplikator
    document.querySelectorAll(".modifier").forEach(btn => {
        btn.onclick = () => {
            viberate();
            const m = Number(btn.dataset.mult);
            multiplier = (multiplier === m) ? 1 : m; // Toggle
            render();
        };
    });

    // Undo / Edit
    document.querySelector(".undo").onclick = () => {
        viberate();
        undo();
        render();
    };

    // Nächste Aufnahme (wird nur angezeigt wenn Turn vorbei)
    const nextBtn = document.querySelector(".next-turn-btn");
    nextBtn.onclick = () => {
        viberate();
        nextTurn();
        render();
    };

    function render() {
        // Spieler-Updates
        game.players.forEach((p, i) => {
            const el = document.getElementById(`player-${i}`);
            el.classList.toggle("active", i === game.currentPlayer);
            el.querySelector(".score").innerText = p.score;
            el.querySelector(".meta").innerText = `Sets ${p.sets} · Legs ${p.legs}`;
            // Namen synchronisieren (falls geändert)
            if (document.activeElement !== el.querySelector(".name")) {
                el.querySelector(".name").innerText = p.name;
            }
            el.querySelector(".name").onblur = (e) => { p.name = e.target.innerText; };
        });

        // Dart-History Kreise
        for (let i = 0; i < 3; i++) {
            const dartEl = document.getElementById(`dart-${i}`);
            const val = game.currentTurnDarts[i];
            dartEl.innerText = val !== undefined ? val : "?";
            dartEl.classList.toggle("active", i === game.currentTurnDarts.length && !game.waitingForNextTurn);
        }

        document.querySelector(".turn-score").innerText = game.currentTurnScore;
        
        // Multiplikator Highlights
        document.querySelectorAll(".modifier").forEach(btn => {
            btn.classList.toggle("active", Number(btn.dataset.mult) === multiplier);
        });

        // Button für nächste Aufnahme zeigen
        nextBtn.style.display = game.waitingForNextTurn ? "block" : "none";
    }

    render();
});
