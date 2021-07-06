import React, { useState, useEffect } from "react";
import history from "../history";
import { Editor, EditorState, RichUtils } from "draft-js";
import { convertToHTML } from 'draft-convert'
import "draft-js/dist/Draft.css";

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

  function handleSubmit(e) {
    e.preventDefault();
    //let msg = filter.clean(e.target.input.value);
		let msg = convertToHTML(editorState.getCurrentContent())
    if (msg) {
      socket.emit("chat message", { msg, room });
      e.target.input.value = "";
			setEditorState(EditorState.createEmpty())
    }
  }

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

  socket.on("chat message", function (msg) {
    var messages = document.getElementById("messages");
    var item = document.createElement("div");
		//const html = convertToHTML(msg)
    item.innerHTML = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });

  return (
    <div>
      <div className="header" id="myHeader">
        <h2>Lobby</h2>
      </div>
      <div id="messages"></div>
      <form id="form" onSubmit={handleSubmit}>
				<Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
