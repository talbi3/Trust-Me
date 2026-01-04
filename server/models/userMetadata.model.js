import mongoose from "mongoose";

const IncidentSchema = new mongoose.Schema(
  {
    type: { type: String, default: "" },
    date: { type: Date, default: null },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const userMetadataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    pronouns: { type: String, default: "" },

    previousIncidents: { type: [IncidentSchema], default: [] },

    // Extra preferences beyond user.settings (optional)
    preferences: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("UserMetadata", userMetadataSchema);