import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { MAX_IMAGE_SIZE_BYTES } from '../../../media/application/constants/image-upload.constants';
import { User } from '../../../users/domain/entities/user.entity';
import { AuthResponseDto } from '../../application/dtos/auth-response.dto';
import { ForgotPasswordDto } from '../../application/dtos/forgot-password.dto';
import { LoginDto } from '../../application/dtos/login.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { RegisterResponseDto } from '../../application/dtos/register-response.dto';
import { RegisterDto } from '../../application/dtos/register.dto';
import { ResendVerificationDto } from '../../application/dtos/resend-verification.dto';
import { ResetPasswordDto } from '../../application/dtos/reset-password.dto';
import { VerifyEmailDto } from '../../application/dtos/verify-email.dto';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { ResendVerificationUseCase } from '../../application/use-cases/resend-verification.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { VerifyEmailUseCase } from '../../application/use-cases/verify-email.use-case';
import { GoogleAuthGuard } from '../../infrastructure/guards/google-auth.guard';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { OAuthExceptionFilter } from '../../infrastructure/filters/oauth-exception.filter';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationUseCase: ResendVerificationUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @UseInterceptors(
    FileInterceptor('avatar', { limits: { fileSize: MAX_IMAGE_SIZE_BYTES } }),
  )
  @ApiOperation({
    summary:
      'Registrar un nuevo usuario con email, contraseña y avatar opcional (US-01)',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'usuario@ejemplo.com' },
        password: { type: 'string', example: 'Password123!' },
        fullName: { type: 'string', example: 'Juan Pérez' },
        role: {
          type: 'string',
          enum: ['adopter', 'shelter'],
          default: 'adopter',
        },
        avatar: {
          type: 'string',
          format: 'binary',
          description:
            'Foto de perfil (avatar) opcional (JPG, PNG, WEBP, máx 5MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    type: RegisterResponseDto,
    description: 'Usuario registrado exitosamente. Requiere verificación de correo.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({
    status: 409,
    description: 'El correo electrónico ya está en uso',
  })
  async register(
    @Body() dto: RegisterDto,
    @UploadedFile() avatarFile?: Express.Multer.File,
  ): Promise<RegisterResponseDto> {
    return this.registerUseCase.execute(dto, avatarFile);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activar cuenta mediante token criptográfico de verificación (US-01 Escenario 2)',
  })
  @ApiResponse({ status: 200, description: 'Cuenta activada exitosamente' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    return this.verifyEmailUseCase.execute(dto);
  }

  @Get('verify-email')
  @ApiOperation({
    summary:
      'Enlace GET para verificación directa desde el cliente de correo (US-01)',
  })
  async verifyEmailGet(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    if (!token) {
      return res.redirect(`${frontendUrl}/login?error=missing_token`);
    }

    try {
      await this.verifyEmailUseCase.execute({ token });
      return res.redirect(`${frontendUrl}/login?verified=true`);
    } catch {
      return res.redirect(`${frontendUrl}/login?error=invalid_or_expired_token`);
    }
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Reenviar enlace de verificación de correo con Rate Limiting de 2 min (US-01 Escenario 3)',
  })
  @ApiResponse({
    status: 200,
    description: 'Enlace enviado si la cuenta existe y no está verificada',
  })
  @ApiResponse({
    status: 429,
    description: 'Demasiadas solicitudes. Espere 2 minutos.',
  })
  async resendVerification(
    @Body() dto: ResendVerificationDto,
  ): Promise<{ message: string }> {
    return this.resendVerificationUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión con correo electrónico y contraseña (US-03)',
  })
  @ApiResponse({
    status: 200,
    type: AuthResponseDto,
    description: 'Autenticación exitosa',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas o cuenta inactiva/dada de baja',
  })
  @ApiResponse({
    status: 403,
    description: 'Debe verificar su correo antes de ingresar',
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renovar y rotar tokens utilizando el refresh token (US-03)',
  })
  @ApiResponse({
    status: 200,
    type: AuthResponseDto,
    description: 'Tokens renovados exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido, expirado o revocado',
  })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cerrar sesión e invalidar el refresh token activo (US-03)',
  })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  async logout(@CurrentUser() user: User): Promise<{ message: string }> {
    await this.logoutUseCase.execute(user);
    return { message: 'Sesión cerrada exitosamente' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Solicitar restablecimiento de contraseña olvidada vía correo (US-04 Escenario 1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje uniforme de confirmación de envío',
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.forgotPasswordUseCase.execute(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Restablecer contraseña con token seguro y revocar sesiones previas (US-04 Escenario 2)',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido, expirado o contraseña insegura',
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.resetPasswordUseCase.execute(dto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Iniciar flujo de autenticación con Google (US-02)' })
  googleAuth() {
    // Redirige automáticamente a Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  @ApiOperation({ summary: 'Callback de autenticación de Google (US-02)' })
  googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const authResult = req.user as AuthResponseDto;
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    const redirectUrl = new URL('/auth/callback', frontendUrl);
    redirectUrl.searchParams.set('accessToken', authResult.accessToken);
    redirectUrl.searchParams.set('refreshToken', authResult.refreshToken);

    if (authResult.isNewUser) {
      redirectUrl.searchParams.set('isNewUser', 'true');
    }

    return res.redirect(redirectUrl.toString());
  }
}
