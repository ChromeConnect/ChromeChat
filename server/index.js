const path = require("path");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "..", "public/index.html"))
);

app.get("/board/:website/:topic", (req, res) =>
  res.sendFile(path.join(__dirname, "..", "public/board.html"))
);

io.on("connection", (socket) => {
  //console.log("a user connected")
  socket.on("disconnect", (data) => {
    //console.log("user disconnected");
  });
});

io.on("connection", (socket) => {
  socket.on("join", (socketioRoom) => {
    //console.log(`Socket ${socket.id} joining ${room}`);
    socket.join(socketioRoom);
    var userCount = io.sockets.adapter.rooms.get(socketioRoom).size;
    io.to(socketioRoom).emit("userCount", userCount, socketioRoom);
  });
});

io.on("connection", (socket) => {
  socket.on("disconnecting", () => {
    const socketioRoom = Array.from(socket.rooms).pop()
    var userCount = io.sockets.adapter.rooms.get(socketioRoom).size - 1;
    io.to(socketioRoom).emit("userCount", userCount, socketioRoom);
  });
});

io.on("connection", (socket) => {
  socket.on("chat message", (data) => {
    const { payload, socketioRoom } = data;
    io.to(socketioRoom).emit("chat message", payload);
  });
  socket.on("draw", (data) => {
    const { payload, socketioRoom } = data;
    io.to(socketioRoom).emit("draw", payload);
  });
  socket.on("down", (data) => {
    const { payload, socketioRoom } = data;
    io.to(socketioRoom).emit("down", payload);
  });
  socket.on("text", (data) => {
    const { payload, socketioRoom } = data;
    io.to(socketioRoom).emit("text", payload);
  });
});

app.use(express.static(path.join(__dirname, "..", "public")));

app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public/index.html"));
});

//const seed = require('../script/seed');

const init = async () => {
  try {
    /*     if(process.env.SEED === 'true'){
      await seed();
    }
    else {
      await db.sync()
    } */
    // start listening (and create a 'server' object representing our server)
    server.listen(PORT, () => console.log(`Mixing it up on port ${PORT}`));
  } catch (ex) {
    console.log(ex);
  }
};

init();
