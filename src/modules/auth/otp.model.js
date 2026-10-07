import mongoose from 'mongoose';

const otpChallengeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    purpose: {
      type: String,
      enum: [
        'login',
        'registration',
        'email_verification',
      ],
      required: true,
    },

    otpHash: {
      type: String,
      required: true,
      select: false,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    maxAttempts: {
      type: Number,
      default: 5,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

otpChallengeSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const OtpChallenge = mongoose.model(
  'OtpChallenge',
  otpChallengeSchema
);

export default OtpChallenge;