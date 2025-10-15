// intro pop up to get initial information, will probably be phased out
export const introPopUp = ((user) => {
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
});