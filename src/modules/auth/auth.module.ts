import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { HashingService } from './application/interfaces/hashing.service';
import { TokenService } from './application/interfaces/token.service';
import { GoogleLoginUseCase } from './application/use-cases/google-login.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { GoogleAuthGuard } from './infrastructure/guards/google-auth.guard';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { BcryptHashingService } from './infrastructure/services/bcrypt-hashing.service';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GoogleLoginUseCase,
    JwtStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    RolesGuard,
    GoogleAuthGuard,
    {
      provide: HashingService,
      useClass: BcryptHashingService,
    },
    {
      provide: TokenService,
      useClass: JwtTokenService,
    },
  ],
  exports: [
    JwtAuthGuard,
    RolesGuard,
    GoogleAuthGuard,
    PassportModule,
    HashingService,
    TokenService,
  ],
})
export class AuthModule {}
