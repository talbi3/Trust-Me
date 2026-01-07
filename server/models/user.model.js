import mongoose from "mongoose";
import { CONNECTOR_IDS, ConnectorSchema }  from "./connector.schema.js";  

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    profilePictureUrl: { type: String, default: "" },
    dateOfBirth:  {
        type: String},

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
  { 
    timestamps: true 
  }

);

export default mongoose.model("User", userSchema);