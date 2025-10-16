import html2canvas from "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm";
import { introPopUp } from "./a_intro.js";
import { tierlist as tl, bucket as bckt } from "./a_sorting.js";
import { getUserInfoWithToken, getUserList } from "./a_anilist.js";

const user = {
  name: null,
  avatar: null,
  list: [],
  hidden: [],
  token: null,
};

const tierlist = tl();
const bucket = bckt();

const checkToken = (async () => {
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

  // display login required feature
  document.getElementById("checkbox-div").style.display = "block";

  // grab list
  user.list = await getUserList(user.name, token);

  // go!
  initializeUser();
})();

export function initializeUser(list, name) {
  if (name) user.name = name;
  if (list) user.list = list;

  // avatar accompanying name at the top (if logged in)
  const ava = document.getElementById("user-avatar");
  if (user.avatar) ava.src = user.avatar;
  else ava.remove();

  document.getElementById("user-name").innerText = `${user.name}'s list`;

  // give warning that tier list progress and whatnot will NOT be saved upon leaving/refresh
  window.onbeforeunload = function () {
    return "progress will reset";
  };

  for (let i = 0; i < user.list.length; i++) bucket.createCrab(i, user.list[i]);
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
      user.hidden.push({
        entry: user.list[index],
        crab: crab,
        parent: crab.parentNode,
      });
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
    if (parent != null)
      // if parent exists to readd crab
      item.parent.append(item.crab);
    // if previous tier has been deleted for whatever reason
    else bucket.holder.append(item.crab);
  }
}

// export the list as a jpeg -- using html2canvas
async function saveListAsImage() {
  const el = document.getElementById("tier-wrapper");

  // convert element to canvas with html2canvas
  const canvas = await html2canvas(el, {
    scale: 3, 
    useCORS: true, 
    allowTaint: false, 
    backgroundColor: null,
  });

  // download canvas
  canvas.toBlob(
    (blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "list-export.jpeg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    },
    "image/jpeg",
    0.92
  );
}

document.getElementById("hide-show-entries").addEventListener("click", (e) => {
  if (e.target.checked) hideScoredEntries();
  else showHiddenEntries();
});

document.getElementById("share-list-button").addEventListener("click", (e) => {
  saveListAsImage();
});

/*
 *  TO-DO LIST
 *  1. create interface for confirming score upload to anilist (score ranges should take place at THIS point)
 */
