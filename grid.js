var selected = [];

const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("class", "grid-piece");
document.querySelector("body").prepend(svg);

function SetupGrid() {
    selected = [];
    while (svg.children.length > 0) {
        svg.children[0].remove();
    }
    for (let i = -10; i <= 10; i++) {
        for (let j = -10; j <= 10; j++) {
            MakeHexagon(i, j);
        }
    }
    const box = svg.getBBox();
    svg.setAttribute("viewBox", `${box.x} ${box.y} ${box.width} ${box.height}`);
    GetHexagon(0, 0).style = "stroke:#3526db;stroke-width:4;"
    svg.appendChild(GetHexagon(0, 0));
}

const GetHexagon = (col, row) => document.querySelector(`[_coord="${col},${row}"]`);

function MakeHexagon(col, row) {
    const R = 20; // radius
    const rad = Math.PI / 180;
    const cx = 1.5 * R * col;
    const cy = Math.sqrt(3) * R * row + (Math.abs(col % 2)) * (Math.sqrt(3) / 2 * R);

    const points = Array.from({ length: 6 }, (_, i) => {
        const a = (i * 60) * rad;
        const x = cx + R * Math.cos(a);
        const y = cy + R * Math.sin(a);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    // make html element
    const hex = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    hex.setAttribute("points", points);
    hex.setAttribute("_coord", `${col},${row}`);

    hex.addEventListener("click", () => {
        ToggleHexagon(hex);
    });
    svg.append(hex);
}

function ToggleHexagon(hex) {
    // deselect
    if (selected.includes(hex)) {
        hex.setAttribute("fill", "black");
        selected.splice(selected.indexOf(hex), 1);
        return;
    }
    // select
    hex.setAttribute("fill", "#cf91e6cb");
    selected.push(hex);
}

function ExportGrid() {
    var exportString = "";
    selected.forEach(element => {
        const coord = element.getAttribute("_coord");
        exportString += coord;
        exportString += ' ';
    });
    return exportString;
}

function ImportGrid(importString) {
    // remove old grid
    while (svg.children.length > 0) {
        svg.children[0].remove();
    }

    // create new grid from string
    const hexagons = importString.split(' ');
    const array = [];
    hexagons.forEach(pair => {
        const [x, y] = pair.split(',');
        if (x && y)
            MakeHexagon(x, y);
    })

    // resize
    const box = svg.getBBox();
    svg.setAttribute("viewBox", `${box.x} ${box.y} ${box.width} ${box.height}`);
}

// import/export buttons
const eb = document.querySelector('.export-button');
const ib = document.querySelector('.import-button');
const rb = document.querySelector('.reset-button');
ib.addEventListener('click', () => {
    let importString = prompt('enter import string');
    if (importString)
        ImportGrid(importString);
});
eb.addEventListener('click', () => {
    if (selected.length > 0)
        window.alert(ExportGrid());
});
rb.addEventListener('click', () => {
    SetupGrid();
});


SetupGrid();