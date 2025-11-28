// server/routes/messages.js
import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// last message for one group (used in Dashboard via /group/with-last)
router.get("/last/:groupId", async (req, res) => {
  const msg = await Message.findOne({ groupId: req.params.groupId, isPrivate: false })
    .sort({ timestamp: -1 })
    .lean();
  res.json(msg || null);
});

// full chat history for a group
router.get("/:groupId", async (req, res) => {
  const messages = await Message.find({ groupId: req.params.groupId }).sort({ timestamp: 1 });
  res.json(messages);
});

export default router;
