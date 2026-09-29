const info = document.getElementById("info");

if (window.DeviceOrientationEvent) {
  window.addEventListener(
    "deviceorientation",
    (event) => {
      const rotateDegrees = event.alpha; // alpha: rotation around z-axis
      const leftToRight = event.gamma; // gamma: left to right
      const frontToBack = event.beta; // beta: front back motion

      handleOrientationEvent(frontToBack, leftToRight, rotateDegrees);
    },
    true,
  );
}

function handleOrientationEvent(frontToBack, leftToRight, rotateDegrees) {
  info.innerText = `
    ${frontToBack}, ${leftToRight}, ${rotateDegrees}`;
}
