import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakePluralNamingStrategy } from './naming.strategy';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        ssl: configService.get<boolean>('DATABASE_SSL')
          ? { rejectUnauthorized: false }
          : false,
        autoLoadEntities: true,
        synchronize: false,
        namingStrategy: new SnakePluralNamingStrategy(),
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
