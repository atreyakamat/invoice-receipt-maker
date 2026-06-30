import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  static async sendVerificationEmail(to: string, token: string) {
    const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Invoice Assistant" <no-reply@invoiceassistant.com>',
      to,
      subject: 'Verify your email address',
      text: `Please verify your email by clicking the following link: ${url}`,
      html: `<p>Please verify your email by clicking the following link:</p><a href="${url}">${url}</a>`,
    };

    if (!process.env.SMTP_USER) {
      console.log('--- MOCK EMAIL ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Body: ${url}`);
      console.log('------------------');
      return;
    }

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  }
}
