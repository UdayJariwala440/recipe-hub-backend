import express from "express";
import {
  register,
  requestLogin,
  verifyOtp,
  resendOtp,
  refresh,
  logout,
} from "./auth.controller.js";
import {
  registerSchema,
  loginRequestSchema,
  otpVerifySchema,
  otpResendSchema,
  refreshTokenSchema,
  logoutSchema,
} from "./auth.validation.js";
import { validate } from "../../middleware/validation.middleware.js";
import {
  authRateLimiter,
  otpRequestRateLimiter,
  otpVerifyRateLimiter,
} from "../../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post("/register", authRateLimiter, validate(registerSchema), register);
router.post(
  "/login/request",
  otpRequestRateLimiter,
  validate(loginRequestSchema),
  requestLogin,
);
router.post(
  "/otp/verify",
  otpVerifyRateLimiter,
  validate(otpVerifySchema),
  verifyOtp,
);
router.post(
  "/otp/resend",
  otpRequestRateLimiter,
  validate(otpResendSchema),
  resendOtp,
);
router.post("/refresh", authRateLimiter, validate(refreshTokenSchema), refresh);
router.post("/logout", authRateLimiter, validate(logoutSchema), logout);

export default router;
