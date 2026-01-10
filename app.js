// app.js
document.addEventListener("DOMContentLoaded", () => {
    const numPad = document.getElementById("num-pad");
    const nextBtn = document.getElementById("next-btn");

    // LocalStorage: Profile laden oder Standard erstellen
    let profiles = JSON.parse(localStorage.getItem('dartProfiles')) || ["Spieler 1", "Spieler 2"];

    // Hilfsfunktion für Vibration
    const vibrate = () => { if (navigator.vibrate) navigator.vibrate(40); };

    // Tastatur im HTML generieren
    function generatePad() {
        if (!numPad) return;
        numPad.innerHTML = "";
        for (let i = 1; i <= 20; i++) {
            const btn = document.createElement("button");
            btn.innerText = i;
            btn.onclick = () => {
                if (game.waitingForNextTurn) return;
                vibrate();
                addDart(i);
                render();
            };
            numPad.appendChild(btn);
        }
        // 25er und 0er (Miss)
        const b25 = document.createElement("button");
        b25.innerText = "25"; b25.className = "wide";
        b25.onclick = () => { vibrate(); addDart(25); render(); };
        numPad.appendChild(b25);
        
        const b0 = document.createElement("button");
        b0.innerText = "0"; b0.className = "wide";
        b0.onclick = () => { vibrate(); addDart(0); render(); };
        numPad.appendChild(b0);
    }

    // Anzeige aktualisieren
    function render() {
        game.players.forEach((p, i) => {
            const el = document.getElementById(`player-${i}`);
            const checkoutEl = document.getElementById(`checkout-${i}`);
            
            if (el) {
                el.classList.toggle("active", i === game.currentPlayer);
                el.querySelector(".score").innerText = p.score;
                el.querySelector(".name").innerText = p.name;
                
                // Checkout Vorschlag anzeigen
                if (checkoutEl) {
                    const hint = getCheckoutSuggestion(p.score);
                    checkoutEl.innerText = hint ? hint : "";
                    // Nur beim aktiven Spieler hervorheben
                    checkoutEl.style.opacity = (i === game.currentPlayer) ? "1" : "0.5";
                }
            }
        });
    function sendStateToTwitch() {
        if (window.Twitch && window.Twitch.ext) {
            window.Twitch.ext.send("broadcast", "application/json", JSON.stringify(game));
        }
    }
        // Dart-Kreise (Aufnahme)
        for (let i = 0; i < 3; i++) {
            const dEl = document.getElementById(`dart-${i}`);
            if (dEl) {
                const val = game.currentTurnDarts[i];
                dEl.innerText = val !== undefined ? val : "?";
                dEl.classList.toggle("active", i === game.currentTurnDarts.length && !game.waitingForNextTurn);
            }
        }

        // Summe der aktuellen Aufnahme
        document.querySelector(".turn-sum").innerText = game.currentTurnScore;
        
        // Multiplikator-Buttons markieren
        document.querySelectorAll(".mod-btn").forEach(b => {
            b.classList.toggle("active", Number(b.dataset.mult) === multiplier);
        });

        // "Nächste Aufnahme" Button
        if (nextBtn) {
            nextBtn.style.display = game.waitingForNextTurn && !game.isGameOver ? "block" : "none";
        }
    }

    // Modal Funktionen global verfügbar machen
    window.toggleSettings = () => {
        const m = document.getElementById("settings-modal");
        const isOpen = (m.style.display === "flex");
        m.style.display = isOpen ? "none" : "flex";
        if (!isOpen) renderProfileSelection();
    };

    window.addNewProfile = () => {
        const n = prompt("Name des neuen Profils:");
        if (n) {
            profiles.push(n);
            localStorage.setItem('dartProfiles', JSON.stringify(profiles));
            renderProfileSelection();
        }
    };

    function renderProfileSelection() {
        const container = document.getElementById("player-profiles-list");
        container.innerHTML = "";
        for (let i = 0; i < 2; i++) {
            let html = `<label>Spieler ${i+1}: <select id="select-p${i}">`;
            profiles.forEach(name => {
                html += `<option value="${name}">${name}</option>`;
            });
            html += `</select></label>`;
            container.innerHTML += html;
        }
    }

    window.saveNewSettings = () => {
        const s = {
            startScore: Number(document.getElementById("input-startScore").value),
            bestOfLegs: Number(document.getElementById("input-legs").value),
            bestOfSets: Number(document.getElementById("input-sets").value),
            playerNames: [
                document.getElementById("select-p0").value,
                document.getElementById("select-p1").value
            ],
            doubleOut: true
        };
        currentSettings = s;
        initGame(s);
        window.toggleSettings();
        render();
    };

    // Event Listener für Controls
    document.querySelectorAll(".mod-btn").forEach(btn => {
        btn.onclick = () => {
            vibrate();
            const m = Number(btn.dataset.mult);
            multiplier = (multiplier === m) ? 1 : m;
            render();
        };
    });

    document.querySelector(".undo-btn").onclick = () => { vibrate(); undo(); render(); };
    if (nextBtn) nextBtn.onclick = () => { vibrate(); nextTurn(); render(); };

    // App Start
    generatePad();
    initGame(currentSettings);
    render();
});
