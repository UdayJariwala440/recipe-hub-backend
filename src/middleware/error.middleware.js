import { RESPONSE_MESSAGES, STATUS_CODES } from "../utils/responseHandler";

export const errorMiddleware = (error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === STATUS_CODES.INTERNAL_SERVER_ERROR
        ? RESPONSE_MESSAGES.VALIDATION.INTERNAL_SERVER_ERROR
        : error.message,
  });
};