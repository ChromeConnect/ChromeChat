import React, { useState, useEffect } from "react";
import history from "../history";
const Filter = require("bad-words");
let room = null;
let userName = null;
const filter = new Filter();
filter.addWords("Flatiron", "General", "Assembly");

const Chat = () => {
  var socket = io();

  const [chatMessages, setMessages] = useState([]);

  function handleSubmit(e) {
    e.preventDefault();
    let msg = filter.clean(e.target.input.value);
    if (msg) {
      socket.emit("chat message", { msg, room });
      e.target.input.value = "";
    }
  }

  useEffect(() => {
    const { pathname } = history.location;
    let splitPathName = pathname.split("+");
    userName = splitPathName[0].substring(1);
    room = splitPathName[1].split("-").join(" ");
    socket.emit("join", room);
  }, []);

  socket.on("chat message", function (msg) {
    var messages = document.getElementById("messages");
    var item = document.createElement("p");
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });

  return (
    <div>
      <div class="header" id="myHeader">
        <h2>Lobby</h2>
      </div>
      <div id="messages"></div>
      <form id="form" onSubmit={handleSubmit}>
        <input id="input" autoComplete="off" />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
