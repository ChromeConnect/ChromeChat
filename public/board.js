const room = window.location.pathname.split("/").pop().split("-").join(" ");

//get url and change tab title to url endpoint
let socketioRoom = null;
if (window.location.pathname.includes("Sequelize"))
  socketioRoom = "Sequelize: " + room;
if (window.location.pathname.includes("Express"))
  socketioRoom = "Express: " + room;
if (window.location.pathname.includes("React")) socketioRoom = "React: " + room;
console.log(room);
document.title = room;
let canvas = null;
let canvasTwo = null;
let ctx = null;
let mouseDown = null;
let x = null;
let y = null;
let colorOption = null;
var socket = io();
let circularCursorElement = document.getElementById("circularcursor");
var inMemCanvas = document.createElement("canvas");
var inMemCtx = inMemCanvas.getContext("2d");
canvas = document.getElementById("canvas");
canvasTwo = document.getElementById("canvasTwo");
const colorsPalette = document.getElementById("colorsPalette");
//options for rectangle, draw, text, etc.
let options = null;

//Color Selection
colorsPalette.addEventListener("click", function (e) {
  colorOption = e.target.id;
  circularCursorElement.style.visibility = "hidden";
});

//Erase with mouse
const eraserButton = document.getElementById("eraserButton");
eraserButton.addEventListener("click", function (e) {
  e.preventDefault();
  //change cursor and color and options
  colorOption = "white";
  options = "draw";
  circularCursorElement.style.visibility = "visible";
});

//Erase entire white board
const clear = document.getElementById("clearButton");
clear.addEventListener("click", function (e) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

//Change option to text
let textButton = document.getElementById("textButton");
textButton.addEventListener("click", function (e) {
  e.preventDefault();
  options = "text";
  colorOption = "black";
  circularCursorElement.style.visibility = "hidden";
});

//Change option to draw
let drawButton = document.getElementById("drawButton");
drawButton.addEventListener("click", function (e) {
  e.preventDefault();
  options = "draw";
  colorOption = "black";
  circularCursorElement.style.visibility = "hidden";
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
        socketioRoom,
      });
      firstClickX += ctx.measureText(e.key).width;
    }
  }
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.onresize = function () {
  inMemCanvas.width = canvas.width;
  inMemCanvas.height = canvas.height;
  inMemCtx.drawImage(canvas, 0, 0);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.drawImage(inMemCanvas, 0, 0);
};

ctx = canvas.getContext("2d");
ctxTwo = canvas.getContext("2d");

mouseDown = false;
socket.emit("join", socketioRoom);

socket.on("draw", function ({ x, y, colorOption }) {
  if (colorOption === "white") ctx.lineWidth = 20.0;
  else ctx.lineWidth = 3.0;
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
    socket.emit("down", { payload: { x, y, colorOption }, socketioRoom });
    mouseDown = true;
  }
};

window.onmouseup = (e) => {
  if (options === "draw") {
    mouseDown = false;
    //testing
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.closePath();
    //testing
  }
};

window.onmousemove = (e) => {
  circularCursorElement.style.left = e.clientX - 20 + "px";
  circularCursorElement.style.top = e.clientY - 20 + "px";
  if (options === "draw") {
    x = e.clientX;
    y = e.clientY;
    if (mouseDown) {
      socket.emit("draw", {
        payload: { x, y, colorOption },
        socketioRoom,
      });
    }
  }
};
