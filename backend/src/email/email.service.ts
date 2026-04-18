import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private mailer: MailerService,
    private config: ConfigService,
  ) {}

  /** Gmail app-password flow (preferred for admin OTP). */
  private createGmailOtpTransport(): nodemailer.Transporter | null {
    const user = this.config.get<string>('EMAIL_USER')?.trim();
    const pass = this.config.get<string>('EMAIL_PASS')?.trim();
    if (!user || !pass) {
      return null;
    }
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user, pass },
    });
  }

  /** Same SMTP as @nestjs-modules/mailer when Gmail vars are not set. */
  private createSmtpOtpTransport(): nodemailer.Transporter | null {
    const host = this.config.get<string>('SMTP_HOST')?.trim();
    if (!host) {
      return null;
    }
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    if (!user || !pass) {
      return null;
    }
    return nodemailer.createTransport({
      host,
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: this.config.get<boolean>('SMTP_SECURE', false),
      auth: { user, pass },
    });
  }

  private createAdminOtpTransport(): nodemailer.Transporter | null {
    return this.createGmailOtpTransport() ?? this.createSmtpOtpTransport();
  }

  async sendAdminOtpEmail(
    to: string,
    plainOtp: string,
    expiresAt: Date,
  ): Promise<void> {
    const transport = this.createAdminOtpTransport();
    if (!transport) {
      throw new ServiceUnavailableException(
        'Outbound email is not configured. Set EMAIL_USER + EMAIL_PASS (Gmail app password), or set SMTP_HOST + SMTP_USER + SMTP_PASS in backend/.env, then restart the server.',
      );
    }

    const appName = this.config.get<string>('APP_NAME') ?? 'SWEEPSTOWN';
    const gmailUser = this.config.get<string>('EMAIL_USER')?.trim();
    const from =
      this.config.get<string>('MAIL_FROM')?.trim() ??
      (gmailUser ? `"${appName}" <${gmailUser}>` : `${appName} <noreply@localhost>`);

    const expiryLabel = expiresAt.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;background:#0f172a;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#1e293b;border-radius:12px;padding:28px 24px;border:1px solid #334155;">
          <tr><td style="font-size:18px;font-weight:600;color:#f8fafc;">${appName} admin sign-in</td></tr>
          <tr><td style="padding-top:12px;font-size:15px;line-height:1.5;color:#cbd5e1;">Use this one-time code to finish signing in. It expires in <strong>5 minutes</strong> (by ${expiryLabel}).</td></tr>
          <tr><td align="center" style="padding:24px 0;">
            <div style="display:inline-block;padding:14px 22px;border-radius:10px;background:#0b1220;border:1px solid #334155;font-size:28px;font-weight:700;letter-spacing:8px;color:#f8fafc;">${plainOtp}</div>
          </td></tr>
          <tr><td style="font-size:13px;line-height:1.5;color:#94a3b8;">If you did not request this code, ignore this email. Each sign-in requires a new code; previous codes are invalidated when a new one is requested.</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      await transport.sendMail({
        to,
        from,
        subject: `${appName} admin sign-in code`,
        text: `Your admin sign-in code is ${plainOtp}. It expires at ${expiryLabel}.`,
        html,
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      this.logger.error(`Admin OTP SMTP send failed: ${detail}`);
      const isProd = this.config.get<string>('NODE_ENV') === 'production';
      throw new ServiceUnavailableException(
        isProd
          ? 'Email could not be sent. Check server logs and SMTP configuration, then try again.'
          : `Failed to send email via SMTP: ${detail}`,
      );
    }
  }

  async sendVerificationCode(email: string, code: string, type: string) {
    const smtpHost = this.config.get<string>('SMTP_HOST');
    if (!smtpHost) {
      console.log(`[DEV] Verification code for ${email} (${type}): ${code}`);
      return;
    }

    const from =
      this.config.get<string>('MAIL_FROM') ?? 'SWEEPSTOWN <noreply@sweepstown.com>';
    const appName = this.config.get<string>('APP_NAME') ?? 'SWEEPSTOWN';

    const subject =
      type === 'EMAIL_VERIFY'
        ? `Verify your ${appName} account`
        : type === 'PASSWORD_RESET'
          ? `Reset your ${appName} password`
          : `Your ${appName} login code`;

    await this.mailer.sendMail({
      to: email,
      from,
      subject,
      html: `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;"><h2 style="color: #333;">${subject}</h2><p>Your verification code is:</p><p style="font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${code}</p><p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p><p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p><hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" /><p style="color: #999; font-size: 12px;">${appName}</p></div>`,
    });
  }
}
