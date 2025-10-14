var user = {
  name: null,
  avatar: null,
  list: [],
  scoredEntries: [],
  accessToken: null,
};
var selectedCrab;

const introPopUp = (() => {
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
  content.append(header);

  const message = document.createElement("p");
  message.style.lineHeight = "1.5rem";
  message.style.margin = "0";
  content.append(message);

  const anilist = document.createElement("a");
  anilist.setAttribute("class", "anilist-button");
  anilist.href =
    "https://anilist.co/api/v2/oauth/authorize?client_id=30481&response_type=token";
  anilist.innerText = "Login with Anilist";
  content.append(anilist);

  const message_2 = document.createElement("p");
  message_2.style.lineHeight = "1.5rem";
  message_2.style.margin = "0";
  //content.append(message_2);

  const form = document.createElement("div");
  form.setAttribute("class", "popup-form");
  //content.append(form);

  const input = document.createElement("input");
  input.setAttribute("class", "input-field");
  input.placeholder = "search for user";
  //form.append(input);

  const search = document.createElement("button");
  search.setAttribute("class", "search-button");
  search.innerText = "Go!";
  //form.append(search);

  const confirm = document.createElement("button");
  confirm.setAttribute("class", "confirm-button");
  content.append(confirm);
  confirm.innerText = "continue";
  confirm.style.display = "none";

  header.innerText = "Tier List Maker";
  message.innerText =
    "Please login with Anilist to make a tier list of your own anime list and update scores to your account.";
  message_2.innerText =
    "Alternatively, you can search for another user's to make a tier list out of";

  search.addEventListener("click", async () => {
    const res = await getUserList(input.value);
    if (!res) {
      console.log("erm");
    } else {
      user.name = input.value;
      confirm.style.display = "block";
    }
  });

  confirm.addEventListener("click", () => {});

  return { popup };
})();

// create rows for anime to be sorted in
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

  function clearRow(row) {
    const sortable = row.querySelector(".tier-sort");
    while (sortable.children.length > 0) {
      const bucket = document.querySelector("#bucket-holder");
      bucket.appendChild(sortable.children[0]);
    }
  }

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
})();

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

  // FINISH CLOSE BUTTON, ABSOLUTE POSITIONED AT TOP RIGHT OF POPUP
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

  return { createCrab };
})();

// using this until i add functionality for ranking other users lists
const tempUserSetup = (async () => {
  // get access token from url (if already authenticated)
  const hash = window.location.hash.substring(1);
  const urlParams = new URLSearchParams(hash);
  const token = urlParams.get("access_token");
  if (token == null) return;
  console.log(token);
  user.accessToken = token;
  // get user info from token and save
  [user.name, user.avatar] = await getUserInfoWithToken();
  document.getElementById("user-avatar").src = user.avatar;
  document.getElementById("user-name").innerText = user.name;
  introPopUp.popup.style.display = "none";

  await getUserList(user.name);

  for (let i = 0; i < user.list.length; i++) bucket.createCrab(i, user.list[i]);
})();

// is element b before element a?
function isBefore(a, b) {
  if (a.parentNode === b.parentNode) {
    for (var cur = a; cur; cur = cur.previousSibling) {
      if (cur === b) return true;
    }
  }
  return false;
}

// make api request to anilist.co
async function apiRequest(query, variables) {
  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + user.accessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });
    return response.json();
  } catch (err) {
    console.log(err);
    return null;
  }
}

// get username and avatar associated with access token
async function getUserInfoWithToken() {
  const query = `
    query {
      Viewer {
        name
        avatar {
          medium
        }
      }
    }
  `;

  const res = await apiRequest(query);
  return [res.data.Viewer.name, res.data.Viewer.avatar.medium];
}

// get the complete list of anime entries for a username
async function getUserList(userName) {
  const query = `
      query ($userName: String){
        MediaListCollection(userName: $userName, type: ANIME) {
          lists {
            entries {
              media {
                title {
                    romaji
                    english
                }
                coverImage{
                    medium
                }
                startDate {
                    year     			
                } 
                mediaListEntry {
                  id
                  createdAt
                  score (format:POINT_100)
                }
              }
            }
          }
        }
      }
    `;

  const variables = {
    userName: userName,
  };

  const res = await apiRequest(query, variables);
  if (res.data == null) return false;

  res.data.MediaListCollection.lists.forEach((list) => {
    list.entries.forEach((entry) => {
      user.list.push(entry.media);
    });
  });

  localStorage.setItem("list", JSON.stringify(user.list));
  console.log(user.list);
  return true;
}

// update anilist scores for all tiered entries
// requires that the entries have been scored by scoreSortedCrabs()
function updateAllScores() {
  if (user.accessToken == null) {
    alert("no token found, please login to anilist");
    return;
  }

  if (user.scoredEntries.length == 0) return; // empty tier list

  var curScore;
  var idArray = [];
  curScore = user.scoredEntries[0].assignedScore;
  for (const entry of user.scoredEntries) {
    if (curScore != entry.assignedScore) {
      // new score, process previous entries
      updateScores(idArray, curScore);
      curScore = entry.assignedScore;
      idArray = [];
    }
    if (entry.assignedScore === entry.mediaListEntry.score) continue; // no change to existing score
    idArray.push(entry.mediaListEntry.id);
  }
  updateScores(idArray, curScore); // handle final batch
}

// send api request to update scores (using mediaListEntry ids, NOT media ids)
// all entries will be given the same score in this call
function updateScores(ids, score) {
  if (ids.length <= 0) return;
  var mutation = `
    mutation UpdateMediaListEntries($ids: [Int], $scoreRaw: Int) {
      UpdateMediaListEntries(ids: $ids, scoreRaw: $scoreRaw) {
        score(format: POINT_100)
      }
    }    
  `;

  var variables = {
    ids: ids,
    scoreRaw: score,
  };

  return apiRequest(mutation, variables);
}

// set anilist scores to 0 for any entry that wasn't in the tier list
function resetUntieredEntryScores() {
  if (user.accessToken == null) {
    alert("no token found, please login to anilist");
    return;
  }

  var idArray = [];
  for (const entry of user.list) {
    if (entry.assignedScore == null) {
      idArray.push(entry.mediaListEntry.id);
    }
  }
  updateScores(idArray, 0);
}

// assign scores to the sorted entries
function scoreSortedCrabs(scoringMethod = "unorderedWithinTier") {
  user.scoredEntries = [];

  // get arrays of anime from the sorted elements
  const rows = document.getElementsByClassName("tier-row");
  for (const row of rows) {
    // get relevant information and entries from row
    var children = row.querySelector(".tier-sort").children;
    var [lo, hi] = [parseInt(row.dataset.lo), parseInt(row.dataset.hi)];
    var score = hi;

    for (const child of children) {
      // iterate through entries in row entry in list and assign score
      const index = parseInt(child.id);
      const entry = user.list[index];
      entry.assignedScore = score;
      user.scoredEntries.push(entry);
      if (scoringMethod === "orderedWithinTier") {
        score -= (hi - lo) / row.children.length;
      }
    }
  }
}

// get list of entries with a difference (between lo and hi) between the user's given score and the tier list assigned score
function findDifferenceBetween(lo, hi) {
  const array = [];
  for (const entry of user.scoredEntries) {
    const diff =
      entry.mediaListEntry.score != null
        ? entry.assignedScore - entry.mediaListEntry.score
        : 0;
    if (Math.abs(diff) >= lo && Math.abs(diff) <= hi) {
      array.push({ entry, diff });
    }
  }
  return array;
}

// if the entry has a score already on anilist, remove it from consideration
function hideScoredEntries() {
  const crabs = document.getElementsByClassName("crab");
  for (const crab of crabs) {
    const index = parseInt(crab.id);
    if (user.list[index].mediaListEntry.score != 0) {
      crab.style.display = "none";
    }
  }
}

document.getElementById("b2").addEventListener("click", () => {
  hideScoredEntries();
});

document.getElementById("b3").addEventListener("click", () => {
  scoreSortedCrabs();
  updateAllScores();
});

/*
 *  TO-DO LIST
 *  1. create interface for confirming score upload to anilist (score ranges should take place at THIS point)
 *  2. reorganize this mega-file into separate files
 *  3. improve initial starting experience / allow for no login
 */