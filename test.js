const info = document.getElementById("info");

window.addEventListener("deviceorientation", (event) => {
  info.innerText = `${event.alpha, event.beta, event.gamma}`;
});

