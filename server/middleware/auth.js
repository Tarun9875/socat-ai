import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, "SECRET_KEY");
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
}
