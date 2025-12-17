import mongoose from "mongoose";

/** Single source of truth: all feature keys */
export const FEATURE_KEYS = [
  "featureA",
  "featureB",
  "featureC",
];

/** Build default features object: all OFF */
export function buildDefaultFeaturesObject() {
  const obj = {};
  for (const key of FEATURE_KEYS) obj[key] = false;
  return obj;
}

const SettingsSchema = new mongoose.Schema(
  {
    userGoogleId: { type: String, required: true, unique: true, index: true },

    // Store feature flags as a Map<string, boolean>
    features: { type: Map, of: Boolean, default: buildDefaultFeaturesObject },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", SettingsSchema);
