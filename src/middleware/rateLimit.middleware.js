import rateLimit from 'express-rate-limit';
import { RESPONSE_MESSAGES } from '../utils/responseHandler';
import { RATE_LIMIT_CONFIG } from '../config/rateLimit.js';

export const authRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.AUTH.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.AUTH.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: RESPONSE_MESSAGES.VALIDATION.TOO_MANY_REQUESTS,
  },
});

export const otpRequestRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.OTP_REQUEST.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.OTP_REQUEST.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: RESPONSE_MESSAGES.VALIDATION.TOO_MANY_OTP_REQUESTS,
  },
});

export const otpVerifyRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.OTP_VERIFY.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.OTP_VERIFY.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: RESPONSE_MESSAGES.VALIDATION.TOO_MANY_VERIFICATION_ATTEMPTS,
  },
});