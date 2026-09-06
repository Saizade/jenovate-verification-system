const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, code) => {
  console.log(`\n==================================================`);
  console.log(`🔑 ADMIN PASSWORD RESET VERIFICATION CODE FOR ${email}: [ ${code} ]`);
  console.log(`==================================================\n`);

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Jenovate Verification System" <no-reply@jenovate.com>',
        to: email,
        subject: '🔒 Admin Password Reset Verification Code - Jenovate System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 12px; background-color: #f8fafc;">
            <div style="background-color: #0284c7; padding: 16px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Jenovate Verification System</h2>
            </div>
            <div style="padding: 24px; background-color: #ffffff; border-radius: 0 0 8px 8px;">
              <h3 style="color: #0f172a; margin-top: 0;">Password Reset Verification Code</h3>
              <p style="color: #475569; font-size: 14px;">You have requested to reset your Admin account password. Use the verification code below to complete the reset process:</p>
              <div style="text-align: center; margin: 28px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0284c7; background-color: #e0f2fe; padding: 12px 24px; border-radius: 8px; border: 1px dashed #0284c7; display: inline-block;">${code}</span>
              </div>
              <p style="color: #64748b; font-size: 12px;">This code will expire in 15 minutes. If you did not request a password reset, please ignore this email or contact support immediately.</p>
            </div>
          </div>
        `
      });

      console.log(`Email successfully sent to ${email}`);
    } catch (err) {
      console.error('Nodemailer SMTP error:', err.message);
    }
  }
};

module.exports = {
  sendVerificationEmail
};
