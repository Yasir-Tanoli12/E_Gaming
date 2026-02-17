import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('SMTP_HOST');
        return {
          transport: host
            ? {
                host,
                port: config.get<number>('SMTP_PORT', 587),
                secure: config.get<boolean>('SMTP_SECURE', false),
                auth: {
                  user: config.get<string>('SMTP_USER'),
                  pass: config.get<string>('SMTP_PASS'),
                },
              }
            : { jsonTransport: true },
          defaults: {
            from: config.get<string>('MAIL_FROM', '"E-Gaming" <noreply@egaming.com>'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
