import { z } from "zod";
import { RESPONSE_MESSAGES } from "../../utils/responseHandler";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, RESPONSE_MESSAGES.VALIDATION.NAME_MIN)
      .max(100, RESPONSE_MESSAGES.VALIDATION.NAME_MAX),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(RESPONSE_MESSAGES.VALIDATION.EMAIL_INVALID),
  })
  .strict();
export const loginRequestSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(RESPONSE_MESSAGES.VALIDATION.EMAIL_INVALID),
  })
  .strict();
export const otpVerifySchema = z
  .object({
    challengeId: z
      .string()
      .min(1, RESPONSE_MESSAGES.VALIDATION.CHALLENGE_ID_REQUIRED),
    otp: z.string().regex(/^\d{6}$/, RESPONSE_MESSAGES.VALIDATION.OTP_INVALID),
  })
  .strict();
export const otpResendSchema = z
  .object({
    challengeId: z
      .string()
      .min(1, RESPONSE_MESSAGES.VALIDATION.CHALLENGE_ID_REQUIRED),
  })
  .strict();
export const refreshTokenSchema = z
  .object({
    refreshToken: z
      .string()
      .min(1, RESPONSE_MESSAGES.VALIDATION.REFRESH_TOKEN_REQUIRED),
  })
  .strict();
export const logoutSchema = z
  .object({
    refreshToken: z
      .string()
      .min(1, RESPONSE_MESSAGES.VALIDATION.REFRESH_TOKEN_REQUIRED),
  })
  .strict();