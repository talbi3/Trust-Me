import { AuthenticationError,CustomError,getErrorMessage,ERROR_CODES } from '../utils/errors.js';
import Joi from "joi";

function errorHandler(error,req,res,next,) {
  if (res.headersSent) {
    next(error);
    return;
  }

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

  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.code,
      },
    });
    return;
  }

  if (error instanceof AuthenticationError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: "code" in error ? error.code : ERROR_CODES.UNAUTHORIZED,
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      message:
        getErrorMessage(error) ||
        "An error occurred. Please view logs for more details",
    },
  });
}

export default errorHandler;