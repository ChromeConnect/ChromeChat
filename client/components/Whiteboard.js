import React, { useEffect } from "react"
import history from "../history"

const Whiteboard = () => {
	var socket = io()
	let room = null
	let canvas = null
	let ctx = null
	let mouseDown = null
	useEffect(() => {
		const { pathname } = history.location
		room = pathname.split("-").join(" ")
		canvas = document.getElementById("canvas")
		canvas.width = window.innerWidth
		canvas.height = window.innerHeight
		ctx = canvas.getContext("2d")
		mouseDown = false
		socket.emit("join", room)
	}, [])

	let x
	let y

	socket.on("draw", function ({ x, y }) {
		ctx.lineTo(x, y)
		ctx.stroke()
	})
	socket.on("down", function ({ x, y }) {
		ctx.moveTo(x, y)
	})

	window.onmousedown = (e) => {
		ctx.moveTo(x, y)
		socket.emit("down", { payload: { x, y }, room })
		mouseDown = true
	}

	window.onmouseup = (e) => {
		mouseDown = false
	}

	window.onmousemove = (e) => {
		x = e.clientX
		y = e.clientY

		if (mouseDown) {
			socket.emit("draw", { payload: { x, y }, room })
			ctx.lineTo(x, y)
			ctx.stroke()
		}
	}

	return <canvas id="canvas"></canvas>
}

export default Whiteboard
