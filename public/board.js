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
  colorOption = e.target.id;
});

//adding text to canvas
document.addEventListener("keydown", function (e) {
  e.preventDefault();
  if (e.code === "Enter") {
    alert("send text to other clients");
  } else {
    ctx.font = "16px Arial";
    ctx.fillText(e.key, x, y);
    x += ctx.measureText(e.key).width;
  }
});

// Make our in-memory canvas
var inMemCanvas = document.createElement("canvas");
var inMemCtx = inMemCanvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.onresize = function () {
  //repaint everything
  inMemCanvas.width = canvas.width;
  inMemCanvas.height = canvas.height;
  inMemCtx.drawImage(canvas, 0, 0);
  //
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  //
  ctx.drawImage(inMemCanvas, 0, 0);
};

ctx = canvas.getContext("2d");
mouseDown = false;
socket.emit("join", room);

//Erase entire white board
const clear = document.getElementById("clearButton");
clear.addEventListener("click", function (e) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on("draw", function ({ x, y, colorOption }) {
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.strokeStyle = colorOption;
});

socket.on("down", function ({ x, y }) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.closePath();
});

window.onmousedown = (e) => {
  ctx.beginPath();
  ctx.moveTo(x, y);
  socket.emit("down", { payload: { x, y, colorOption }, room });
  mouseDown = true;
  ctx.closePath();
};

window.onmouseup = (e) => {
  mouseDown = false;
};

window.onmousemove = (e) => {
  x = e.clientX;
  y = e.clientY;

  if (mouseDown) {
    socket.emit("draw", { payload: { x, y, colorOption }, room });
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.strokeStyle = colorOption;
  }
};
