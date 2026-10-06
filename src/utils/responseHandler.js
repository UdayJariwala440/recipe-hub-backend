export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

export const RESPONSE_MESSAGES = {
  AUTH: {
    SUCCESS: "Login successful.",
    FAILED: "Invalid credentials.",
    UNAUTHORIZED: "Access denied.",
    DUPLICATE_EMAIL: "An account with this email already exists.",
  },
  GLOBAL: {
    SERVER_ERROR: "Something went wrong. Please try again later.",
    NOT_FOUND: "Resource not found.",
  },
  VALIDATION: {
    NAME_MIN: "Name must be at least 2 characters",
    NAME_MAX: "Name must not exceed 100 characters",
    EMAIL_INVALID: "Invalid email address",
    PASSWORD_MIN: "Password must be at least 8 characters",
    PASSWORD_REQUIRED: "Password is required",
    PASSWORD_MAX: "Password must not exceed 128 characters",
  },
};
