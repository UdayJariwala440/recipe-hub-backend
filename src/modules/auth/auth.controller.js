import { STATUS_CODES } from '../../utils/responseHandler.js';
import { registerUser, requestLoginOtp, verifyLoginOtp } from './auth.service.js';
import {
  verifyRegistrationOtp,
} from './auth.service.js';


export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);

    return res.status(STATUS_CODES.CREATED).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyRegistration = async (req, res, next) => {
  try {
    const user = await verifyRegistrationOtp(req.body);

    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user,
      },
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
      message:
        'If an account exists for this email, a verification code has been sent.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyLogin = async (req, res, next) => {
  try {
    const user = await verifyLoginOtp(req.body);

    return res.status(STATUS_CODES.OK).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};