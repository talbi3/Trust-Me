import Joi from "joi";
import { CONNECTOR_IDS } from "../models/connector.schema.js";

/**
 * User Fields
 */

const profileFields = {
  name: Joi.string().min(3).max(30).messages({
    "string.base": "Name must be a string.",
    "string.empty": "Name cannot be empty.",
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name must not exceed 30 characters.",
  }),
  profilePictureUrl: Joi.string().uri().allow("").optional(),
};

const joiConnectorSchema = Joi.object({
  id: Joi.string().valid(...CONNECTOR_IDS).required(),
  connected: Joi.boolean().default(false),
});

const notificationsSchema = Joi.object({
  email: Joi.boolean().default(false),
  push: Joi.boolean().default(false),
});

const settingsFields = {
  notifications: notificationsSchema,
  connectors: Joi.array()
    .items(joiConnectorSchema)
    .default(() => CONNECTOR_IDS.map((id) => ({ id, connected: false }))),
};

/**
 * Schemas
 */

const googleLoginSchema = Joi.object({
  idToken: Joi.string().required().messages({
    "string.empty": "idToken is required",
    "any.required": "idToken is required",
  }),
}).options({ stripUnknown: true });

const updateUserProfileSchema = Joi.object({
  ...profileFields,
}).min(1).options({ stripUnknown: true });

const updateUserSettingsSchema = Joi.object({
  ...settingsFields,
}).min(1).options({ stripUnknown: true });

export {
  googleLoginSchema,
  updateUserProfileSchema,
  updateUserSettingsSchema,
};
