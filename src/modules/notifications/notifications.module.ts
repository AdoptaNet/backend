import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './application/interfaces/email.service';
import { AuthNotificationListener } from './application/listeners/auth-notification.listener';
import { HandleResendWebhookUseCase } from './application/use-cases/handle-resend-webhook.use-case';
import { Notification } from './domain/entities/notification.entity';
import { NotificationRepository } from './domain/repositories/notification.repository';
import { NotificationTypeOrmRepository } from './infrastructure/persistence/notification.typeorm-repository';
import { ResendEmailService } from './infrastructure/services/resend-email.service';
import { ResendWebhookController } from './presentation/controllers/resend-webhook.controller';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Notification])],
  controllers: [ResendWebhookController],
  providers: [
    {
      provide: EmailService,
      useClass: ResendEmailService,
    },
    {
      provide: NotificationRepository,
      useClass: NotificationTypeOrmRepository,
    },
    AuthNotificationListener,
    HandleResendWebhookUseCase,
  ],
  exports: [EmailService, NotificationRepository, HandleResendWebhookUseCase],
})
export class NotificationsModule {}
