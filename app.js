// app.js

const settings = {
  startScore: 501,
  doubleOut: true,
  bestOfLegs: 5,
  bestOfSets: 3
};

initGame(settings);
render();

function render() {
  const players = document.querySelectorAll(".player");
  players.forEach((el, i) => {
    el.classList.toggle("active", i === game.currentPlayer);
    el.querySelector(".score").innerText = game.players[i].score;
    el.querySelector(".meta").innerText =
      `Sets ${game.players[i].sets} · Legs ${game.players[i].legs}`;
  });

  document.querySelector(".turn-score").innerText =
    `CURRENT TURN: ${game.currentTurnScore}`;
  document.querySelector(".turn-darts").innerText =
    `Darts: ${game.dartsThrownInTurn} / 3`;
}

document.querySelectorAll(".numbers button").forEach(btn => {
  btn.addEventListener("click", () => {
    selectNumber(Number(btn.innerText));
  });
});

document.querySelector(".modifier:nth-child(1)").onclick = setDouble;
document.querySelector(".modifier:nth-child(2)").onclick = setTriple;

document.querySelector(".ok").onclick = () => {
  throwDart();
  render();
};

document.querySelector(".undo").onclick = () => {
  resetThrow();
};
