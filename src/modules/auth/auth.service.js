import User from "../users/user.model.js";
import {
  RESPONSE_MESSAGES,
  STATUS_CODES,
} from "../../utils/responseHandler.js";
import { generateOtp, hashOtp, verifyOtp } from "../../utils/otp.js";
import OtpChallenge from "./otp.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../../utils/jwt.js";
import RefreshSession from "./refreshSession.model.js";
import { sendOtp } from "../../services/otp/otp-delivery.service.js";
import { AUTH_CONFIG } from "../../config/auth.js";

export const verifyRegistrationOtp = async ({ challengeId, otp }) => {
  const challenge = await OtpChallenge.findOne({
    _id: challengeId,
    purpose: "registration",
  }).select("+otpHash");

  if (!challenge) {
    const error = new Error(
      RESPONSE_MESSAGES.AUTH.INVALID_OR_EXPIRED_VERIFICATION_CODE,
    );

    error.statusCode = STATUS_CODES.UNAUTHORIZED;

    throw error;
  }

  if (challenge.usedAt) {
    const error = new Error(
      RESPONSE_MESSAGES.AUTH.VERIFICATION_CODE_ALREADY_USED,
    );

    error.statusCode = STATUS_CODES.UNAUTHORIZED;

    throw error;
  }

  if (challenge.expiresAt <= new Date()) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.VERIFICATION_CODE_EXPIRED);

    error.statusCode = STATUS_CODES.UNAUTHORIZED;

    throw error;
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    const error = new Error(
      RESPONSE_MESSAGES.AUTH.TOO_MANY_VERIFICATION_ATTEMPTS,
    );

    error.statusCode = STATUS_CODES.TOO_MANY_REQUESTS;

    throw error;
  }

  challenge.attempts += 1;

  await challenge.save();

  const validOtp = await verifyOtp(otp, challenge.otpHash);

  if (!validOtp) {
    const error = new Error(
      RESPONSE_MESSAGES.AUTH.INVALID_OR_EXPIRED_VERIFICATION_CODE,
    );

    error.statusCode = STATUS_CODES.UNAUTHORIZED;

    throw error;
  }

  challenge.usedAt = new Date();

  await challenge.save();

  const user = await User.findOne({
    email: challenge.email,
  });

  if (!user) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.VERIFICATION_FAILED);

    error.statusCode = STATUS_CODES.UNAUTHORIZED;

    throw error;
  }

  user.isEmailVerified = true;

  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
};
export const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.DUPLICATE_EMAIL);
    error.statusCode = STATUS_CODES.CONFLICT;
    throw error;
  }

  const user = await User.create({ name, email });

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + AUTH_CONFIG.OTP.EXPIRATION_MS);

  const challenge = await OtpChallenge.create({
    email,
    purpose: "registration",
    otpHash,
    expiresAt,
  });

  await sendOtp({ email, otp });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    challengeId: challenge._id,
  };
};

export const requestLoginOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    return {};
  }

  const otp = generateOtp();

  const otpHash = await hashOtp(otp);

  const expiresAt = new Date(Date.now() + AUTH_CONFIG.OTP.EXPIRATION_MS);

  await OtpChallenge.updateMany(
    {
      email,
      purpose: "login",
      usedAt: null,
    },
    {
      $set: {
        usedAt: new Date(),
      },
    },
  );

  const challenge = await OtpChallenge.create({
    email,
    purpose: "login",
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

export const verifyLoginOtp = async ({ challengeId, otp }) => {
  const challenge = await OtpChallenge.findOne({
    _id: challengeId,
    purpose: "login",
  }).select("+otpHash");

  if (!challenge) {
    const error = new Error(
      RESPONSE_MESSAGES.AUTH.INVALID_OR_EXPIRED_VERIFICATION_CODE,
    );

    error.statusCode = STATUS_CODES.UNAUTHORIZED;

    throw error;
  }

  if (challenge.usedAt) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.VERIFICATION_CODE_ALREADY_USED);

    error.statusCode = STATUS_CODES.UNAUTHORIZED;

    throw error;
  }

  if (challenge.expiresAt <= new Date()) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.VERIFICATION_CODE_EXPIRED);

    error.statusCode = STATUS_CODES.UNAUTHORIZED;

    throw error;
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.TOO_MANY_VERIFICATION_ATTEMPTS);

    error.statusCode = STATUS_CODES.TOO_MANY_REQUESTS;

    throw error;
  }

  challenge.attempts += 1;

  await challenge.save();

  const validOtp = await verifyOtp(otp, challenge.otpHash);

  if (!validOtp) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.INVALID_OR_EXPIRED_VERIFICATION_CODE);

    error.statusCode = STATUS_CODES.UNAUTHORIZED;

    throw error;
  }

  challenge.usedAt = new Date();

  await challenge.save();

  const user = await User.findOne({
    email: challenge.email,
  });

  if (!user || !user.isActive) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.INVALID_OR_EXPIRED_VERIFICATION_CODE);

    error.statusCode = STATUS_CODES.UNAUTHORIZED;

    throw error;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  const refreshTokenHash = hashRefreshToken(refreshToken);

  const refreshExpiresAt = new Date(Date.now() + AUTH_CONFIG.REFRESH_TOKEN.EXPIRATION_MS);

  await RefreshSession.create({
    userId: user._id,
    tokenHash: refreshTokenHash,
    expiresAt: refreshExpiresAt,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken) => {
  const tokenHash = hashRefreshToken(refreshToken);

  const session = await RefreshSession.findOne({
    tokenHash,
    revokedAt: null,
  }).select("+tokenHash");

  if (!session) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.INVALID_REFRESH_TOKEN);
    error.statusCode = STATUS_CODES.UNAUTHORIZED;
    throw error;
  }

  if (session.expiresAt <= new Date()) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.INVALID_REFRESH_TOKEN);
    error.statusCode = STATUS_CODES.UNAUTHORIZED;
    throw error;
  }

  const user = await User.findOne({
    _id: session.userId,
    isActive: true,
  });

  if (!user) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.INVALID_REFRESH_TOKEN);
    error.statusCode = STATUS_CODES.UNAUTHORIZED;
    throw error;
  }

  session.revokedAt = new Date();
  await session.save();

  const newAccessToken = generateAccessToken(user);

  const newRefreshToken = generateRefreshToken();

  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

  const refreshExpiresAt = new Date(Date.now() + AUTH_CONFIG.REFRESH_TOKEN.EXPIRATION_MS);

  await RefreshSession.create({
    userId: user._id,
    tokenHash: newRefreshTokenHash,
    expiresAt: refreshExpiresAt,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutUser = async (refreshToken) => {
  const tokenHash = hashRefreshToken(refreshToken);

  await RefreshSession.updateOne(
    {
      tokenHash,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
};

export const verifyOtpChallenge = async ({ challengeId, otp }) => {
  const challenge = await OtpChallenge.findOne({
    _id: challengeId,
  }).select("+otpHash");

  if (!challenge) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.INVALID_OR_EXPIRED_VERIFICATION_CODE);
    error.statusCode = STATUS_CODES.UNAUTHORIZED;
    throw error;
  }

  if (challenge.usedAt) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.VERIFICATION_CODE_ALREADY_USED);
    error.statusCode = STATUS_CODES.UNAUTHORIZED;
    throw error;
  }

  if (challenge.expiresAt <= new Date()) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.VERIFICATION_CODE_EXPIRED);
    error.statusCode = STATUS_CODES.UNAUTHORIZED;
    throw error;
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.TOO_MANY_VERIFICATION_ATTEMPTS);
    error.statusCode = STATUS_CODES.UNAUTHORIZED;
    throw error;
  }

  challenge.attempts += 1;
  await challenge.save();

  const validOtp = await verifyOtp(otp, challenge.otpHash);

  if (!validOtp) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.INVALID_OR_EXPIRED_VERIFICATION_CODE);
    error.statusCode = STATUS_CODES.UNAUTHORIZED;
    throw error;
  }

  const user = await User.findOne({
    email: challenge.email,
    isActive: true,
  });

  if (!user) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.INVALID_OR_EXPIRED_VERIFICATION_CODE);
    error.statusCode = STATUS_CODES.UNAUTHORIZED;
    throw error;
  }

  challenge.usedAt = new Date();
  await challenge.save();

  if (!user.isEmailVerified) {
    user.isEmailVerified = true;
    await user.save();
  }

  const accessToken = generateAccessToken(user);

  const refreshToken = generateRefreshToken();

  const refreshTokenHash = hashRefreshToken(refreshToken);

  const refreshExpiresAt = new Date(Date.now() + AUTH_CONFIG.REFRESH_TOKEN.EXPIRATION_MS);

  await RefreshSession.create({
    userId: user._id,
    tokenHash: refreshTokenHash,
    expiresAt: refreshExpiresAt,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    accessToken,
    refreshToken,
  };
};

export const resendOtpChallenge = async (challengeId) => {
  const challenge = await OtpChallenge.findOne({
    _id: challengeId,
    usedAt: null,
  }).select("+otpHash");

  if (!challenge) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.INVALID_VERIFICATION_REQUEST);
    error.statusCode = STATUS_CODES.BAD_REQUEST;
    throw error;
  }

  const cooldownMs = AUTH_CONFIG.OTP.RESEND_COOLDOWN_MS;

  if (
    challenge.createdAt &&
    Date.now() - challenge.createdAt.getTime() < cooldownMs
  ) {
    const error = new Error(
    RESPONSE_MESSAGES.AUTH.VERIFICATION_CODE_REQUEST_TOO_SOON,
    );

    error.statusCode = STATUS_CODES.TOO_MANY_REQUESTS;

    throw error;
  }

  const user = await User.findOne({
    email: challenge.email,
    isActive: true,
  });

  if (!user) {
    const error = new Error(RESPONSE_MESSAGES.AUTH.INVALID_VERIFICATION_REQUEST);
    error.statusCode = TOO_MANY_REQUESTS.BAD_REQUEST;
    throw error;
  }

  const otp = generateOtp();

  const otpHash = await hashOtp(otp);

  const expiresAt = new Date(Date.now() +AUTH_CONFIG.OTP.EXPIRATION_MS);

  challenge.usedAt = new Date();

  await challenge.save();

  const newChallenge = await OtpChallenge.create({
    email: challenge.email,
    otpHash,
    expiresAt,
  });

  await sendOtp({
    email: challenge.email,
    otp,
  });

  return {
    challengeId: newChallenge._id,
  };
};
