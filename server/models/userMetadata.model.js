import mongoose from "mongoose";

const userMetadataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    nickName: { type: String, default: "" },

    dateOfBirth: { type: String, default: "" },

    pronouns: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("UserMetadata", userMetadataSchema);