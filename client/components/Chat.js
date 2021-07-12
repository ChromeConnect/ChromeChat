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

  function formatMessage(payload) {
    const parsedMessage = JSON.parse(payload.msg)
    const messageFromRaw = convertFromRaw(parsedMessage)
    let html = convertToHTML(messageFromRaw)
    html = filter.clean(html)
    return html
  }

  function isLastMessageFromSameSender(payload, message) {
    if (!message) {
      return false
    }

    const sender = message.firstChild.firstChild.innerText
    const timestamp = message.firstChild.lastChild.innerText

    console.log(timestamp, payload.timestamp)

    if (payload.userName === sender) {
      return true
    }
    return false
  }

  function renderMessage(payload) {
    const messages = document.getElementById('messages')
    const lastMessage = messages.lastChild

    const item = document.createElement("div");
    item.className = 'message'
    item.innerHTML = formatMessage(payload)

    if (!isLastMessageFromSameSender(payload, lastMessage)){
      const container = document.createElement('div')
      container.className = 'message-container'

      const messageInfo = document.createElement('div')
      messageInfo.className = 'message-info'

      const sender = document.createElement("strong");
      sender.textContent = payload.userName

      const timestamp = document.createElement('small')
      timestamp.textContent = payload.timestamp

      messages.appendChild(container);
      container.appendChild(messageInfo)
      messageInfo.appendChild(sender)
      messageInfo.appendChild(timestamp)
      container.appendChild(item);
      messages.scrollTo(0, messages.scrollHeight);
    }

    else {
      const timestamp = document.createElement('small')
      timestamp.textContent = payload.timestamp

      lastMessage.appendChild(timestamp)
      lastMessage.appendChild(item)
    }
  }

  function loadLastHundredMessages() {
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
            renderMessage(payload)
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

    socket.emit("join", room);
    loadLastHundredMessages();
  }, []);

  socket.on("chat message", function (payload) {
    renderMessage(payload)
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
      <div id='chat-container'>
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
    </div>
  );
};

export default Chat;
