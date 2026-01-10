// app.js

// 1. Firebase Initialisierung
const firebaseConfig = {
    apiKey: "AIzaSyByWwnCTxs80kYeoLicbeEW_0MyeWjWFAI",
    authDomain: "dartstwitch-bc90e.firebaseapp.com",
    databaseURL: "https://dartstwitch-bc90e-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "dartstwitch-bc90e",
    storageBucket: "dartstwitch-bc90e.appspot.com",
    messagingSenderId: "240567333004", // Bitte im Firebase Dashboard nachsehen
    appId: "1:240567333004:web:267cfddb45c6c4653dcba9",           // Bitte im Firebase Dashboard nachsehen
    measurementId: "G-5XE8QDNK8Q"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

document.addEventListener("DOMContentLoaded", () => {
    const numPad = document.getElementById("num-pad");
    const nextBtn = document.getElementById("next-btn");

    // LocalStorage: Profile laden
    let profiles = JSON.parse(localStorage.getItem('dartProfiles')) || ["Spieler 1", "Spieler 2"];

    const vibrate = () => { if (navigator.vibrate) navigator.vibrate(40); };

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
        const b25 = document.createElement("button");
        b25.innerText = "25"; 
        b25.className = "wide";
        b25.onclick = () => { 
            vibrate(); 
            // Sicherheitscheck: Triple 25 gibt es nicht, wird zu Single 25
            if (multiplier === 3) multiplier = 1; 
            addDart(25); 
            render(); 
        };
        numPad.appendChild(b25);
        
        const b0 = document.createElement("button");
        b0.innerText = "0"; b0.className = "wide";
        b0.onclick = () => { vibrate(); addDart(0); render(); };
        numPad.appendChild(b0);
    }

    function render() {
        if (!game) return;

        // Spieler-Updates
        game.players.forEach((p, i) => {
            const el = document.getElementById(`player-${i}`);
            const checkoutEl = document.getElementById(`checkout-${i}`);
            
            if (el) {
                el.classList.toggle("active", i === game.currentPlayer);
                el.querySelector(".score").innerText = p.score;
                el.querySelector(".name").innerText = p.name;
                el.querySelector(".stats-line").innerText = `S: ${p.sets} | L: ${p.legs}`;
                el.querySelector(".avg-val").innerText = p.avg;
                
                if (checkoutEl) {
                    const hint = getCheckoutSuggestion(p.score);
                    checkoutEl.innerText = hint ? hint : "";
                    checkoutEl.style.opacity = (i === game.currentPlayer) ? "1" : "0.5";
                }
            }
        });

        // Sync zu Firebase & Twitch
        db.ref('currentGame').set(game);
        if (window.Twitch && window.Twitch.ext) {
            window.Twitch.ext.send("broadcast", "application/json", JSON.stringify(game));
        }

        // Dart-Anzeige (Kreise)
        for (let i = 0; i < 3; i++) {
            const dEl = document.getElementById(`dart-${i}`);
            if (dEl) {
                const val = game.currentTurnDarts[i];
                dEl.innerText = val !== undefined ? val : "?";
                dEl.classList.toggle("active", i === game.currentTurnDarts.length && !game.waitingForNextTurn);
            }
        }

        document.querySelector(".turn-sum").innerText = game.currentTurnScore;
        
        document.querySelectorAll(".mod-btn").forEach(b => {
            b.classList.toggle("active", Number(b.dataset.mult) === multiplier);
        });

        if (nextBtn) {
            nextBtn.style.display = (game.waitingForNextTurn && !game.isGameOver) ? "block" : "none";
        }
    }

    // --- Event Handling ---
    // Wir verschieben den Event-Check in den Klick des Next-Buttons
    if (nextBtn) {
        nextBtn.onclick = () => {
            vibrate();
            
            // Check auf besondere Scores BEVOR wir den Turn wechseln
            if (game.currentTurnScore === 180) {
                triggerEvent("ONE HUNDRED AND EIGHTY!");
            } else if (game.currentTurnScore >= 100) {
                triggerEvent("LOW TON"); // Oder einfach den Score als Text
            } else if (game.currentTurnDarts.includes("BUST")) {
                triggerEvent("BUSTED");
            }

            nextTurn(); 
            render();
        };
    }

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
        if (!container) return;
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

    document.querySelectorAll(".mod-btn").forEach(btn => {
        btn.onclick = () => {
            vibrate();
            const m = Number(btn.dataset.mult);
            multiplier = (multiplier === m) ? 1 : m;
            render();
        };
    });

    document.querySelector(".undo-btn").onclick = () => { vibrate(); undo(); render(); };

    generatePad();
    initGame(currentSettings);
    render();
});
