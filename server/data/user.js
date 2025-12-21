import mongoose from "mongoose";
import { CONNECTOR_IDS, ConnectorSchema }  from "./connector.js";  

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    profilePictureUrl: { type: String, default: "" },
    dateOfBirth: { type: String, default: "" },

    settings: {
      notifications: {
        email: { type: Boolean, default: false },
        push: { type: Boolean, default: false },
      },
      connectors: {
        type: [ConnectorSchema],
        default: () => CONNECTOR_IDS.map((id) => ({ id, connected: false })),
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);