document.addEventListener("DOMContentLoaded", () => {
    const numPad = document.getElementById("num-pad");
    const nextBtn = document.getElementById("next-btn");

    // Tastatur generieren falls leer
    if (numPad && numPad.innerHTML.trim() === "") {
        for (let i = 1; i <= 20; i++) {
            const btn = document.createElement("button");
            btn.innerText = i;
            btn.onclick = () => handleInput(i);
            numPad.appendChild(btn);
        }
        const b25 = document.createElement("button");
        b25.innerText = "25"; b25.className = "wide";
        b25.onclick = () => handleInput(25);
        numPad.appendChild(b25);
        
        const b0 = document.createElement("button");
        b0.innerText = "0"; b0.className = "wide";
        b0.onclick = () => handleInput(0);
        numPad.appendChild(b0);
    }

    function handleInput(val) {
        if (game.waitingForNextTurn) return;
        if (navigator.vibrate) navigator.vibrate(40);
        addDart(val);
        render();
    }

    // Global machen für HTML onclicks
    window.toggleSettings = () => {
        const m = document.getElementById("settings-modal");
        m.style.display = (m.style.display === "flex") ? "none" : "flex";
        
        const container = document.getElementById("player-names-inputs");
        container.innerHTML = "";
        currentSettings.playerNames.forEach((n, i) => {
            container.innerHTML += `<input type="text" id="edit-name-${i}" value="${n}" style="margin-top:5px">`;
        });
    };

    window.saveNewSettings = () => {
        currentSettings.startScore = Number(document.getElementById("input-startScore").value);
        currentSettings.bestOfLegs = Number(document.getElementById("input-legs").value);
        currentSettings.playerNames = currentSettings.playerNames.map((_, i) => 
            document.getElementById(`edit-name-${i}`).value || `Spieler ${i+1}`
        );
        initGame(currentSettings);
        window.toggleSettings();
        render();
    };

    document.querySelectorAll(".modifier").forEach(btn => {
        btn.onclick = () => {
            const m = Number(btn.dataset.mult);
            multiplier = (multiplier === m) ? 1 : m;
            render();
        };
    });

    document.querySelector(".undo").onclick = () => { undo(); render(); };
    if(nextBtn) nextBtn.onclick = () => { nextTurn(); render(); };

    function render() {
        if (!game) return;
        game.players.forEach((p, i) => {
            const el = document.getElementById(`player-${i}`);
            if (el) {
                el.classList.toggle("active", i === game.currentPlayer);
                el.querySelector(".score").innerText = p.score;
                el.querySelector(".name").innerText = p.name;
                el.querySelector(".meta").innerText = `S ${p.sets} · L ${p.legs}`;
            }
        });

        for (let i = 0; i < 3; i++) {
            const dEl = document.getElementById(`dart-${i}`);
            if (dEl) {
                const val = game.currentTurnDarts[i];
                dEl.innerText = val !== undefined ? val : "?";
                dEl.classList.toggle("active", i === game.currentTurnDarts.length && !game.waitingForNextTurn);
            }
        }

        document.querySelector(".turn-score").innerText = game.currentTurnScore;
        document.querySelectorAll(".modifier").forEach(b => 
            b.classList.toggle("active", Number(b.dataset.mult) === multiplier)
        );
        if(nextBtn) nextBtn.style.display = game.waitingForNextTurn ? "block" : "none";
    }

    initGame(currentSettings);
    render();
});
