const homeServer = "matrix.org";
const roomId = "!BrNaaqBwNWruOcfoDa:matrix.org";

function fetchLastMessage(accessToken, callback) {
  const messageLimit = 1;
  const qs = `access_token=${accessToken}&limit=${messageLimit}&dir=b&filter=${encodeURIComponent(
    '{"types":["m.room.message"]}'
  )}`;
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
  if (message.content.msgtype === "m.text") {
    const divElem = document.createElement("div");
    if (message.content.format === "org.matrix.custom.html")
      divElem.innerHTML = message.content.formatted_body;
    else {
      if (
        message.content.body.startsWith("https://") &&
        message.content.body.split(" ").length == 1
      ) {
        divElem.innerHTML = `<a href="${
          message.content.body
        }">${message.content.body.slice(8)}</a>`;
      } else divElem.innerText = message.content.body;
    }
    if (message.content.body.length < 3)
      messageDiv.setAttribute("style", "font-size: 200px");
    else if (message.content.body.length < 20)
      messageDiv.setAttribute("style", "font-size: 100px");
    else if (message.content.body.length < 100)
      messageDiv.setAttribute("style", "font-size: 50px");
    else
      messageDiv.setAttribute("style", "font-size: 200%");
    messageDiv.appendChild(divElem);
    Prism.highlightAll();
  } else if (message.content.msgtype === "m.image") {
    const imageElem = document.createElement("img");
    const replaceBase = `https://${homeServer}/_matrix/media/r0/download/`;
    imageElem.src = message.content.url.replace("mxc://", replaceBase);
    messageDiv.appendChild(imageElem);
  }
}

window.onload = () => {
  fetchAccessToken((at) => fetchLastMessage(at, displayMessage));
  // TODO: will have to remove the #message div children first
  // setInterval(() => {
  //   // TODO: make this do long polling instead of checking every 1 min
  //   fetchAccessToken((at) => fetchLastMessage(at, displayMessage));
  // }, 1 * 60 * 60 * 1000);
};
