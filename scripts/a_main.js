import { introPopUp } from "./a_intro.js";
import { tierlist, bucket } from "./a_sorting.js";
import {
  getUserInfoWithToken,
  getUserList,
  updateScores,
} from "./a_anilist.js";

const user = {
  name: null,
  avatar: null,
  list: [],
  scoredEntries: [],
  hidden: [],
  token: null,
};

const tl = tierlist();
const bckt = bucket();

// using this until i add functionality for ranking other users lists
const tempUserSetup = (async () => {
  // get access token from url (if already authenticated)
  const hash = window.location.hash.substring(1);
  const urlParams = new URLSearchParams(hash);
  const token = urlParams.get("access_token");
  if (token == null) {
    introPopUp();
    return;
  }
  user.token = token;
  // get user info from token and save
  [user.name, user.avatar] = await getUserInfoWithToken(user.token);
  document.getElementById("user-avatar").src = user.avatar;
  document.getElementById("user-name").innerText = user.name;

  user.list = await getUserList(user.name, token);

  for (let i = 0; i < user.list.length; i++) bckt.createCrab(i, user.list[i]);
})();

// update anilist scores for all tiered entries
// requires that the entries have been scored by scoreSortedCrabs()
function updateAllScores() {
  if (user.token == null) {
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
      updateScores(user.token, idArray, curScore);
      curScore = entry.assignedScore;
      idArray = [];
    }
    if (entry.assignedScore === entry.mediaListEntry.score) continue; // no change to existing score
    idArray.push(entry.mediaListEntry.id);
  }
  updateScores(user.token, idArray, curScore); // handle final batch
}

// set anilist scores to 0 for any entry that wasn't in the tier list
function resetUntieredEntryScores() {
  if (user.token == null) {
    alert("no token found, please login to anilist");
    return;
  }

  var idArray = [];
  for (const entry of user.list) {
    if (entry.assignedScore == null) {
      idArray.push(entry.mediaListEntry.id);
    }
  }
  updateScores(user.token, idArray, 0);
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
  // get all the crabs
  const crabs = document.getElementsByClassName("crab");
  const removalQueue = []; // to remove elements from document after

  // iterate through each crab (and therefore entry), removing any that already have a score
  for (const crab of crabs) {
    const index = parseInt(crab.id);
    if (user.list[index].mediaListEntry.score != 0) {
      // save info for later readdition
      user.hidden.push({ entry: user.list[index], crab: crab, parent: crab.parentNode });
      removalQueue.push(crab);
    }
  }

  // actually removing elements from page
  while (removalQueue.length > 0) {
    const tr = removalQueue.pop();
    tr.remove();
  }
}

// readd entries that had been hidden by hideScoredEntries()
function showHiddenEntries() {
  while (user.hidden.length > 0) {
    const item = user.hidden.pop();
    if(parent != null) // if parent exists to readd crab
      item.parent.append(item.crab);
    else // if previous tier has been deleted for whatever reason
      bckt.holder.append(item.crab);
  }
}

document.getElementById("hide-show-entries").addEventListener("click", (e) => {
  if(e.target.checked)
    hideScoredEntries();
  else
    showHiddenEntries();
});

/*
 *  TO-DO LIST
 *  1. create interface for confirming score upload to anilist (score ranges should take place at THIS point)
 *  2. improve initial starting experience / allow for no login
 */
