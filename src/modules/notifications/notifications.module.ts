import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthNotificationListener } from './application/listeners/auth-notification.listener';
import { EmailService } from './application/interfaces/email.service';
import { ResendEmailService } from './infrastructure/services/resend-email.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EmailService,
      useClass: ResendEmailService,
    },
    AuthNotificationListener,
  ],
  exports: [EmailService],
})
export class NotificationsModule {}
