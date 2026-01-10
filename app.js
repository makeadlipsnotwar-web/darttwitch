// app.js

// 1. Firebase Initialisierung
const firebaseConfig = {
    apiKey: "AIzaSyByWwnCTxs80kYeoLicbeEW_0MyeWjWFAI",
    authDomain: "dartstwitch-bc90e.firebaseapp.com",
    databaseURL: "https://dartstwitch-bc90e-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "dartstwitch-bc90e",
    storageBucket: "dartstwitch-bc90e.appspot.com",
    messagingSenderId: "240567333004",
    appId: "1:240567333004:web:267cfddb45c6c4653dcba9",
    measurementId: "G-5XE8QDNK8Q"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// Globale Funktionen für das Start-Menü und Export (müssen außerhalb von DOMContentLoaded stehen)
window.renderMenuProfiles = () => {
    const container = document.getElementById('player-selection-grid');
    if (!container) return;
    let profiles = JSON.parse(localStorage.getItem('dartProfiles')) || ["Spieler 1", "Spieler 2"];
    
    container.innerHTML = `
        <select id="p1-select">${profiles.map(p => `<option value="${p}">${p}</option>`).join('')}</select>
        <select id="p2-select">${profiles.map(p => `<option value="${p}" selected>${p}</option>`).join('')}</select>
    `;
};

window.startMatchFromMenu = () => {
    const settings = {
        startScore: Number(document.getElementById('menu-startScore').value),
        bestOfLegs: Number(document.getElementById('menu-legs').value),
        bestOfSets: Number(document.getElementById('menu-sets').value),
        playerNames: [
            document.getElementById('p1-select').value,
            document.getElementById('p2-select').value
        ],
        doubleOut: true
    };
    
    initGame(settings);
    document.getElementById('start-menu').style.display = 'none';
    renderGlobal(); // Wir brauchen eine globale Render-Referenz
};

window.downloadStatsJPG = () => {
    const area = document.getElementById('capture-area');
    html2canvas(area, { backgroundColor: '#0b0e12' }).then(canvas => {
        const link = document.createElement('a');
        link.download = `darts-stats-${new Date().toLocaleDateString()}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
    });
};

window.showFinalStats = (winnerName, avg, dartsTotal) => {
    document.getElementById('stats-modal').style.display = 'flex';
    document.getElementById('winner-name').innerText = winnerName + " GEWINNT!";
    document.getElementById('final-avg').innerText = avg;
    if(document.getElementById('final-darts')) document.getElementById('final-darts').innerText = dartsTotal;
    if(document.getElementById('export-date')) document.getElementById('export-date').innerText = new Date().toLocaleDateString();
};

let renderGlobal; // Platzhalter für die Render-Funktion

document.addEventListener("DOMContentLoaded", () => {
    const numPad = document.getElementById("num-pad");
    const nextBtn = document.getElementById("next-btn");
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
        b25.innerText = "25"; b25.className = "wide";
        b25.onclick = () => { 
            vibrate(); 
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

        db.ref('currentGame').set(game);
        
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

        // Automatischer Stats-Check am Ende des Spiels
        if (game.isGameOver) {
            const winner = game.players[game.currentPlayer];
            setTimeout(() => {
                showFinalStats(winner.name, winner.avg, winner.totalDarts);
            }, 2000);
        }
    }
    
    renderGlobal = render; // Render-Funktion global verfügbar machen

    if (nextBtn) {
        nextBtn.onclick = () => {
            vibrate();
            if (game.currentTurnScore === 180) {
                triggerEvent("ONE HUNDRED AND EIGHTY!");
            } else if (game.currentTurnScore >= 100) {
                triggerEvent("LOW TON");
            } else if (game.currentTurnDarts.includes("BUST")) {
                triggerEvent("BUSTED");
            }
            nextTurn(); 
            render();
        };
    }

    window.addNewProfile = () => {
        const n = prompt("Name des neuen Profils:");
        if (n) {
            let pList = JSON.parse(localStorage.getItem('dartProfiles')) || ["Spieler 1", "Spieler 2"];
            pList.push(n);
            localStorage.setItem('dartProfiles', JSON.stringify(pList));
            renderMenuProfiles();
        }
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
    renderMenuProfiles(); // Menü beim Laden vorbereiten
});
