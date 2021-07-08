import React, { useEffect } from "react"
import history from "../history"
const Filter = require("bad-words")
let room = null
let userName = null
const filter = new Filter()
filter.addWords("Flatiron", "General", "Assembly")

const Chat = () => {
	var socket = io()

	function handleSubmit(e) {
		e.preventDefault()
		let payload = {
			msg: filter.clean(e.target.input.value),
			userName,
			timestamp: new Date().toLocaleTimeString(),
		}
		if (payload) {
			socket.emit("chat message", { payload, room })
			e.target.input.value = ""
		}
	}

	useEffect(() => {
		const { pathname } = history.location
		let splitPathName = pathname.split("+")
		userName = splitPathName[0].substring(1)
		room = splitPathName[1].split("-").join(" ")
		const topic = document.getElementById("topic")
		topic.innerText = `${room[0].toUpperCase() + room.substring(1)}`
		socket.emit("join", room)
		console.log(room)
	}, [])

	socket.on("chat message", function (payload) {
		console.log(payload)
		var messages = document.getElementById("messages")
		var item = document.createElement("p")
		var sender = document.createElement("h5")
		item.textContent = payload.msg
		sender.textContent = `-${
			payload.userName[0].toUpperCase() + payload.userName.substring(1)
		}(sent at ${payload.timestamp})`
		messages.appendChild(item)
		messages.appendChild(sender)
		window.scrollTo(0, document.body.scrollHeight)
	})

	return (
		<div>
			<div class="header" id="myHeader">
				<h2 id="topic"></h2>
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
