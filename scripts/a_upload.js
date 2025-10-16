import { updateScores } from "./a_anilist.js";
// REQUIRES USER TO BE LOGGED IN

// choosing score ranges for each tier and confirming score submission
const popup = () => {
  return;
};

// assign scores to the sorted entries
function scoreSortedCrabs(scoringMethod = "unorderedWithinTier") {
  var scoredEntries = [];

  // get arrays of anime from the sorted elements
  const rows = document.getElementsByClassName("tier-row");
  for (const row of rows) {
    // get relevant information and entries from row
    var children = row.querySelector(".tier-sort").children;
    var [lo, hi] = [0, 0]; // FIX THIS LINE LATER
    var score = hi;

    for (const child of children) {
      // iterate through entries in row entry in list and assign score
      const index = parseInt(child.id);
      const entry = user.list[index];
      entry.assignedScore = score;
      scoredEntries.push(entry);
      if (scoringMethod === "orderedWithinTier") {
        score -= (hi - lo) / row.children.length;
      }
    }
  }

  return scoredEntries;
}

// update anilist scores for all tiered entries
// requires that the entries have been scored by scoreSortedCrabs()
function updateAllScores(token) {
  const scoredEntries = scoreSortedCrabs();
  if (scoredEntries.length == 0) return; // empty tier list

  var curScore;
  var idArray = [];
  curScore = user.scoredEntries[0].assignedScore;
  for (const entry of scoredEntries) {
    if (curScore != entry.assignedScore) {
      // new score, process previous entries
      updateScores(token, idArray, curScore);
      curScore = entry.assignedScore;
      idArray = [];
    }
    if (entry.assignedScore === entry.mediaListEntry.score) continue; // no change to existing score
    idArray.push(entry.mediaListEntry.id);
  }
  updateScores(token, idArray, curScore); // handle final batch
}

// optional button?
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