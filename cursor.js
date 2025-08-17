// https://github.com/tholman/cursor-effects
const script = document.createElement('script');
script.src = "https://unpkg.com/cursor-effects@latest/dist/browser.js";
script.onload = () => {
    new cursoreffects.fairyDustCursor({
        colors: ["#ff88bb", "#55ddee", "#ffeeaa", "#99dd88", "#ddbbff"]
    });
};
document.head.appendChild(script);

// cursor image (and trail inspiration) from https://github.com/sophiekoonin/localghost
document.documentElement.style.cursor = "url('images/cursor.png'), default";