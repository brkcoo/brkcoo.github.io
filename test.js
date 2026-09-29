const info = document.getElementById("info");

async function requestOrientationPermission() {
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
    const permission = await DeviceOrientationEvent.requestPermission();

    if (permission === "granted") {
      startOrientation();
    } else {
      info.innerText = "Orientation permission denied";
    }
  } else {
    startOrientation();
  }
}

function startOrientation() {
  window.addEventListener("deviceorientation", (event) => {
    info.innerText = `
            beta: ${event.beta}
            gamma: ${event.gamma}
            alpha: ${event.alpha}
        `;
  });
}
