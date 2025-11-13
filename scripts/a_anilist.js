// make api request to anilist.co
async function apiRequest(query, variables, token) {
  try {
    // set up headers
    var headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }; // add token if possible
    if (token) headers.Authorization = "Bearer " + token;

    // make request
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: headers,
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
async function getUserInfoWithToken(token) {
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

  const res = await apiRequest(query, {}, token);
  return [res.data.Viewer.name, res.data.Viewer.avatar.medium];
}

// get the complete list of anime entries for a username
async function getUserList(userName, token) {
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

  const res = await apiRequest(query, variables, token);
  if (res.data.MediaListCollection == null) return null;

  let userlist = [];
  res.data.MediaListCollection.lists.forEach((list) => {
    list.entries.forEach((entry) => {
      userlist.push(entry.media);
    });
  });

  return userlist;
}

// send api request to update scores (using mediaListEntry ids, NOT media ids)
// all entries will be given the same score in this call
function updateScores(token, ids, score) {
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

  return apiRequest(mutation, variables, token);
}

async function getMostPopular() {
  const query = `      
    query($page: Int) {
      Page(page: $page) {
        media(type: ANIME, sort: POPULARITY_DESC) {
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
`;

  const res = await apiRequest(query, { page: 1 });
  const resNext = await apiRequest(query, { page: 2 });

  let list = Array.from(res.data.Page.media);
  return list.concat(Array.from(resNext.data.Page.media));
}

export { getUserInfoWithToken, getUserList, updateScores, getMostPopular };
