const ERROR_CODES = {
  NOT_FOUND: 'ERR_NF',
  VALIDATION: 'ERR_VALID',
  AUTH: 'ERR_AUTH',
};

function createValidationError(message, code = ERROR_CODES.VALIDATION, errors = []) {
  return { error: { message, code, errors } };
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  if (typeof error === "string") {
    return error;
  }
  return "An error occurred";
}


class CustomError extends Error {

  constructor({ message, statusCode, code }) {
    super(message); 
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

class AuthenticationError extends CustomError {
    constructor(message = "Unauthenticated access.") {
        super({
            message,
            statusCode: 401,
            code: ERROR_CODES.AUTH,
        });
    }
}

class EntityNotFoundError extends CustomError {
    constructor(message = "The requested entity was not found.") {
        super({
            message,
            statusCode: 404,
            code: ERROR_CODES.NOT_FOUND,
        });
    }
}



export { ERROR_CODES, createValidationError, getErrorMessage, CustomError, AuthenticationError, EntityNotFoundError };