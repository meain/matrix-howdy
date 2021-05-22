const homeServer = "matrix.org";
const roomId = "!BrNaaqBwNWruOcfoDa:matrix.org";

function fetchLastMessage(accessToken, callback) {
  const messageLimit = 1;
  const qs = `access_token=${accessToken}&limit=${messageLimit}&dir=b`;
  const url = `https://${homeServer}/_matrix/client/r0/rooms/${roomId}/messages?${qs}`;

  fetch(url, { method: "GET" })
    .then((res) => res.json())
    .then((json) => callback(json.chunk[0]))
    .catch((err) => console.error("error:" + err));
}

function fetchAccessToken(callback) {
  const savedToken = localStorage.getItem("token");
  if (savedToken === null) {
    const url = `https://${homeServer}/_matrix/client/r0/register?kind=guest`;
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"initial_dispaly_name":"Marix Howdy"}',
    };
    fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        localStorage.setItem("token", json.access_token);
        callback(json.access_token);
      })
      .catch((err) => console.error("error:" + err));
  } else {
    callback(savedToken);
  }
}

function displayMessage(message) {
  const messageDiv = document.getElementById("message");
  console.log(message);
  if (message.content.msgtype === "m.text")
    messageDiv.innerText = message.content.body;
  else if (message.content.msgtype === "m.image") {
    const imageElem = document.createElement("img");
    const replaceBase = `https://${homeServer}/_matrix/media/r0/download/`;
    imageElem.src = message.content.url.replace("mxc://", replaceBase);
    messageDiv.appendChild(imageElem);
  }
}

window.onload = () => {
  fetchAccessToken((at) => fetchLastMessage(at, displayMessage));
  // setInterval(() => {
  //   fetchAccessToken((at) => fetchLastMessage(at, displayMessage));
  // }, 10000);
};
