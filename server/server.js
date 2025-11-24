import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("joinUser", (data) => {
    socket.data.id = data.id;
    socket.data.name = data.name;
    console.log(`User Joined → ID: ${data.id}, Name: ${data.name}`);
  });

  socket.on("sendMsg", (data) => {
    io.emit("receive", data);
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected → ID: ${socket.data.id}, Name: ${socket.data.name}`);
  });
});

server.listen(5000, () => {
  console.log("Server running...");
});
