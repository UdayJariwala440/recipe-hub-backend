export const RATE_LIMIT_CONFIG = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 2,
  },

  OTP_REQUEST: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 1,
  },

  OTP_VERIFY: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 1,
  },
};