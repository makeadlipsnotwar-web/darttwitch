// app.js

// Wir nutzen die Einstellungen aus der settings.js (falls vorhanden) 
// oder definieren sie hier, falls settings.js leer ist.
document.addEventListener("DOMContentLoaded", () => {
const currentSettings = typeof defaultSettings !== 'undefined' ? defaultSettings : {
  playerCount: 2,
  startScore: 501,
  doubleOut: true,
  bestOfLegs: 5,
  bestOfSets: 3,
  playerNames: ["Spieler A", "Spieler B"]
};

// Spiel initialisieren
initGame(currentSettings);
render();

/**
 * Aktualisiert die gesamte Benutzeroberfläche basierend auf dem Spielstatus
 */
function render() {
  const playersElements = document.querySelectorAll(".player");
  
  game.players.forEach((playerData, i) => {
    const el = playersElements[i];
    if (!el) return; // Falls mehr Spieler im Code als im HTML sind

    // Aktiven Spieler markieren
    el.classList.toggle("active", i === game.currentPlayer);
    
    // Werte aktualisieren
    el.querySelector(".score").innerText = playerData.score;
    el.querySelector(".meta").innerText =
      `Sets ${playerData.sets} · Legs ${playerData.legs}`;
    
    // Namen aus den Settings setzen
    el.querySelector(".name").innerText = playerData.name;
  });

  // Anzeige der aktuellen Aufnahme
  document.querySelector(".turn-score").innerText =
    `CURRENT TURN: ${game.currentTurnScore}`;
  document.querySelector(".turn-darts").innerText =
    `Darts: ${game.dartsThrownInTurn} / 3`;

  // Optisches Feedback für Multiplikatoren (Optional)
  const doubleBtn = document.querySelector(".modifier[data-mult='2']");
  const tripleBtn = document.querySelector(".modifier[data-mult='3']");
  
  if (doubleBtn && tripleBtn) {
    doubleBtn.style.backgroundColor = (multiplier === 2) ? "#ffcc00" : "";
    tripleBtn.style.backgroundColor = (multiplier === 3) ? "#ffcc00" : "";
  }
}

/* ======================
    EVENT LISTENER
====================== */

// Zahlen-Buttons (1-20 und 25)
document.querySelectorAll(".numbers button").forEach(btn => {
  btn.addEventListener("click", () => {
    // Wir nutzen Number() um den Text des Buttons umzuwandeln
    selectNumber(Number(btn.innerText));
    
    // Sofort werfen? Normalerweise wartet man auf "OK", 
    // aber wir brauchen visuelles Feedback:
    console.log("Ausgewählt:", pendingValue);
  });
});

// Multiplikatoren (Double/Triple)
document.querySelectorAll(".modifier").forEach(btn => {
  btn.addEventListener("click", () => {
    const mult = parseInt(btn.getAttribute("data-mult"));
    setMultiplier(mult);
    render(); // Um die Farbe des Buttons zu ändern
  });
});

// OK-Button (Bestätigt den Wurf)
document.querySelector(".ok").onclick = () => {
  if (pendingValue === null) {
      // Wenn nichts gewählt wurde, zählt es als 0 (Miss)
      selectNumber(0);
  }
  throwDart();
  render();
  // app.js
};

document.querySelector(".undo").onclick = () => {
  // Wenn gerade eine Zahl ausgewählt ist (z.B. Triple 20), aber noch nicht OK gedrückt wurde:
  if (pendingValue !== null) {
    resetThrow(); // Nur die aktuelle Auswahl löschen
  } else {
    // Sonst den letzten geworfenen Dart wirklich im Spiel rückgängig machen
    undoLastAction(); 
  }
  render(); // Anzeige aktualisieren
};

// UNDO-Button (In deinem Fall aktuell ein Reset des aktuellen Wurfs)
document.querySelector(".undo").onclick = () => {
  resetThrow();
  render();
};
});
