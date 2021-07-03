import React, { useState, useEffect } from "react";

const Chat = () => {
  var socket = io();

  function handleSubmit(e) {
    e.preventDefault();
    let msg = e.target.input.value;
    if (msg) {
      socket.emit("chat message", msg);
      e.target.input.value = "";
      firebase
        .database()
        .ref("sequelize")
        .child("lobby") //will eventually be dynamic (topic)
        .push()
        .set({ message: msg, time: Date.now(), sender: "randomUser" }); //will eventually be dynamic (name)
    }
  }

  //on first load, or refresh
  //loop through messages state and display all messages
  /*   useEffect(() => {
    firebase
      .database()
      .ref("sequelize")
      .child("lobby")
      .limitToLast(3)
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          let data = snapshot.val();
          for (const key in data) {
            var messages = document.getElementById("messages");
            var item = document.createElement("li");
            item.textContent = new Date(data[key].time); //message
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
          }
        } else {
          console.log("No data available");
        }
      });
  }, []); */

  //get url topic
  //url topic will be used inside .on('url topic')
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
