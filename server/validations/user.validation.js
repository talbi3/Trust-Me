import Joi from "joi";
import { CONNECTOR_IDS } from "../data/connector.schema.js";

/**
 * User Fields
 */

const emailField = Joi.string()
  .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
  .required();

const profileFields = {
  name: Joi.string().min(3).max(30).messages({
    "string.base": "Name must be a string.",
    "string.empty": "Name cannot be empty.",
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name must not exceed 30 characters.",
  }),
  profilePictureUrl: Joi.string().uri().allow("").optional(),
  dateOfBirth: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .messages({
      "string.pattern.base": "Date of Birth must be in the format YYYY-MM-DD.",
    }),
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

const baseUserFields = {
  email: emailField,
  ...profileFields,
};

/**
 * User Schemas
 */

const createUserSchema = Joi.object({
  ...baseUserFields,
  settings: Joi.object(settingsFields),
}).options({ stripUnknown: true });

const loginSchema = Joi.object({
  email: emailField.messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required for login",
  }),
});

const updateUserProfileSchema = Joi.object({
  email: emailField.optional(),
  ...profileFields,
}).min(1);

const updateUserSettingsSchema = Joi.object({
  email: emailField.optional(),
  ...settingsFields,
}).min(1);


export {
  createUserSchema,
  loginSchema,
  updateUserProfileSchema,
  updateUserSettingsSchema,
};
