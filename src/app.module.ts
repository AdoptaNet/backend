import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './modules/auth/auth.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PetsModule } from './modules/pets/pets.module';
import { UsersModule } from './modules/users/users.module';
import { validate } from './shared/infrastructure/config/env.validation';
import { DatabaseModule } from './shared/infrastructure/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    UsersModule,
    AuthModule,
    MediaModule,
    NotificationsModule,
    PetsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
