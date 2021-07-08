import React, { useEffect } from "react";

const Whiteboard = () => {
  var socket = io();
  let room = null;
  let canvas = null;
  let ctx = null;
  let mouseDown = null;
  useEffect(() => {
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
    mouseDown = false;
    room = "lobby";
    socket.emit("join", room);
  }, []);

  let x;
  let y;

  socket.on("draw", function ({ x, y }) {
    ctx.lineTo(x, y);
    ctx.stroke();
  });
  socket.on("down", function ({ x, y }) {
    ctx.moveTo(x, y);
  });

  window.onmousedown = (e) => {
    ctx.moveTo(x, y);
    socket.emit("down", { payload: { x, y }, room });
    mouseDown = true;
  };

  window.onmouseup = (e) => {
    mouseDown = false;
  };

  window.onmousemove = (e) => {
    x = e.clientX;
    y = e.clientY;

    if (mouseDown) {
      socket.emit("draw", { payload: { x, y }, room });
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  return (
    <canvas style={{ width: "100%", height: "100%" }} id="canvas"></canvas>
  );
};

export default Whiteboard;
