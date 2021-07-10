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

//options for rectangle, draw, text, etc.
let options = null;

//Change option to text
let textButton = document.getElementById("textButton");
textButton.addEventListener("click", function (e) {
  e.preventDefault();
  options = "text";
  console.log(options);
});

//Change option to draw
let drawButton = document.getElementById("drawButton");
drawButton.addEventListener("click", function (e) {
  e.preventDefault();
  options = "draw";
  console.log(options);
});

//adding text to canvas
let firstClickX = null;
let firstClickY = null;

document.addEventListener("click", function (e) {
  firstClickX = e.clientX;
  firstClickY = e.clientY;
});
document.addEventListener("keydown", function (e) {
  e.preventDefault();
  if (options === "text") {
    if (e.code === "Backspace") {
      //do something
    } else if (e.code === "ShiftLeft") {
      //do something
    } else if (e.code === "Enter") {
      //do something
    } else {
      socket.emit("text", {
        payload: { key: e.key, firstClickX, firstClickY },
        room,
      });
      firstClickX += ctx.measureText(e.key).width;
    }
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

socket.on("text", function ({ key, firstClickX, firstClickY }) {
  ctx.font = "16px Arial";
  ctx.fillText(key, firstClickX, firstClickY);
});

window.onmousedown = (e) => {
  if (options === "draw") {
    //ctx.beginPath();
    //ctx.moveTo(x, y);
    socket.emit("down", { payload: { x, y, colorOption }, room });
    mouseDown = true;
    //ctx.closePath();
  }
};

window.onmouseup = (e) => {
  if (options === "draw") {
    mouseDown = false;
  }
};

window.onmousemove = (e) => {
  if (options === "draw") {
    x = e.clientX;
    y = e.clientY;

    if (mouseDown) {
      socket.emit("draw", { payload: { x, y, colorOption }, room });
      //ctx.lineTo(x, y);
      //ctx.stroke();
      //ctx.strokeStyle = colorOption;
    }
  }
};
