import {
  registerUser,
  requestLoginOtp,
  verifyOtpChallenge,
  resendOtpChallenge,
  refreshAccessToken,
  logoutUser,
} from "./auth.service.js";

import {
  RESPONSE_MESSAGES,
  STATUS_CODES,
} from "../../utils/responseHandler.js";

export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);

    return res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: RESPONSE_MESSAGES.AUTH.REGISTRATION_SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const requestLogin = async (req, res, next) => {
  try {
    const result = await requestLoginOtp(req.body.email);

    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: RESPONSE_MESSAGES.AUTH.OTP_SENT,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const result = await verifyOtpChallenge(req.body);

    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: RESPONSE_MESSAGES.AUTH.VERIFICATION_SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const result = await resendOtpChallenge(req.body.challengeId);

    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: RESPONSE_MESSAGES.AUTH.VERIFICATION_CODE_SENT,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const result = await refreshAccessToken(req.body.refreshToken);

    return res.status(STATUS_CODES.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await logoutUser(req.body.refreshToken);

    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: RESPONSE_MESSAGES.AUTH.LOGOUT_SUCCESS,
    });
  } catch (error) {
    next(error);
  }
};
