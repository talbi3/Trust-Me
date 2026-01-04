/**
 * Global Express error handler.
 *
 * Normalizes all errors into a consistent JSON structure:
 *
 *  - Joi validation errors   → 422 Unprocessable Entity
 *  - AuthenticationError     → 401 Unauthorized
 *  - EntityNotFoundError     → 404 Not Found
 *  - CustomError (base)      → uses error's statusCode & code
 *  - Unknown errors          → 500 Internal Server Error
 *
 * This middleware should be mounted AFTER all routes.
 */

import { AuthenticationError, CustomError, getErrorMessage, ERROR_CODES } from '../utils/errors.js';
import Joi from "joi";

function errorHandler(error,req,res,next) {
  // If headers were already sent, delegate to Express' default handler
  if (res.headersSent) {
    next(error);
    return;
  }

  // Joi validation errors
  if (Joi.isError(error)) {
    const validationError = {
      error: {
        message: "Validation error",
        code: ERROR_CODES.VALIDATION,
        errors: error.details.map((item) => ({
          message: item.message,
        })),
      },
    };
    res.status(422).json(validationError);
    return;
  }

  // Authentication / authorization errors
  if (error instanceof AuthenticationError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: "code" in error ? error.code : ERROR_CODES.AUTH,
      },
    });
    return;
  }

  // Known application errors
  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.code,
      },
    });
    return;
  }

  // Fallback: unexpected server error
  res.status(500).json({
    error: {
      message:
        getErrorMessage(error) ||
        "An error occurred. Please view logs for more details",
    },
  });
}

export default errorHandler;