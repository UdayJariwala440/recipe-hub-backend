import { RESPONSE_MESSAGES, STATUS_CODES } from "../../utils/responseHandler";

export const getCurrentUser = async (req, res) => {
  return res.status(STATUS_CODES.OK).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};


export const getAdminData = async (req, res) => {
  return res.status(STATUS_CODES.OK).json({
    success: true,
    message: RESPONSE_MESSAGES.AUTH.ADMIN_ACCESS_GRANTED,
    data: {
      user: req.user,
    },
  });
};