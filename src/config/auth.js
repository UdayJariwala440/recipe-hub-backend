export const AUTH_CONFIG = {
  OTP: {
    EXPIRATION_MS: 5 * 60 * 1000,
    RESEND_COOLDOWN_MS: 60 * 1000,
  },

  REFRESH_TOKEN: {
    EXPIRATION_MS: 30 * 24 * 60 * 60 * 1000,
  },
};