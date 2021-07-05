import React, { useEffect } from "react";
import history from "../history";
let room = null;
let userName = null;

const Chat = () => {
  var socket = io();

  useEffect(() => {
    const { pathname } = history.location;
    let splitPathName = pathname.split("+");
    userName = splitPathName[0].substring(1);
    room = splitPathName[1].split("-").join(" ");
    socket.emit("join", room);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    let msg = e.target.input.value;
    if (msg) {
      socket.emit("chat message", { msg, room });
      e.target.input.value = "";
    }
  }

  socket.on("chat message", function (msg) {
    var messages = document.getElementById("messages");
    var item = document.createElement("li");
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });

  return (
    <div>
      <ul id="messages"></ul>
      <form id="form" onSubmit={handleSubmit}>
        <input id="input" autoComplete="off" />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
