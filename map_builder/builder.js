const TILESIZE = 32;
const TILESET_TILE_SIZE = 32;
const MAP_WIDTH = 80;
const MAP_HEIGHT = 60;

// layers
const layers = [];
var selectedLayer = 0;

// tile selection
const selectedTile = { x: -1, y: -1, element: null };
var isTileSelected = false;

// options
let isUsingEraser = false;
let isUsingRectangle = false;

const zoomLevels = [0.4, 0.6, 0.8, 1, 1.25, 1.5, 2];
let currentZoom = 3; // 0 to 6

let rectangleStart = { x: -1, y: -1 };

// elements
const wrapper = document.querySelector(".wrapper");

const tilesetCanvas = document.createElement("canvas");
const tilesetCtx = tilesetCanvas.getContext("2d");
const tileSelectionBox = document.querySelector(".tile-selection");

// TODO: make grid saveable (each gridpiece stores state information --> export into .json)
// TODO: zoom in/out with wheel , pan with wheel drag
// TODO: rectangle draw
// TODO: better layers
// TODO: boundary drawing

// --------------------------- CANVAS -----------------------------------
// --------------------------- CANVAS -----------------------------------
// --------------------------- CANVAS -----------------------------------
// layer 0
const canvas = document.createElement("canvas");
canvas.width = TILESIZE * MAP_WIDTH;
canvas.height = TILESIZE * MAP_HEIGHT;
wrapper.appendChild(canvas);

const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx.fillStyle = "#77bbdd";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// layer 1
const canvas2 = document.createElement("canvas");
canvas2.width = TILESIZE * MAP_WIDTH;
canvas2.height = TILESIZE * MAP_HEIGHT;
wrapper.appendChild(canvas2);

const ctx2 = canvas2.getContext("2d");
ctx2.imageSmoothingEnabled = false;

// layer 2
const canvas3 = document.createElement("canvas");
canvas3.width = TILESIZE * MAP_WIDTH;
canvas3.height = TILESIZE * MAP_HEIGHT;
wrapper.appendChild(canvas3);

const ctx3 = canvas3.getContext("2d");
ctx3.imageSmoothingEnabled = false;

// preview canvas
const previewCanvas = document.createElement("canvas");
previewCanvas.width = TILESIZE * MAP_WIDTH;
previewCanvas.height = TILESIZE * MAP_HEIGHT;
wrapper.appendChild(previewCanvas);
const previewCtx = previewCanvas.getContext("2d");
previewCtx.imageSmoothingEnabled = false;
previewCtx.globalAlpha = 0.5;

//
layers.push(ctx, ctx2, ctx3);

wrapper.style.width = `${canvas.width + 288}px`;
wrapper.style.height = `${canvas.height}px`;

// --------------------------- GRID -----------------------------------
// --------------------------- GRID -----------------------------------
// --------------------------- GRID -----------------------------------
const grid = document.createElement("div");
grid.className = "grid";

grid.draggable = false;
grid.style.width = `${canvas.width}px`;
grid.style.height = `${canvas.height}px`;
grid.style.gridTemplateColumns = `repeat(${MAP_WIDTH}, ${TILESIZE}px)`;
grid.style.gridTemplateRows = `repeat(${MAP_HEIGHT}, ${TILESIZE}px)`;

wrapper.appendChild(grid);

for (let y = 0; y < MAP_HEIGHT; y++) {
  for (let x = 0; x < MAP_WIDTH; x++) {
    const cell = document.createElement("div");

    cell.draggable = false;
    cell.style.width = `${TILESIZE}px`;
    cell.style.height = `${TILESIZE}px`;

    cell.addEventListener("pointerdown", () => {
      if (isUsingRectangle) {
        rectangleStart = { x, y };
        return;
      }

      drawSelectedTile(x, y);
    });

    cell.addEventListener("pointerenter", (event) => {
      if (isUsingRectangle & (rectangleStart.x > -1)) {
        // rectangle preview
        let xCopies = Math.ceil(Math.abs(rectangleStart.x - x) + 1);
        let yCopies = Math.ceil(Math.abs(rectangleStart.y - y) + 1);

        let xStart = Math.min(rectangleStart.x, x);
        let yStart = Math.min(rectangleStart.y, y);

        let xEnd = Math.max(rectangleStart.x, x);
        let yEnd = Math.max(rectangleStart.y, y);

        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        for (let i = xStart; i <= xEnd; i++) {
          for (let j = yStart; j <= yEnd; j++) {
            previewCtx.drawImage(
              tilesetCanvas,
              0,
              0,
              tilesetCanvas.width,
              tilesetCanvas.height,
              i * TILESIZE,
              j * TILESIZE,
              tilesetCanvas.width,
              tilesetCanvas.height,
            );
          }
        }

        return;
      }

      // on-grid preview
      if (isTileSelected) {
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.drawImage(
          tilesetCanvas,
          0,
          0,
          tilesetCanvas.width,
          tilesetCanvas.height,
          x * TILESIZE,
          y * TILESIZE,
          tilesetCanvas.width,
          tilesetCanvas.height,
        );
      } else if (isUsingEraser) {
        cell.style.background = "rgba(255, 255, 255, 0.25)";
      }

      // continue draw
      if (event.buttons & 1) drawSelectedTile(x, y);
    });

    cell.addEventListener("pointerup", () => {
      if (rectangleStart.x == x && rectangleStart.y == y) {
        // assume cancel
        rectangleStart = { x: -1, y: -1 };
        return;
      }

      // DRAW RECTANGLE
      for (let i = Math.min(rectangleStart.x, x); i <= Math.max(rectangleStart.x, x); i++) {
        for (let j = Math.min(rectangleStart.y, y); j <= Math.max(rectangleStart.y, y); j++) {
          layers[selectedLayer].drawImage(
            tilesetCanvas,
            0,
            0,
            tilesetCanvas.width,
            tilesetCanvas.height,
            i * TILESIZE,
            j * TILESIZE,
            tilesetCanvas.width,
            tilesetCanvas.height,
          );
        }
      }

      rectangleStart = { x: -1 };
    });

    cell.addEventListener("pointerleave", () => {
      if (isUsingEraser) cell.style.background = ""; // remove erase preview highlight
    });

    grid.appendChild(cell);
  }
}

// delete preview when grid not interacted with
grid.addEventListener("pointerleave", () => {
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  rectangleStart = { x: -1 };
});

// --------------------------- TILESET -----------------------------------
// --------------------------- TILESET -----------------------------------
// --------------------------- TILESET -----------------------------------
const tilesetPanel = document.querySelector(".tileset-panel");
const tileset = tilesetPanel.querySelector("img");

const overlay = document.createElement("div");
overlay.className = "tileset-overlay";

tilesetPanel.appendChild(overlay);

tileset.addEventListener("load", () => {
  const cols = Math.floor(tileset.naturalWidth / TILESET_TILE_SIZE);
  const rows = Math.floor(tileset.naturalHeight / TILESET_TILE_SIZE);

  overlay.style.width = `${tileset.naturalWidth}px`;
  overlay.style.height = `${tileset.naturalHeight}px`;

  overlay.style.gridTemplateColumns = `repeat(${cols}, ${TILESET_TILE_SIZE}px)`;
  overlay.style.gridTemplateRows = `repeat(${rows}, ${TILESET_TILE_SIZE}px)`;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const tile = document.createElement("div");

      tile.className = "tileset-tile";

      tile.dataset.x = x;
      tile.dataset.y = y;

      // * TILE SELECTION
      tile.addEventListener("pointerdown", () => {
        // deselect tile (if reselected)
        if (selectedTile.element == tile) {
          clearSelectedTile();
          return;
        }

        // deselect eraser
        isUsingEraser = false;
        eraser.style.background = "";

        // select new
        selectedTile.x = x;
        selectedTile.y = y;
        selectedTile.element = tile;

        // ui
        tileSelectionBox.style.display = "block";
        tileSelectionBox.style.width = `${TILESET_TILE_SIZE}px`;
        tileSelectionBox.style.height = `${TILESET_TILE_SIZE}px`;
        tileSelectionBox.style.left = `${TILESET_TILE_SIZE * x}px`;
        tileSelectionBox.style.top = `${TILESET_TILE_SIZE * y}px`;
      });

      tile.addEventListener("pointerenter", () => {
        if (!selectedTile.element) return;

        const dx = Math.abs(selectedTile.x - tile.dataset.x);
        const dy = Math.abs(selectedTile.y - tile.dataset.y);
        const sx = Math.min(selectedTile.x, tile.dataset.x);
        const sy = Math.min(selectedTile.y, tile.dataset.y);

        tileSelectionBox.style.width = `${TILESET_TILE_SIZE * (dx + 1)}px`;
        tileSelectionBox.style.height = `${TILESET_TILE_SIZE * (dy + 1)}px`;
        tileSelectionBox.style.left = `${TILESET_TILE_SIZE * sx}px`;
        tileSelectionBox.style.top = `${TILESET_TILE_SIZE * sy}px`;
      });

      tile.addEventListener("pointerup", () => {
        if (selectedTile.element == null) {
          // click didnt originate on a tile
          return;
        }

        // change in x, y
        const dx = Math.abs(selectedTile.x - tile.dataset.x);
        const dy = Math.abs(selectedTile.y - tile.dataset.y);

        // smallest x and y
        const sx = Math.min(selectedTile.x, tile.dataset.x);
        const sy = Math.min(selectedTile.y, tile.dataset.y);

        // configure canvas
        tilesetCanvas.width = (dx + 1) * TILESET_TILE_SIZE;
        tilesetCanvas.height = (dy + 1) * TILESET_TILE_SIZE;
        tilesetCtx.imageSmoothingEnabled = false;

        // load tiles
        tilesetCtx.clearRect(0, 0, tilesetCanvas.width, tilesetCanvas.height);
        tilesetCtx.drawImage(tileset, sx * TILESIZE, sy * TILESIZE, tilesetCanvas.width, tilesetCanvas.height, 0, 0, tilesetCanvas.width, tilesetCanvas.height);

        // set variables
        isTileSelected = true;
        selectedTile.element = null;
      });

      overlay.appendChild(tile);
    }
  }
});

function clearSelectedTile() {
  tileSelectionBox.style.display = "none";
  selectedTile.x = -1;
  selectedTile.y = -1;
  selectedTile.element = null;
  isTileSelected = false;
}

// --------------------------- DRAWING -----------------------------------
// --------------------------- DRAWING -----------------------------------
// --------------------------- DRAWING -----------------------------------
function drawSelectedTile(x, y) {
  if (isUsingEraser) {
    layers[selectedLayer].clearRect(x * TILESIZE, y * TILESIZE, TILESET_TILE_SIZE, TILESET_TILE_SIZE);
    if (selectedLayer == 0) ctx.fillRect(x * TILESIZE, y * TILESIZE, TILESET_TILE_SIZE, TILESET_TILE_SIZE);
  }

  if (isTileSelected) {
    layers[selectedLayer].drawImage(
      tilesetCanvas,
      0,
      0,
      tilesetCanvas.width,
      tilesetCanvas.height,
      x * TILESIZE,
      y * TILESIZE,
      tilesetCanvas.width,
      tilesetCanvas.height,
    );
  }
}

// --------------------------- OPTIONS -----------------------------------
// --------------------------- OPTIONS -----------------------------------
// --------------------------- OPTIONS -----------------------------------
document.getElementById("eraser").addEventListener("click", () => {
  // cancel other
  isUsingRectangle = false;
  rectangle.style.background = "";

  clearSelectedTile();

  isUsingEraser = !isUsingEraser;
  eraser.style.background = isUsingEraser ? "rgba(255,255,255,.25)" : "";
});

document.getElementById("rectangle").addEventListener("click", () => {
  isUsingEraser = false;
  eraser.style.background = "";

  isUsingRectangle = !isUsingRectangle;
  rectangle.style.background = isUsingRectangle ? "rgba(255,255,255,.25)" : "";
});

function zoom(amt) {
  currentZoom = Math.min(zoomLevels.length - 1, Math.max(0, amt));
  const zoomLevel = zoomLevels[currentZoom];

  wrapper.style.transform = `scale(${zoomLevel})`;

  wrapper.style.width = `${canvas.width * zoomLevel + 288}px`;
  wrapper.style.height = `${canvas.height * zoomLevel}px`;
}

document.getElementById("zoom-in").addEventListener("click", () => {
  zoom(currentZoom + 1);
});

document.getElementById("zoom-out").addEventListener("click", () => {
  zoom(currentZoom - 1);
});

document.getElementById("layer-0").addEventListener("click", () => {
  selectedLayer = 0;
  document.getElementById("layer-0").style.background = "rgba(255,255,255,.25)";
  document.getElementById("layer-1").style.background = "";
  document.getElementById("layer-2").style.background = "";
});

document.getElementById("layer-1").addEventListener("click", () => {
  selectedLayer = 1;
  document.getElementById("layer-0").style.background = "";
  document.getElementById("layer-1").style.background = "rgba(255,255,255,.25)";
  document.getElementById("layer-2").style.background = "";
});

document.getElementById("layer-2").addEventListener("click", () => {
  selectedLayer = 2;
  document.getElementById("layer-0").style.background = "";
  document.getElementById("layer-1").style.background = "";
  document.getElementById("layer-2").style.background = "rgba(255,255,255,.25)";
});
