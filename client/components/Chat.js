import React, { useState, useEffect } from "react"
const Filter = require("bad-words")

const filter = new Filter()
filter.addWords("Flatiron", "General", "Assembly")

/**
 * COMPONENT
 */
const Chat = () => {
	var socket = io()

	const [chatMessages, setMessages] = useState([])

	function handleSubmit(e) {
		e.preventDefault()
		let msg = filter.clean(e.target.input.value)
		if (msg) {
			socket.emit("chat message", msg)
			e.target.input.value = ""
			//send msg to firebase chat topic
		}
	}

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
			<div class="header" id="myHeader">
				<h2>Lobby</h2>
			</div>
			<div id="messages"></div>
			<form id="form" onSubmit={handleSubmit}>
				<input id="input" autoComplete="off" />
				<button type="submit">Send</button>
			</form>
		</div>
	)
}

export default Chat
