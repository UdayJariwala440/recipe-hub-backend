import crypto from 'crypto';
import argon2 from 'argon2';

export const generateOtp = () => {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
};

export const hashOtp = async (otp) => {
  return argon2.hash(otp, {
    type: argon2.argon2id,
  });
};

export const verifyOtp = async (otp, otpHash) => {
  return argon2.verify(otpHash, otp);
};