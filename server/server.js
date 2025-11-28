// server/server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import groupRoutes from "./routes/group.js";
import messageRoutes from "./routes/messages.js";
import Message from "./models/Message.js";
import User from "./models/User.js";
import auth from "./middleware/auth.js";
import user from "./routes/user.js";

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/chatapp")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

app.use("/auth", authRoutes);
app.use("/group", groupRoutes);
app.use("/messages", messageRoutes);
// additional routes...
app.use("/groups", auth, groupRoutes); // protect group routes
app.use("/messages", auth, messageRoutes); // protect message routes
app.use("/user", auth, user); // protect user routes <----------------------------new addddadadad for new user show on dashboard

const server = createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// userId -> { name, sockets: Set<socketId> }
const onlineUsers = new Map();

const broadcastOnlineUsers = () => {
  const list = Array.from(onlineUsers.entries()).map(([userId, info]) => ({
    userId,
    name: info.name,
  }));
  io.emit("onlineUsers", list);
};

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("registerUser", ({ userId, name }) => {
    socket.userId = userId;
    socket.userName = name;

    const existing = onlineUsers.get(userId) || { name, sockets: new Set() };
    existing.sockets.add(socket.id);
    existing.name = name;
    onlineUsers.set(userId, existing);

    broadcastOnlineUsers();
  });

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`📌 Joined group: ${groupId}`);
  });

  socket.on("sendMessage", async (data) => {
    const {
      groupId,
      senderId,
      senderName,
      message,
      isPrivate,
      toUserId,
    } = data;

    const saved = await Message.create({
      groupId,
      senderId,
      senderName,
      message,
      isPrivate: !!isPrivate,
      toUserId: toUserId || null,
      timestamp: Date.now(),
    });

    const payload = {
      ...data,
      timestamp: saved.timestamp,
    };

    if (isPrivate && toUserId) {
      // send only to sender + target user
      const target = onlineUsers.get(toUserId);
      if (target) {
        for (const sid of target.sockets) {
          io.to(sid).emit("receiveMessage", payload);
        }
      }
      // sender's own sockets
      const self = onlineUsers.get(senderId);
      if (self) {
        for (const sid of self.sockets) {
          io.to(sid).emit("receiveMessage", payload);
        }
      }
    } else {
      // normal group message
      io.to(groupId).emit("receiveMessage", payload);
    }

    console.log(`💬 Message saved & sent to group ${groupId}`);
  });

  socket.on("typing", (data) => {
    const { groupId, senderId, senderName, isPrivate, toUserId } = data;
    if (isPrivate && toUserId) {
      const target = onlineUsers.get(toUserId);
      if (target) {
        for (const sid of target.sockets) {
          io.to(sid).emit("typing", { groupId, senderId, senderName, isPrivate: true });
        }
      }
    } else {
      socket.to(groupId).emit("typing", {
        groupId,
        senderId,
        senderName,
        isPrivate: false,
      });
    }
  });

  socket.on("stopTyping", (data) => {
    const { groupId, senderId, senderName, isPrivate, toUserId } = data;
    if (isPrivate && toUserId) {
      const target = onlineUsers.get(toUserId);
      if (target) {
        for (const sid of target.sockets) {
          io.to(sid).emit("stopTyping", { groupId, senderId, senderName, isPrivate: true });
        }
      }
    } else {
      socket.to(groupId).emit("stopTyping", {
        groupId,
        senderId,
        senderName,
        isPrivate: false,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
    const { userId } = socket;
    if (userId && onlineUsers.has(userId)) {
      const info = onlineUsers.get(userId);
      info.sockets.delete(socket.id);
      if (info.sockets.size === 0) {
        onlineUsers.delete(userId);
      } else {
        onlineUsers.set(userId, info);
      }
      broadcastOnlineUsers();
    }
  });
});

server.listen(5000, () =>
  console.log("🚀 Server running at http://localhost:5000")
);
