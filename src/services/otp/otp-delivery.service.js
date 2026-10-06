import { sendEmail } from '../email/email.service.js';

export const sendOtp = async ({
  email,
  otp,
}) => {
  await sendEmail({
    to: email,
    subject: 'Your Recipe Nest verification code',
    text: `Your Recipe Nest verification code is ${otp}. This code expires in 5 minutes.`,
    html: `
      <div>
        <h2>Recipe Nest</h2>

        <p>Your verification code is:</p>

        <h1>${otp}</h1>

        <p>This code expires in 5 minutes.</p>

        <p>If you did not request this code, you can ignore this email.</p>
      </div>
    `,
  });
};