// server/routes/group.js
import express from "express";
import Group from "../models/Group.js";
import Message from "../models/Message.js";

const router = express.Router();

// create group
router.post("/create", async (req, res) => {
  const { name, members } = req.body;
  const group = await Group.create({ name, members });
  res.json({ message: "Group created", group });
});

// simple list (if needed)
router.get("/all", async (req, res) => {
  const groups = await Group.find();
  res.json(groups);
});

// groups with last message
router.get("/with-last", async (req, res) => {
  const groups = await Group.find().lean();
  const withLast = await Promise.all(
    groups.map(async (g) => {
      const last = await Message.findOne({ groupId: g._id.toString(), isPrivate: false })
        .sort({ timestamp: -1 })
        .lean();
      return {
        ...g,
        lastMessage: last
          ? {
              message: last.message,
              senderName: last.senderName,
              timestamp: last.timestamp,
            }
          : null,
      };
    })
  );
  res.json(withLast);
});

export default router;
