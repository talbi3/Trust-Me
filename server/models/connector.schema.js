import mongoose from "mongoose";

const CONNECTOR_IDS = Object.freeze(["whatsapp", "telegram", "youtube", "discord"]);

const ConnectorSchema = new mongoose.Schema(
  {
    id: { type: String, enum: CONNECTOR_IDS, required: true },
    connected: { type: Boolean, default: false }
  },
  {
    _id: false,
  }
);

export { CONNECTOR_IDS, ConnectorSchema };