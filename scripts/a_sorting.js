var selectedCrab; // for moving crabs between tiers and the bucket

// creates tier list and default tiers
// includes row creation, row swapping, and row clearing
// has functionality to serve as container for crabs
const tierlist = (() => {
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
  const his = [100, 90, 80, 70, 60];
  const los = [90, 80, 70, 60, 0];
  for (let i = 0; i < 5; i++) createRow(colors[i], text[i], i, los[i], his[i]);

  function createRow(color, text, id, lo, hi) {
    const row = document.createElement("div");
    row.setAttribute("class", "tier-row");
    row.setAttribute("data-id", id);
    row.setAttribute("data-lo", lo);
    row.setAttribute("data-hi", hi);
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
    sortable.addEventListener("dragenter", (e) => {
      e.preventDefault();
      if (selectedCrab.parentNode != sortable) {
        sortable.appendChild(selectedCrab);
      }
    });
    sortable.addEventListener("dragover", (e) => {
      e.preventDefault();
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
    const [a, b, c] = [x.dataset.id, x.dataset.lo, x.dataset.hi];

    x.setAttribute("data-id", y.dataset.id);
    x.setAttribute("data-lo", y.dataset.lo);
    x.setAttribute("data-hi", y.dataset.hi);

    y.setAttribute("data-id", a);
    y.setAttribute("data-lo", b);
    y.setAttribute("data-hi", c);

    // swap positions
    if (ix > iy) container.insertBefore(x, y);
    else container.insertBefore(y, x);
  }

  return { createRow, clearRow };
});

// creates an options popup for a row
// allows changing name/color, row clearing, row deletion, row creation above/below
// TO BE REMOVED: lo/hi settings
function rowOptions(row) {
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

  const p1 = document.createElement("p");
  p1.innerText = "row label";
  form.append(p1);

  const labelInput = document.createElement("input");
  labelInput.setAttribute("class", "label-input-area");
  labelInput.type = "name";
  labelInput.maxLength = 100;
  labelInput.value = row.querySelector(".label-holder .label").innerText;
  labelInput.placeholder = "enter new label";
  form.append(labelInput);

  const p2 = document.createElement("p");
  p2.innerText = "score range";
  form.append(p2);

  const loInput = document.createElement("input");
  loInput.setAttribute("class", "label-input-area");
  loInput.type = "number";
  loInput.step = 1;
  loInput.min = 0;
  loInput.max = 100;
  loInput.placeholder = `${row.dataset.lo} (exclusive)`;
  form.append(loInput);

  const hiInput = document.createElement("input");
  hiInput.setAttribute("class", "label-input-area");
  hiInput.type = "number";
  hiInput.step = 1;
  hiInput.min = 0;
  hiInput.max = 100;
  hiInput.placeholder = `${row.dataset.hi} (inclusive)`;
  form.append(hiInput);

  // save and apply changes
  function saveAndApply() {
    if (labelInput.checkValidity() && labelInput.value.length > 0)
      row.querySelector(".label-holder .label").innerText = labelInput.value;
    let newLo =
      loInput.checkValidity() && loInput.value !== ""
        ? loInput.value
        : row.dataset.lo;

    let newHi =
      hiInput.checkValidity() && hiInput.value !== ""
        ? hiInput.value
        : row.dataset.hi;

    // fix order if necessary
    if (parseInt(newLo) > parseInt(newHi)) {
      let temp = newLo;
      newLo = newHi;
      newHi = temp;
    }

    row.dataset.lo = newLo;
    row.dataset.hi = newHi;

    // close
    popup.remove();
  }

  closeButton.addEventListener("click", () => {
    saveAndApply();
  });
  dim.addEventListener("click", () => {
    saveAndApply();
  });

  const buttonRow1 = document.createElement("div");
  content.append(buttonRow1);

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete Row";
  deleteButton.addEventListener("click", () => {
    const rows = row.parentNode.children;
    if (rows.length === 1) return; // cant remove last row
    const id = parseInt(row.dataset.id);
    for (let i = id; i < rows.length; i++) {
      rows[i].dataset.id = parseInt(rows[i].dataset.id) - 1;
    }
    tierlist.clearRow(row);
    row.remove();
    popup.remove();
  });
  buttonRow1.append(deleteButton);

  const clearButton = document.createElement("button");
  clearButton.innerText = "Clear Row";
  clearButton.addEventListener("click", () => {
    tierlist.clearRow(row);
  });
  buttonRow1.append(clearButton);

  const buttonRow2 = document.createElement("div");
  content.append(buttonRow2);

  const createAbove = document.createElement("button");
  createAbove.innerText = "Create Row Above";
  createAbove.addEventListener("click", () => {
    const rows = row.parentNode.children;
    const id = parseInt(row.dataset.id);
    let lo, hi;
    if (id === 0) {
      hi = 100;
    } else {
      hi = row.parentNode.children[id - 1].dataset.lo;
    }
    lo = row.dataset.hi;
    for (let i = id; i < rows.length; i++) {
      rows[i].dataset.id = parseInt(rows[i].dataset.id) + 1;
    }
    const newRow = tierlist.createRow("#ff8800ff", "new", id, lo, hi);
    row.parentNode.insertBefore(newRow, row);
  });
  buttonRow2.append(createAbove);

  const createBelow = document.createElement("button");
  createBelow.innerText = "Create Row Below";
  createBelow.addEventListener("click", () => {
    const rows = row.parentNode.children;
    const id = parseInt(row.dataset.id);
    let lo, hi;
    if (id === rows.length - 1) {
      lo = 0;
    } else {
      lo = row.parentNode.children[id + 1].dataset.hi;
    }
    hi = row.dataset.lo;
    for (let i = id + 1; i < rows.length; i++) {
      rows[i].dataset.id = parseInt(rows[i].dataset.id) + 1;
    }
    const newRow = tierlist.createRow("#ff8800ff", "new", id + 1, lo, hi);
    row.parentNode.insertBefore(newRow, rows[id + 1]);
  });
  buttonRow2.append(createBelow);
}

// create sortable anime entries and starting container for them
const bucket = (() => {
  const body = document.querySelector("body");

  const container = document.createElement("div");
  container.setAttribute("id", "bucket-container");
  body.append(container);

  const holder = document.createElement("div");
  holder.setAttribute("id", "bucket-holder");
  container.append(holder);

  holder.addEventListener("dragenter", (e) => {
    e.preventDefault();
    if (selectedCrab.parentNode != holder) {
      holder.appendChild(selectedCrab);
    }
  });
  holder.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  function createCrab(num, entry) {
    const crab = document.createElement("div");
    crab.setAttribute("id", num);
    crab.setAttribute("class", "crab");
    crab.setAttribute("draggable", true);
    crab.style.backgroundImage = `url("${entry.coverImage.medium}")`;
    holder.append(crab);

    const tooltip = document.createElement("div");
    tooltip.setAttribute("class", "tooltip");
    tooltip.innerText = `${entry.title.romaji} (${entry.startDate.year})`;
    crab.append(tooltip);

    crab.addEventListener("mouseenter", () => {
      tooltip.style.opacity = 1;
    });

    crab.addEventListener("mousedown", () => {
      crab.style.transform = "scale(0.95)";
      crab.style.opacity = "50%";
      tooltip.style.opacity = 0;
    });

    crab.addEventListener("mouseleave", () => {
      tooltip.style.opacity = 0;
    });

    crab.addEventListener("mouseup", (e) => {
      crab.style.transform = "scale(1)";
      crab.style.opacity = "100%";
    });

    crab.addEventListener("dragstart", (e) => {
      selectedCrab = e.target;
    });

    crab.addEventListener("dragenter", (e) => {
      e.preventDefault();
      if (isBefore(selectedCrab, e.target))
        e.target.parentNode.insertBefore(selectedCrab, e.target);
      else e.target.parentNode.insertBefore(selectedCrab, e.target.nextSibling);
    });

    crab.addEventListener("dragend", (e) => {
      crab.style.transform = "scale(1)";
      crab.style.opacity = "100%";
      selectedCrab = null;
    });
  }

  return { holder, createCrab };
});

// is element b before element a?
function isBefore(a, b) {
  if (a.parentNode === b.parentNode) {
    for (var cur = a; cur; cur = cur.previousSibling) {
      if (cur === b) return true;
    }
  }
  return false;
}

export {tierlist, bucket};