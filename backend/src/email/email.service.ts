import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private mailer: MailerService,
    private config: ConfigService,
  ) {}

  async sendVerificationCode(email: string, code: string, type: string) {
    const smtpHost = this.config.get<string>('SMTP_HOST');
    if (!smtpHost) {
      console.log(`[DEV] Verification code for ${email} (${type}): ${code}`);
      return;
    }

    const from = this.config.get<string>('MAIL_FROM') ?? 'E-Gaming <noreply@egaming.com>';
    const appName = this.config.get<string>('APP_NAME') ?? 'E-Gaming';

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
