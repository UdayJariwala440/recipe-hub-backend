import { verifyAccessToken } from '../utils/jwt.js';
import User from '../modules/users/user.model.js';
import { RESPONSE_MESSAGES, STATUS_CODES } from '../utils/responseHandler.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.VALIDATION.AUTHENTICATION_REQUIRED,
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.sub).select(
      '_id name email role isActive isEmailVerified'
    );

    if (!user || !user.isActive) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message:RESPONSE_MESSAGES.VALIDATION.INVALID_AUTHENTICATION,
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: RESPONSE_MESSAGES.VALIDATION.INVALID_OR_EXPIRED_TOKEN,
    });
  }
};


export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.VALIDATION.AUTHENTICATION_REQUIRED,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: RESPONSE_MESSAGES.AUTH.UNAUTHORIZED,
      });
    }

    next();
  };
};