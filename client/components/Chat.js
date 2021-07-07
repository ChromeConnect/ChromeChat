<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import history from "../history";
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from "draft-js";
import { convertToHTML } from 'draft-convert'
import "draft-js/dist/Draft.css";
import createToolbarPlugin from '@draft-js-plugins/static-toolbar';
=======
import React, { useState, useEffect } from "react"
import RichTextEditor from "./RichTextEditor"
const Filter = require("bad-words")
>>>>>>> 70937e42de9e0fe9cb44e90b4c6a3698af51b8e4


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

	const toolbarPlugin = createToolbarPlugin()
	const { Toolbar } = toolbarPlugin

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
		let msg = convertToHTML(editorState.getCurrentContent()) //sending raw html
		msg = filter.clean(msg) //apply filter on html
		if (msg) {
			socket.emit("chat message", { msg, room });
			setEditorState(EditorState.createEmpty())
		}
	}

<<<<<<< HEAD
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
				<Toolbar />
				<Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
					plugins={[toolbarPlugin]}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
=======
	//on first load, or refresh
	//loop through messages state and display all messages
	useEffect(() => {
		console.log("fetch all messages with firebase and display")
	}, [])

	//get url topic
	//url topic will be used inside .on('url topic')
	socket.on("chat message", function (msg) {
		var messages = document.getElementById("messages")
		var item = document.createElement("p")
		item.textContent = msg
		messages.appendChild(item)
		window.scrollTo(0, document.body.scrollHeight)
	})

	return (
		<div>
			<div className="header" id="myHeader">
				<h2>Lobby</h2>
			</div>
			<div id="messages"></div>
			{/* <form id="form" onSubmit={handleSubmit}>
				<input id="input" autoComplete="off" />
				<button type="submit">Send</button>
			</form> */}
			<RichTextEditor />
		</div>
	)
}

export default Chat
>>>>>>> 70937e42de9e0fe9cb44e90b4c6a3698af51b8e4
