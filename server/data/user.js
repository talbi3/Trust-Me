import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    fullname: { type: String, required: true },
    profilePicture: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);