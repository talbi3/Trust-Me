import Joi from "joi";

/**
 * UserMetadata Schemas
 */

const upsertUserMetadataSchema = Joi.object({
  nickName: Joi.string().max(50).allow("").optional(),
  dateOfBirth: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .allow("")
    .optional()
    .messages({
      "string.pattern.base": "Date of Birth must be in the format YYYY-MM-DD.",
    }),
  pronouns: Joi.string().max(50).allow("").optional(),
}).min(1);

const userIdParamSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
});

 

export {
  upsertUserMetadataSchema,
  userIdParamSchema,
};
