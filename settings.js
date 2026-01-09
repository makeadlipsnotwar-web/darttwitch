// settings.js
const defaultSettings = {
    playerCount: 2,
    startScore: 501,
    doubleOut: true,
    bestOfLegs: 5,
    bestOfSets: 1,
    playerNames: ["Spieler A", "Spieler B"]
};

// Diese Variable hält die Einstellungen, die wir verändern können
let currentSettings = { ...defaultSettings };// settings.js

const defaultSettings = {
    playerCount: 2,      // Wie viele Spieler nehmen teil?
    startScore: 501,     // 301, 501, 701
    doubleOut: true,     // Muss mit einem Doppel beendet werden?
    bestOfLegs: 5,       // Wie viele Legs braucht man für einen Set-Gewinn?
    bestOfSets: 3,       // Wie viele Sets braucht man für den Match-Gewinn?
    
    // Namen für die Anzeige im Scoreboard
    playerNames: ["Spieler A", "Spieler B"]
};

// Falls du später ein Menü baust, kannst du hier die Werte überschreiben
let currentSettings = { ...defaultSettings };

/**
 * Hilfsfunktion, um die Einstellungen während der Laufzeit zu ändern
 */
function updateSettings(newSettings) {
    currentSettings = { ...currentSettings, ...newSettings };
    console.log("Settings aktualisiert:", currentSettings);
}
