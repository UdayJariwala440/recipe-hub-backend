import User from "../users/user.model.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import {
  RESPONSE_MESSAGES,
  STATUS_CODES,
} from "../../utils/responseHandler.js";
import {   generateOtp,
  hashOtp,
  verifyOtp, } from "../../utils/otp.js";
import OtpChallenge from './otp.model.js';
import {
  generateOtp,
  hashOtp,
  verifyOtp,
} from '../../utils/otp.js';

import { sendOtp } from '../../services/otp/otp-delivery.service.js';


export const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.DUPLICATE_EMAIL);
    error.statusCode = STATUS_CODES.CONFLICT;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
};

export const requestLoginOtp = async (email) => {
  const user = await User.findOne({ email });

  /*
   * Do not reveal whether the account exists.
   */
  if (!user || !user.isActive) {
    return {};
  }

  const otp = generateOtp();

  const otpHash = await hashOtp(otp);

  const expiresAt = new Date(
    Date.now() + 5 * 60 * 1000
  );

  /*
   * Invalidate previous unused login OTPs.
   */
  await OtpChallenge.updateMany(
    {
      email,
      purpose: 'login',
      usedAt: null,
    },
    {
      $set: {
        usedAt: new Date(),
      },
    }
  );

  const challenge = await OtpChallenge.create({
    email,
    purpose: 'login',
    otpHash,
    expiresAt,
  });

  await sendOtp({
    email,
    otp,
  });

  return {
    challengeId: challenge._id,
  };
};

export const verifyLoginOtp = async ({
  challengeId,
  otp,
}) => {
  const challenge = await OtpChallenge
    .findOne({
      _id: challengeId,
      purpose: 'login',
    })
    .select('+otpHash');

  if (!challenge) {
    const error = new Error(
      'Invalid or expired verification code'
    );

    error.statusCode = 401;

    throw error;
  }

  if (challenge.usedAt) {
    const error = new Error(
      'Verification code has already been used'
    );

    error.statusCode = 401;

    throw error;
  }

  if (challenge.expiresAt <= new Date()) {
    const error = new Error(
      'Verification code has expired'
    );

    error.statusCode = 401;

    throw error;
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    const error = new Error(
      'Too many verification attempts'
    );

    error.statusCode = 429;

    throw error;
  }

  challenge.attempts += 1;

  await challenge.save();

  const validOtp = await verifyOtp(
    otp,
    challenge.otpHash
  );

  if (!validOtp) {
    const error = new Error(
      'Invalid or expired verification code'
    );

    error.statusCode = 401;

    throw error;
  }

  challenge.usedAt = new Date();

  await challenge.save();

  const user = await User.findOne({
    email: challenge.email,
  });

  if (!user || !user.isActive) {
    const error = new Error(
      'Invalid or expired verification code'
    );

    error.statusCode = 401;

    throw error;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
};