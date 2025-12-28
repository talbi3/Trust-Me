import Joi from "joi";

/**
 * Chat Schemas
 * POST /api/chat
 * Body: { message, helpOption, userId }
 */

const HELP_OPTIONS = ["block", "mute", "evidence"];

const postChatSchema = Joi.object({
  message: Joi.string().trim().min(1).max(1000).required().messages({
    "string.base": "message must be a string",
    "string.empty": "message is required",
    "string.min": "message is required",
    "string.max": "message is too long (max 1000 characters)",
    "any.required": "message is required",
  }),

  helpOption: Joi.string().valid(...HELP_OPTIONS).required().messages({
    "any.only": "helpOption must be one of: block, mute, evidence",
    "any.required": "helpOption is required",
  }),

  userId: Joi.string().hex().length(24).required().messages({
    "string.hex": "userId must be a valid Mongo ObjectId",
    "string.length": "userId must be a valid Mongo ObjectId",
    "any.required": "userId is required",
  }),
    hasImage: Joi.boolean().default(false),
  isVoiceMessage: Joi.boolean().default(false)
}).options({ stripUnknown: true });


const dayParamSchema = Joi.object({
  day: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "Date must be in YYYY-MM-DD format",
      "any.required": "Day parameter is required"
    }),
});

const chatHistoryQuerySchema = Joi.object({
  userId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Invalid userId format",
    "string.length": "Invalid userId length",
    "any.required": "userId query parameter is required"
  }),
});


export {
  postChatSchema,
  dayParamSchema,
  chatHistoryQuerySchema,
  

};
