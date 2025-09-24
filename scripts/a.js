var user = {
  name: null,
  avatar: null,
  list: [],
  sortedTiers: [],
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

  const colors = [
    "#b624b6ff",
    "#25b3b3ff",
    "#23b323ff",
    "#a29a25ff",
    "#b82929ff",
  ];
  const text = ["S", "A", "B", "C", "D"];
  for (let i = 0; i < 5; i++) createRow(colors[i], text[i]);

  function createRow(color, text) {
    const row = document.createElement("div");
    row.setAttribute("class", "tier-row");
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
    row.append(sortable);

    sortable.addEventListener("dragenter", (e) => {
      e.preventDefault();
      if (selectedCrab.parentNode != sortable) {
        sortable.appendChild(selectedCrab);
      }
    });
    sortable.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
  }
})();

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
      selectedCrab.parentNode = holder;
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

// set up access token and list if applicable
const userSetup = async () => {
  // check if a previous list exists
  user.list = JSON.parse(localStorage.getItem("list") || []);
  for (let i = 0; i < user.list.length; i++) bucket.createCrab(i, user.list[i]);

  // check previous user info
  user.name = localStorage.getItem("name") || null;
  user.avatar = localStorage.getItem("avatar") || null;
  if (user.name != null) {
    document.getElementById("user-avatar").src = user.avatar;
    document.getElementById("user-name").innerText = user.name;
    introPopUp.popup.style.display = "none";
  }

  // get access token from url (if already authenticated)
  const hash = window.location.hash.substring(1);
  const urlParams = new URLSearchParams(hash);
  const token = urlParams.get("access_token");
  if (token == null) return;
  user.accessToken = token;

  // get user info from token and save
  [user.name, user.avatar] = await getUserInfoWithToken();
  localStorage.setItem("name", user.name);
  localStorage.setItem("avatar", user.avatar);
};

// using this until i add functionality for ranking other users lists
const tempUserSetup = (async () => {
  // get access token from url (if already authenticated)
  const hash = window.location.hash.substring(1);
  const urlParams = new URLSearchParams(hash);
  const token = urlParams.get("access_token");
  if (token == null) return;
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

  const scoredList = user.list.filter((entry) => entry.assignedScore != null);
  if (scoredList.length == 0) return; // empty tier list
  const sortedList = scoredList.sort(
    (a, b) => a.assignedScore - b.assignedScore
  );

  var curScore;
  var idArray = [];
  curScore = sortedList[0].assignedScore;
  for (const entry of sortedList) {
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
  if (token == null) {
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
  user.sortedTiers = [];

  // get arrays of anime from the sorted elements
  const rows = document.getElementsByClassName("tier-sort");
  for (const row of rows) {
    var tier = [];
    for (const child of row.children) {
      const index = parseInt(child.id);
      tier.push(user.list[index]);
    }
    user.sortedTiers.push(tier);
  }

  // assign a score to each entry, dependent on scoring method
  var score = 100;
  for (const tier of user.sortedTiers) {
    for (const entry of tier) {
      entry.assignedScore = score;
      console.log(entry.title.romaji, score);
      if (scoringMethod === "orderedWithinTier") {
        score -= 10 / tier.length;
      }
    }
    if (scoringMethod === "unorderedWithinTier") {
      score -= 10;
    }
  }
}

// get list of entries with a difference (between lo and hi) between the user's given score and the tier list assigned score
function findDifferenceBetween(lo, hi) {
  const array = [];
  for (const tier of user.sortedTiers) {
    for (const entry of tier) {
      const diff =
        entry.mediaListEntry.score != null
          ? entry.assignedScore - entry.mediaListEntry.score
          : 0;
      if (Math.abs(diff) >= lo && Math.abs(diff) <= hi) {
        array.push({ entry, diff });
      }
    }
  }
  return array;
}

// if the entry has a score already on anilist, remove it from consideration
function hideScoredEntries() {
  const crabs = document.getElementsByClassName("crab");
  for (const crab in crabs) {
    const index = parseInt(child.id);
    if (user.list[index].mediaListEntry.score != null) {
      crab.style.display = "none";
    }
  }
}

document.getElementById("b3").addEventListener("click", () => {
  scoreSortedCrabs();
  updateAllScores();
});

document.getElementById("b2").addEventListener("click", () => {
  hideScoredEntries();
});
