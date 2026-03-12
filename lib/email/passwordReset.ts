/**
 * passwordReset.ts
 *
 * SMTP email sender for password reset links.
 */

import nodemailer from "nodemailer"

interface SendPasswordResetEmailParams {
  email: string
  name: string
  resetUrl: string
}

function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.SMTP_FROM,
  )
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

function buildMessage(params: SendPasswordResetEmailParams) {
  return {
    from: process.env.SMTP_FROM,
    to: params.email,
    subject: "Cofactor Admin password reset",
    text: `Hi ${params.name},\n\nUse this link to reset your password:\n${params.resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
  }
}

/**
 * Sends password reset link email when SMTP settings are configured.
 *
 * @param params - Password reset email payload
 * @returns True when email was sent, false when SMTP is not configured
 */
export async function sendPasswordResetEmail(params: SendPasswordResetEmailParams): Promise<boolean> {
  if (!isSmtpConfigured()) return false
  const transporter = createTransporter()
  await transporter.sendMail(buildMessage(params))
  return true
}
