import React, { useState, useEffect } from "react";
import history from "../history";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import { convertToHTML } from "draft-convert";
import "draft-js/dist/Draft.css";
import Toolbar from "./toolbar/Toolbar";
import { styleMap } from "./toolbar/styles";

const Filter = require("bad-words");
let room = null;
let userName = null;
const filter = new Filter();
filter.addWords("Flatiron", "General", "Assembly");

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

  useEffect(() => {
    const { pathname } = history.location;
    let splitPathName = pathname.split("+");
    userName = splitPathName[0].substring(1);
    room = splitPathName[1].split("-").join(" ");
    socket.emit("join", room);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const content = editorState.getCurrentContent();
    let msg = convertToHTML(editorState.getCurrentContent()); //sending raw html
    msg = filter.clean(msg); //apply filter on html
    if (content.hasText()) {
      socket.emit("chat message", { msg, room });
      setEditorState(EditorState.createEmpty());
    }
  }

  socket.on("chat message", function (msg) {
    console.log(msg);
    var messages = document.getElementById("messages");
    var item = document.createElement("div");
    //const html = convertToHTML(msg)
    item.innerHTML = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });

  function handleReturn(event) {
    if (event) {
      setEditorState(RichUtils.insertSoftNewline(editorState));
      return "handled";
    }
    return "not-handled";
  }

  return (
    <div>
      <div className="header" id="myHeader">
        <h2>Lobby</h2>
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
