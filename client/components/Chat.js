import React, { useState, useEffect } from "react";
import history from "../history";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  ContentState,
  Modifier,
} from "draft-js";
import { convertToHTML } from "draft-convert";
import "draft-js/dist/Draft.css";
import Toolbar from "./toolbar/Toolbar";
import { styleMap } from "./toolbar/styles";
import draftToHtml from "draftjs-to-html";

const Filter = require("bad-words");
let room = null;
let userName = null;
const filter = new Filter();
filter.addWords("Flatiron", "General", "Assembly");

const removeSelectedBlocksStyle = (editorState) => {
  const newContentState = RichUtils.tryToRemoveBlockStyle(editorState);
  if (newContentState) {
    return EditorState.push(editorState, newContentState, "change-block-type");
  }
  return editorState;
};

const getResetEditorState = (editorState) => {
  const blocks = editorState.getCurrentContent().getBlockMap().toList();
  const updatedSelection = editorState.getSelection().merge({
    anchorKey: blocks.first().get("key"),
    anchorOffset: 0,
    focusKey: blocks.last().get("key"),
    focusOffset: blocks.last().getLength(),
  });
  const newContentState = Modifier.removeRange(
    editorState.getCurrentContent(),
    updatedSelection,
    "forward"
  );

  const newState = EditorState.push(
    editorState,
    newContentState,
    "remove-range"
  );
  return removeSelectedBlocksStyle(newState);
};

const Chat = () => {
  var socket = io();

  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not handled";
  };

  function handleSubmit(e) {
    e.preventDefault();

    const content = editorState.getCurrentContent();
    let rawMessage = convertToRaw(content);
    let stringMessage = JSON.stringify(rawMessage);
    let payload = {
      msg: stringMessage,
      userName,
      timestamp: new Date().toLocaleTimeString(),
    };

    if (content.hasText()) {
      socket.emit("chat message", { payload, room });
      setEditorState(getResetEditorState(editorState));
      firebase
        .database()
        .ref("sequelize")
        .child(room)
        .child("messages")
        .push()
        .set(payload);
    }
  }

  function loadLastHundredMessages() {
    var messages = document.getElementById("messages");

    firebase
      .database()
      .ref("sequelize")
      .child(room)
      .child("messages")
      .limitToLast(100)
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          let data = snapshot.val();
          for (const key in data) {
            const payload = data[key];
            //add messsages below here
            var item = document.createElement("div");
            var sender = document.createElement("h5");
            let parsedMessage = JSON.parse(payload.msg);
            const msgFromRaw = convertFromRaw(parsedMessage);
            let html = convertToHTML(msgFromRaw);
            html = filter.clean(html);
            item.innerHTML = html;
            sender.textContent = `-${
              payload.userName[0].toUpperCase() + payload.userName.substring(1)
            }(sent at ${payload.timestamp})`;
            messages.appendChild(item);
            messages.appendChild(sender);
            window.scrollTo(0, document.body.scrollHeight);
          }
        } else {
          console.log("No data available");
        }
      });
  }

  useEffect(() => {
    const { pathname } = history.location;
    let splitPathName = pathname.split("+");
    userName = splitPathName[0].substring(1);
    room = splitPathName[1].split("-").join(" ");
    document.title = room;
    const topic = document.getElementById("topic");
    topic.innerText = `${room[0].toUpperCase() + room.substring(1)}`;
    socket.emit("join", room);
    loadLastHundredMessages();
  }, []);

  socket.on("chat message", function (payload) {
    var messages = document.getElementById("messages");
    var item = document.createElement("div");
    var sender = document.createElement("h5");
    let parsedMessage = JSON.parse(payload.msg);
    let html = draftToHtml(parsedMessage);
    html = filter.clean(html);
    console.log(html)
    item.innerHTML = html;
    sender.textContent = `-${
      payload.userName[0].toUpperCase() + payload.userName.substring(1)
    }(sent at ${payload.timestamp})`;
    messages.appendChild(item);
    messages.appendChild(sender);
    window.scrollTo(0, document.body.scrollHeight);
  });

  function handleReturn(event) {
    if (event.shiftKey) {
      setEditorState(RichUtils.insertSoftNewline(editorState));
      return "handled";
    }
    return "not-handled";
  }

  return (
    <div>
      <div className="header" id="myHeader">
        <h2 id="topic"></h2>
      </div>
      <div id="messages"></div>
      <form id="form" onSubmit={handleSubmit}>
        <Toolbar editorState={editorState} setEditorState={setEditorState} />
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          customStyleMap={styleMap}
          handleReturn={handleReturn}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
