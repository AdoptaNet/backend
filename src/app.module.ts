import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PetsModule } from './modules/pets/pets.module';
import { UsersModule } from './modules/users/users.module';
import { AdoptionsModule } from './modules/adoptions/adoptions.module';
import { MessagesModule } from './modules/messages/messages.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { AdminModule } from './modules/admin/admin.module';
import { FollowUpsModule } from './modules/follow-ups/follow-ups.module';
import { validate } from './shared/infrastructure/config/env.validation';
import { DatabaseModule } from './shared/infrastructure/database/database.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    DatabaseModule,
    UsersModule,
    AuthModule,
    MediaModule,
    NotificationsModule,
    PetsModule,
    AdoptionsModule,
    MessagesModule,
    RecommendationsModule,
    AdminModule,
    FollowUpsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
