var selectedCrab; // for dragging crabs between tiers and the bucket
var tempCrab;

// creates tier list and default tiers
// includes row creation, row swapping, and row clearing
// has functionality to serve as container for crabs
const tierlist = () => {
  const body = document.querySelector("body");

  const wrapper = document.createElement("div");
  wrapper.setAttribute("id", "tier-wrapper");
  body.append(wrapper);

  const container = document.createElement("div");
  container.setAttribute("id", "tier-container");
  wrapper.append(container);

  // create default tiers
  const colors = [
    "#b624b6ff",
    "#25b3b3ff",
    "#23b323ff",
    "#a29a25ff",
    "#b82929ff",
  ];
  const text = ["S", "A", "B", "C", "D"];
  for (let i = 0; i < 5; i++) createRow(colors[i], text[i], i);

  function createRow(color, text, id) {
    const row = document.createElement("div");
    row.setAttribute("class", "tier-row");
    row.setAttribute("data-id", id);
    container.append(row);

    const labelholder = document.createElement("div");
    labelholder.setAttribute("class", "label-holder");
    labelholder.style.backgroundColor = color;
    labelholder.style.background;
    row.append(labelholder);

    const label = document.createElement("span");
    label.setAttribute("class", "label");
    label.innerText = text;
    labelholder.append(label);

    const sortable = document.createElement("div");
    sortable.setAttribute("class", "tier-sort");
    sortable.addEventListener("pointerenter", (e) => {
      if(!selectedCrab) return;
      if (selectedCrab.parentNode != sortable) {
        sortable.appendChild(selectedCrab);
      }
    });
    row.append(sortable);

    const optionsContainer = document.createElement("div");
    optionsContainer.setAttribute("class", "options-container");
    row.append(optionsContainer);

    const options = document.createElement("div");
    options.setAttribute("class", "options-button");
    options.innerText = "⚙️";
    optionsContainer.append(options);
    options.addEventListener("click", () => {
      rowOptions(row);
    });

    const moveUp = document.createElement("div");
    moveUp.setAttribute("class", "move-up-button");
    moveUp.innerText = "☝️";
    moveUp.addEventListener("click", () => {
      swapRows(parseInt(row.dataset.id), parseInt(row.dataset.id) - 1);
    });
    optionsContainer.append(moveUp);

    const moveDown = document.createElement("div");
    moveDown.setAttribute("class", "move-down-button");
    moveDown.innerText = "👇";
    moveDown.addEventListener("click", () => {
      swapRows(parseInt(row.dataset.id), parseInt(row.dataset.id) + 1);
    });

    optionsContainer.append(moveDown);

    return row;
  }

  // return the entries in a row to the bucket
  function clearRow(row) {
    const sortable = row.querySelector(".tier-sort");
    while (sortable.children.length > 0) {
      const bucket = document.querySelector("#bucket-holder");
      bucket.appendChild(sortable.children[0]);
    }
  }

  // swapping the position of adjacent rows
  function swapRows(ix, iy) {
    // get rows from indices
    const children = container.children;
    // exit if edge movement
    if (iy < 0 || iy >= children.length) return;
    const x = children[ix];
    const y = children[iy];

    // swap values
    var temp = x.dataset.id;
    x.setAttribute("data-id", y.dataset.id);
    y.setAttribute("data-id", temp);

    // swap positions
    if (ix > iy) container.insertBefore(x, y);
    else container.insertBefore(y, x);
  }

  // creates an options popup for a row
  // allows changing name/color, row clearing, row deletion, row creation above/below
  function rowOptions(row) {
    // popup
    const popup = document.createElement("div");
    popup.setAttribute("class", "popup");
    document.querySelector("body").append(popup);

    const dim = document.createElement("div");
    dim.setAttribute("class", "dim");
    popup.append(dim);

    const content = document.createElement("div");
    content.setAttribute("class", "popup-content");
    popup.append(content);

    const header = document.createElement("span");
    header.setAttribute("class", "label");
    header.innerText = "Row Options";
    content.append(header);

    const closeButton = document.createElement("div");
    closeButton.setAttribute("class", "popup-close-button");
    closeButton.innerText = "×";
    content.append(closeButton);

    // inputs
    const form = document.createElement("form");
    form.setAttribute("class", "options-form");
    content.append(form);

    const p1 = document.createElement("label");
    p1.for = "rowname";
    p1.innerText = "tier label";
    form.append(p1);

    const labelInput = document.createElement("input");
    labelInput.setAttribute("class", "label-input-area");
    labelInput.type = "name";
    labelInput.name = "rowname";
    labelInput.maxLength = 100;
    labelInput.value = row.querySelector(".label-holder .label").innerText;
    labelInput.placeholder = "enter new label";
    form.append(labelInput);

    const buttonRow1 = document.createElement("div");
    content.append(buttonRow1);

    // delete row
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete Row";
    deleteButton.addEventListener("click", () => {
      const rows = row.parentNode.children;
      if (rows.length === 1) return; // cant remove last row
      const id = parseInt(row.dataset.id);
      for (let i = id; i < rows.length; i++) {
        rows[i].dataset.id = parseInt(rows[i].dataset.id) - 1;
      }
      clearRow(row);
      row.remove();
      popup.remove();
    });
    buttonRow1.append(deleteButton);

    // empty row's entries
    const clearButton = document.createElement("button");
    clearButton.innerText = "Clear Row";
    clearButton.addEventListener("click", () => {
      clearRow(row);
    });
    buttonRow1.append(clearButton);

    const buttonRow2 = document.createElement("div");
    content.append(buttonRow2);

    // create row above this one
    const createAbove = document.createElement("button");
    createAbove.innerText = "Create Row Above";
    createAbove.addEventListener("click", () => {
      const rows = row.parentNode.children;
      const id = parseInt(row.dataset.id);
      for (let i = id; i < rows.length; i++) {
        rows[i].dataset.id = parseInt(rows[i].dataset.id) + 1;
      }
      const newRow = createRow("#ff8800ff", "new", id);
      row.parentNode.insertBefore(newRow, row);
    });
    buttonRow2.append(createAbove);

    // create row below this one
    const createBelow = document.createElement("button");
    createBelow.innerText = "Create Row Below";
    createBelow.addEventListener("click", () => {
      const rows = row.parentNode.children;
      const id = parseInt(row.dataset.id);
      for (let i = id + 1; i < rows.length; i++) {
        rows[i].dataset.id = parseInt(rows[i].dataset.id) + 1;
      }
      const newRow = createRow("#ff8800ff", "new", id + 1);
      row.parentNode.insertBefore(newRow, rows[id + 1]);
    });
    buttonRow2.append(createBelow);

    // color selector;
    const p2 = document.createElement("label");
    p2.for = "rowcolor";
    p2.innerText = "tier color";
    form.append(p2);

    const colorSelector = document.createElement("input");
    colorSelector.type = "color";
    colorSelector.name = "rowcolor";
    colorSelector.value =
      row.querySelector(".label-holder").style.backgroundColor;
    form.appendChild(colorSelector);

    const colorSelectOptions = document.createElement("div");
    colorSelectOptions.setAttribute("class", "color-select-options");
    form.appendChild(colorSelectOptions);

    const defaultColors = [
      "#000000", // black
      "#7f8c8d", // medium gray
      "#e74c3c", // red
      "#e67e22", // orange
      "#f1c40f", // yellow
      "#2ecc71", // green
      "#1abc9c", // teal
      "#3498db", // blue
      "#9b59b6", // purple
      "#ff5fd7ff", // pink
    ];
    for (let i = 0; i < defaultColors.length; i++) {
      const colorChoice = document.createElement("span");
      colorChoice.style.background = defaultColors[i];
      colorChoice.setAttribute("class", "color-choice");
      colorChoice.addEventListener("click", () => {
        colorSelector.value = defaultColors[i];
      });
      colorSelectOptions.append(colorChoice);
    }

    // save and apply changes
    function saveAndApply() {
      let labelholder = row.querySelector(".label-holder");
      if (labelInput.checkValidity() && labelInput.value.length > 0) {
        labelholder.querySelector(".label").innerText = labelInput.value;
        labelholder.style.backgroundColor = colorSelector.value;
      }
      // close
      popup.remove();
    }

    closeButton.addEventListener("click", () => {
      saveAndApply();
    });
    dim.addEventListener("click", () => {
      saveAndApply();
    });
  }

  return { createRow, clearRow };
};

// create sortable anime entries and starting container for them
const bucket = () => {
  const body = document.querySelector("body");

  const container = document.createElement("div");
  container.setAttribute("id", "bucket-container");
  body.append(container);

  const holder = document.createElement("div");
  holder.setAttribute("id", "bucket-holder");
  container.append(holder);

  holder.addEventListener("pointerenter", (e) => {
    if (!selectedCrab) return;
    e.preventDefault();
    if (selectedCrab.parentNode != holder) {
      holder.appendChild(selectedCrab);
    }
  });

  function createCrab(num, entry) {
    const crab = document.createElement("div");
    crab.setAttribute("id", num);
    crab.setAttribute("class", "crab real");
    crab.style.zIndex = 235834524;
    crab.style.backgroundImage = `url("${entry.coverImage.medium}")`;
    holder.append(crab);

    const tooltip = document.createElement("div");
    tooltip.setAttribute("class", "tooltip");
    tooltip.innerText = `${entry.title.romaji} (${entry.startDate.year})`;
    crab.append(tooltip);

    crab.addEventListener("pointerenter", (e) => {
      if (!selectedCrab) return;
      e.preventDefault();

      if (isBefore(selectedCrab, e.target))
        e.target.parentNode.insertBefore(selectedCrab, e.target);
      else e.target.parentNode.insertBefore(selectedCrab, e.target.nextSibling);
    });

    crab.addEventListener("mouseenter", () => {
      tooltip.style.opacity = 1;
    });

    crab.addEventListener("mouseleave", () => {
      tooltip.style.opacity = 0;
    });
  }

  return { holder, createCrab };
};

document.addEventListener("pointerdown", (e) => {
  if (e.target.getAttribute("class") != "crab real") return;
  e.preventDefault();

  selectedCrab = e.target;
  //selectedCrab.setPointerCapture(e.pointerId);

  tempCrab = selectedCrab.cloneNode(true);
  tempCrab.setAttribute("class", "crab fake");
  tempCrab.querySelector(".tooltip").style.display = "none";
  tempCrab.style.pointerEvents = "none";
  selectedCrab.style.transform = "scale(0.95)";
  selectedCrab.style.opacity = "50%";

  // position
  tempCrab.style.position = "fixed";
  tempCrab.style.left = "0";
  tempCrab.style.top = "0";
  tempCrab.style.transform =
    `translate(${e.clientX - tempCrab.offsetWidth / 2}px,
                   ${e.clientY - tempCrab.offsetHeight / 2}px)`;

  document.body.appendChild(tempCrab);
});

document.addEventListener("pointermove", (e) => {
  if (!tempCrab) return;

  tempCrab.style.left = "0";
  tempCrab.style.top = "0";
  tempCrab.style.transform =
    `translate(${e.clientX - tempCrab.offsetWidth / 2}px,
                   ${e.clientY - tempCrab.offsetHeight / 2}px)`;
});

document.addEventListener("pointerup", (e) => {
  if (!tempCrab) return;
  //selectedCrab.releasePointerCapture(e.pointerId);

  selectedCrab.style.transform = "scale(1)";
  selectedCrab.style.opacity = "100%";
  selectedCrab.querySelector(".tooltip").style.opacity = 0;
  selectedCrab.querySelector(".tooltip").style.display = "block";

  tempCrab.remove();

  selectedCrab = null;
  tempCrab = null;
});

// is element b before element a? used for dragging
function isBefore(a, b) {
  if (a.parentNode === b.parentNode) {
    for (var cur = a; cur; cur = cur.previousSibling) {
      if (cur === b) return true;
    }
  }
  return false;
}

export { tierlist, bucket };

