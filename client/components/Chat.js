import React, { useEffect } from "react";
import useState from "react-usestateref";
import history from "../history";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";
import Toolbar from "./toolbar/Toolbar";
import { styleMap } from "./toolbar/styles";
import draftToHtml from "draftjs-to-html";

const Filter = require("bad-words");
let room = null;
let userName = null;
const filter = new Filter();
filter.addWords("Flatiron", "General", "Assembly");

var website = null;
var socketioRoom = null;

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
  const [prevMessage, setPrevMessage, prevMessageRef] = useState({});

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
      timestamp: new Date().toLocaleString([], {
        dateStyle: "short",
        timeStyle: "short",
        hour12: false,
      }),
    };

    if (content.hasText()) {
      socket.emit("chat message", { payload, socketioRoom });
      setEditorState(getResetEditorState(editorState));
      if (!room.includes("Lobby")) {
        firebase
          .database()
          .ref(website)
          .child(room)
          .child("messages")
          .push()
          .set(payload);
      }
    }
  }

  function handleBoard(e) {
    e.preventDefault();
    let splitRoom = room.split(" ").join("-");
    window.open(
      `https://chromechat.herokuapp.com/board/${socketioRoom}/${splitRoom}`,
      splitRoom,
      "height=700,width=1000,left=100,top=100,resizable=no,scrollbars=yes,toolbar=no,menubar=yes,location=no,directories=no, status=yes"
    );
  }

  function formatMessage(payload) {
    const parsedMessage = JSON.parse(payload.msg);
    let html = draftToHtml(parsedMessage);
    html = filter.clean(html);
    return html;
  }

  function getDay(timestamp) {
    return timestamp.split(",")[0];
  }

  function getTime(timestamp) {
    return timestamp.split(",")[1];
  }

  function isLastMessageFromSameSender(payload, lastMessage) {
    if (!lastMessage) {
      return false;
    }

    if (payload.userName === lastMessage.userName) {
      return true;
    }
    return false;
  }

  function isLastMessageFromSameDate(payload, lastMessage) {
    if (!lastMessage) {
      return false;
    }

    const lastMessageDay = getDay(lastMessage.timestamp);
    const day = getDay(payload.timestamp);

    if (lastMessageDay === day) {
      return true;
    }

    return false;
  }

  function isFirstMessage(messages) {
    if (messages.hasChildNodes()) {
      return false;
    }
    return true;
  }

  function renderMessageFromNewSender(payload, messages, item) {
    item.className = "first-message";

    const container = document.createElement("div");
    container.className = "message-container";

    const messageInfo = document.createElement("div");
    messageInfo.className = "message-info";

    const sender = document.createElement("strong");
    sender.textContent = payload.userName;

    const timestamp = document.createElement("small");
    timestamp.textContent = getTime(payload.timestamp);

    messages.appendChild(container);
    container.appendChild(messageInfo);
    messageInfo.appendChild(sender);
    messageInfo.appendChild(timestamp);
    container.appendChild(item);
  }

  function renderMessageFromSameSender(payload, messages, item) {
    const timestamp = document.createElement("small");
    timestamp.className = "timestamp";
    timestamp.textContent = getTime(payload.timestamp);

    const lastMessageContainer = messages.lastChild;

    item.appendChild(timestamp);
    lastMessageContainer.appendChild(item);
  }

  function renderDateSeparator(payload, messages) {
    const dateSeparator = document.createElement("div");
    dateSeparator.className = "date-separator";

    const dateSeparatorContent = document.createElement("div");
    dateSeparatorContent.className = "date-separator-content";
    dateSeparatorContent.innerText = `${getDay(payload.timestamp)} ▼`;

    dateSeparator.appendChild(dateSeparatorContent);
    messages.appendChild(dateSeparator);
  }

  const renderMessage = (payload) => {
    const messages = document.getElementById("messages");
    const lastMessage = prevMessageRef.current;

    const item = document.createElement("div");
    item.className = "message";
    item.innerHTML = formatMessage(payload);

    if (
      isFirstMessage(messages) ||
      !isLastMessageFromSameDate(payload, lastMessage)
    ) {
      //always render the date separator and sender name for first message displayed
      renderDateSeparator(payload, messages);
      renderMessageFromNewSender(payload, messages, item);
    } else if (!isLastMessageFromSameSender(payload, lastMessage)) {
      renderMessageFromNewSender(payload, messages, item);
    } else {
      renderMessageFromSameSender(payload, messages, item);
    }

    messages.scrollTo(0, messages.scrollHeight);
  };

  function loadLastHundredMessages() {
    firebase
      .database()
      .ref(website)
      .child(room)
      .child("messages")
      .limitToLast(100)
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          let data = snapshot.val();
          for (const key in data) {
            const payload = data[key];
            renderMessage(payload);
            setPrevMessage(payload);
          }
        }
      });
  }

  useEffect(() => {
    const { pathname } = history.location;
    let splitPathName = pathname.split("+");
    userName = splitPathName[0].split("/").pop();
    room = splitPathName[1].split("-").join(" ");
    if (pathname.includes("sequelize")) {
      socketioRoom = `Sequelize: ${room}`;
      website = "sequelize";
    } else if (pathname.includes("react")) {
      socketioRoom = `React: ${room}`;
      website = "react";
    } else if (pathname.includes("express")) {
      socketioRoom = `Express: ${room}`;
      website = "express";
    }
    socket.emit("join", socketioRoom);
    loadLastHundredMessages();
  }, []);

  socket.on("chat message", function (payload) {
    renderMessage(payload);
    setPrevMessage(payload); //the incoming message is the previous message when rendering the next message
  });

  socket.on("userCount", function (userCount, room) {
    document.title = `${room} (${userCount})`;
  });

  function handleReturn(event) {
    if (RichUtils.getCurrentBlockType(editorState) === 'unstyled') {
      setEditorState(RichUtils.insertSoftNewline(editorState));
      return "handled";
    }
    return "not-handled";
  }

  return (
    <div>
      <div id="chat-container">
        <div id="messages"></div>
        <button
          id="open-whiteboard"
          title="Go To Whiteboard"
          onClick={handleBoard}
        >
          <i id="go-to-whiteboard" className="fas fa-chalkboard"></i>
        </button>
        <form id="form" onSubmit={handleSubmit}>
          <Toolbar editorState={editorState} setEditorState={setEditorState} />
          <Editor
            editorState={editorState}
            onChange={setEditorState}
            handleKeyCommand={handleKeyCommand}
            customStyleMap={styleMap}
            handleReturn={handleReturn}
          />
          <button title="Send Message" type="submit">
            <i id="send" className="far fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
