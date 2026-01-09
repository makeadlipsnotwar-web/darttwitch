initGame(defaultSettings);
render();

document.querySelectorAll(".numbers button").forEach(btn => {
  btn.addEventListener("click", () => {
    selectNumber(Number(btn.innerText));
    render();
  });
});
