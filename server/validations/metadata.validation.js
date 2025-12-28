import Joi from "joi";

/**
 * UserMetadata Schemas
 */

const INCIDENT_TYPES = [
  "bullying",
  "harassment",
  "scam",
  "inappropriate_content",
  "other",
];

const incidentSchema = Joi.object({
  type: Joi.string().valid(...INCIDENT_TYPES).required(),
  date: Joi.date().less("now").optional(),
  notes: Joi.string().max(500).allow("").optional(),
});

const upsertUserMetadataSchema = Joi.object({
  pronouns: Joi.string().max(50).allow("").optional(),
  previousIncidents: Joi.array().items(incidentSchema).optional(),
  preferences: Joi.object().unknown(true).optional(),
}).min(1);

const userIdParamSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
});

 

export {
  upsertUserMetadataSchema,
  userIdParamSchema,
  incidentSchema,
};
