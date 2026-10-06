import { z } from 'zod';
import { RESPONSE_MESSAGES } from '../../utils/responseHandler.js';

export const registerSchema = z.object({
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
}).strict();

export const loginRequestSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Invalid email address'),
  })
  .strict();


export const loginVerifySchema = z
  .object({
    challengeId: z
      .string()
      .min(1, 'Challenge ID is required'),

    otp: z
      .string()
      .regex(/^\d{6}$/, 'OTP must be 6 digits'),
  })
  .strict();