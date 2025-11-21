import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

class EmailService {
  constructor() {
    this.transporter = null;
    this.fromEmail = process.env.EMAIL_FROM || "noreply@ideaverse.com";
    this.fromName = process.env.EMAIL_FROM_NAME || "IdeaVerse";
    this.initializeTransporter();
  }

  initializeTransporter() {
    const provider = process.env.EMAIL_PROVIDER || "smtp";

    try {
      switch (provider.toLowerCase()) {
        case "sendgrid":
          this.transporter = nodemailer.createTransport({
            service: "SendGrid",
            auth: {
              user: "apikey",
              pass: process.env.EMAIL_API_KEY,
            },
          });
          break;

        case "mailgun":
          this.transporter = nodemailer.createTransport({
            host: "smtp.mailgun.org",
            port: 587,
            auth: {
              user: process.env.MAILGUN_USER,
              pass: process.env.EMAIL_API_KEY,
            },
          });
          break;

        case "gmail":
          this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_API_KEY,
            },
          });
          break;

        case "smtp":
        default:
          this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
              user: process.env.SMTP_USER || process.env.EMAIL_USER,
              pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || process.env.EMAIL_API_KEY,
            },
          });
          break;
      }

      if (process.env.NODE_ENV === "development" && process.env.EMAIL_API_KEY) {
        this.transporter.verify((error) => {
          if (error) {
            logger.warn("Email transporter verification failed:", error);
          } else {
            logger.info("Email service ready");
          }
        });
      }
    } catch (error) {
      logger.error("Failed to initialize email transporter:", error);
    }
  }

  async sendEmail({ to, subject, html, text }) {
    if (!this.transporter || !process.env.EMAIL_API_KEY) {
      logger.warn("Email service not configured. Email would be sent to:", to);
      logger.warn("Subject:", subject);
      if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
        return { success: true, messageId: "mock-message-id" };
      }
      throw new Error("Email service not configured");
    }

    try {
      const info = await this.transporter.sendMail({
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""),
      html,
      });

      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error("Failed to send email:", error);
      throw error;
    }
  }

  async sendVerificationEmail(userEmail, token, userName) {
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to IdeaVerse! 🌌</h1>
            <p>Hi ${userName},</p>
            <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <div class="footer">
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: "Verify your IdeaVerse email",
      html,
    });
  }

  async sendPasswordResetEmail(userEmail, token, userName) {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
            .warning { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Password Reset Request</h1>
            <p>Hi ${userName},</p>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
            <div class="warning">
              <p><strong>Important:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>If you didn't request a password reset, please contact support immediately.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: "Reset your IdeaVerse password",
      html,
    });
  }
}

export default new EmailService();

