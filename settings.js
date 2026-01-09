// settings.js
const defaultSettings = {
    playerCount: 2,
    startScore: 501,
    doubleOut: true,
    bestOfLegs: 5,
    bestOfSets: 1,
    playerNames: ["Spieler A", "Spieler B"]
};

// Diese Variable nutzen wir für das Spiel
let currentSettings = { ...defaultSettings };
