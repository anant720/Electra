import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST', 'smtp.gmail.com'),
      port: this.config.get<number>('MAIL_PORT', 587),
      secure: false,
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendElectionAlert(email: string, countryCode: string, message: string) {
    this.logger.log(`[ALERT - ${countryCode}] Sending to ${email}`);

    try {
      if (this.config.get<string>('NODE_ENV') === 'production') {
        await this.transporter.sendMail({
          from: `"ELECTRA Civic Alerts" <${this.config.get('MAIL_USER')}>`,
          to: email,
          subject: `🗳️ Action Required: Election Update for ${countryCode}`,
          text: message,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #0070F3;">ELECTRA Civic Alert</h2>
              <p style="font-size: 16px; line-height: 1.5; color: #333;">${message}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #999;">You are receiving this because you signed up for electoral alerts in ${countryCode}.</p>
              <p style="font-size: 12px; color: #999;">&copy; 2026 ELECTRA Sovereign System. Navigate Every Election.</p>
            </div>
          `,
        });
      } else {
        this.logger.warn(`[DEV MODE] Skipping actual email send. Message: ${message}`);
      }
    } catch (err) {
      this.logger.error(`Failed to send alert to ${email}`, err);
    }
  }
}
