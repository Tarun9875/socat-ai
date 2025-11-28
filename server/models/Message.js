// server/models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  groupId: String,
  senderId: String,
  senderName: String,
  message: String,
  isPrivate: { type: Boolean, default: false },
  toUserId: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);
