function getSettingsFromUI() {
  // Wir holen uns die Werte direkt aus den HTML-Elementen
  const settings = {
    playerCount: parseInt(document.getElementById('input-players').value),
    startScore: parseInt(document.getElementById('input-score').value),
    doubleOut: document.getElementById('input-doubleout').checked,
    bestOfLegs: parseInt(document.getElementById('input-legs').value),
    bestOfSets: parseInt(document.getElementById('input-sets').value)
  };

  return settings;
}

function startGame() {
  const currentSettings = getSettingsFromUI();
  initGame(currentSettings); // Hier nutzt du deine verbesserte init-Funktion
  console.log("Spiel gestartet mit:", currentSettings);
}
