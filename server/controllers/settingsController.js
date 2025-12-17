import Settings from "../data/settings.js";
import { FEATURE_KEYS, buildDefaultFeaturesObject } from "../data/settings.js";

/** Ensure the document has all known features. Fill missing with false. */
function ensureAllFeaturesOnDoc(settingsDoc) {
  if (!settingsDoc.features) settingsDoc.features = new Map();

  let changed = false;

  for (const key of FEATURE_KEYS) {
    if (!settingsDoc.features.has(key)) {
      settingsDoc.features.set(key, false);
      changed = true;
    }
  }

  return changed;
}

/** Convert Map to plain object for clean JSON response */
function mapToObject(map) {
  if (!map) return {};
  if (map instanceof Map) return Object.fromEntries(map.entries());
  return map; // in case it's already a plain object
}

// GET /settings/:googleId  -> view settings
export const getSettingsByGoogleId = async (req, res) => {
  try {
    const { googleId } = req.params;

    // Find settings or create defaults if missing
    let settings = await Settings.findOne({ userGoogleId: googleId });
    if (!settings) {
      settings = await Settings.create({
        userGoogleId: googleId,
        features: buildDefaultFeaturesObject(),
      });
    }

    // Ensure features are complete (not empty)
    const changed = ensureAllFeaturesOnDoc(settings);
    if (changed) await settings.save();

    return res.status(200).json({
      userGoogleId: settings.userGoogleId,
      features: mapToObject(settings.features),
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// PATCH /settings/:googleId -> update one/many feature flags
export const updateSettingsByGoogleId = async (req, res) => {
  try {
    const { googleId } = req.params;
    const { features } = req.body;

    if (!features || typeof features !== "object") {
      return res.status(400).json({ error: "features object is required." });
    }

    // Validate keys + boolean values
    for (const [key, val] of Object.entries(features)) {
      if (!FEATURE_KEYS.includes(key)) {
        return res.status(400).json({ error: `Unknown feature key: ${key}` });
      }
      if (typeof val !== "boolean") {
        return res.status(400).json({ error: `Feature '${key}' must be boolean.` });
      }
    }

    // Ensure settings exists
    let settings = await Settings.findOne({ userGoogleId: googleId });
    if (!settings) {
      settings = await Settings.create({
        userGoogleId: googleId,
        features: buildDefaultFeaturesObject(),
      });
    }

    // Apply updates
    for (const [key, val] of Object.entries(features)) {
      settings.features.set(key, val);
    }

    // Ensure all keys still exist (future-proof)
    const changed = ensureAllFeaturesOnDoc(settings);
    await settings.save();

    return res.status(200).json({
      userGoogleId: settings.userGoogleId,
      features: mapToObject(settings.features),
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getUserFeatureByGoogleId = async (req, res) => {
  try {
    const { googleId, featureKey } = req.params;

    // Validate feature key
    if (!FEATURE_KEYS.includes(featureKey)) {
      return res.status(400).json({
        error: `Unknown feature: ${featureKey}`,
      });
    }

    // Find settings
    let settings = await Settings.findOne({ userGoogleId: googleId });

    if (!settings) {
      return res.status(404).json({
        error: "Settings not found for this user",
      });
    }

    // Ensure feature exists (default false)
    let value = settings.features.get(featureKey);
    if (typeof value !== "boolean") {
      value = false;
    }

    return res.status(200).json({
      googleId,
      feature: featureKey,
      enabled: value,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};