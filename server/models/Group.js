import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: String,
  members: [String],
  isPrivate: { type: Boolean, default: false }
});

export default mongoose.model("Group", groupSchema);
