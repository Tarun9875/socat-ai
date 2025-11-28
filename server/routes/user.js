import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const users = await User.find({}, "_id name");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
