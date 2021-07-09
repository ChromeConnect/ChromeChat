
const room = window.location.pathname.split("/").pop().split("+").join(" ");
document.title = room;
let canvas = null;
let ctx = null;
let mouseDown = null;
let x = null;
let y = null;
let colorOption = null;
var socket = io();

canvas = document.getElementById("canvas");
const colorsPalette = document.getElementById("colorsPalette");

colorsPalette.addEventListener("click", function (e) {
	colorOption = e.target.id
})

// const rectangle = document.getElementById("rectangleButton")
// rectangle.addEventListener("click", function (e) {
// 	console.log("reached rectangle")
// 	ctx.beginPath()
// 	ctx.rect(200, 200, 150, 100)
// 	ctx.stroke()
// })

canvas.width = window.innerWidth
canvas.height = window.innerHeight
ctx = canvas.getContext("2d")
mouseDown = false
socket.emit("join", room)

const clear = document.getElementById("clearButton")
clear.addEventListener("click", function (e) {
	console.log("reached clear")
	ctx.clearRect(0, 0, canvas.width, canvas.height)
})

socket.on("draw", function ({ x, y, colorOption }) {
	ctx.lineTo(x, y)
	ctx.stroke()
	ctx.strokeStyle = colorOption
})
socket.on("down", function ({ x, y }) {
	ctx.moveTo(x, y)
})

window.onmousedown = (e) => {
	ctx.beginPath()
	ctx.moveTo(x, y)
	socket.emit("down", { payload: { x, y, colorOption }, room })
	mouseDown = true
	ctx.closePath()
}

window.onmouseup = (e) => {
	mouseDown = false
}

window.onmousemove = (e) => {
	x = e.clientX
	y = e.clientY

	if (mouseDown) {
		socket.emit("draw", { payload: { x, y, colorOption }, room })
		ctx.lineTo(x, y)
		ctx.stroke()
		ctx.strokeStyle = colorOption
	}
}
