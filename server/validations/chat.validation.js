import Joi from "joi";

/**
 * Chat Schemas
 * POST /api/chat
 * Body: { message, helpOption, hasImage?, isVoiceMessage? }
 */

const HELP_OPTIONS = [
  "bullying",
  "harassment",
  "scam",
  "inappropriate_content",
  "other",
];

const postChatSchema = Joi.object({
  message: Joi.string().trim().min(1).max(1000).required().messages({
    "string.base": "message must be a string",
    "string.empty": "message is required",
    "string.min": "message is required",
    "string.max": "message is too long (max 1000 characters)",
    "any.required": "message is required",
  }),

  helpOption: Joi.string()
    .trim()
    .lowercase() // ✅ "Bullying" -> "bullying"
    .valid(...HELP_OPTIONS)
    .required()
    .messages({
      "any.only": `helpOption must be one of: ${HELP_OPTIONS.join(", ")}`,
      "any.required": "helpOption is required",
    }),

  hasImage: Joi.boolean().default(false),
  isVoiceMessage: Joi.boolean().default(false),
}).options({ stripUnknown: true });

/**
 * GET /api/chat/history/:day
 */
const dayParamSchema = Joi.object({
  day: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "Date must be in YYYY-MM-DD format",
      "any.required": "Day parameter is required",
    }),
});

const sendMessageSchema = Joi.object({
  message: Joi.string().trim().min(1).required().messages({
    "string.empty": "Message cannot be empty",
  }),
}).options({ stripUnknown: true });


export { postChatSchema, dayParamSchema, sendMessageSchema };
