import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UploadedFile,
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
import { User } from '../../../users/domain/entities/user.entity';
import { AuthResponseDto } from '../../application/dtos/auth-response.dto';
import { LoginDto } from '../../application/dtos/login.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { RegisterDto } from '../../application/dtos/register.dto';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { GoogleAuthGuard } from '../../infrastructure/guards/google-auth.guard';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({
    summary:
      'Registrar un nuevo usuario con email, contraseña y avatar opcional',
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
    type: AuthResponseDto,
    description: 'Usuario registrado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({
    status: 409,
    description: 'El correo electrónico ya está en uso',
  })
  async register(
    @Body() dto: RegisterDto,
    @UploadedFile() avatarFile?: Express.Multer.File,
  ): Promise<AuthResponseDto> {
    return this.registerUseCase.execute(dto, avatarFile);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión con correo electrónico y contraseña',
  })
  @ApiResponse({
    status: 200,
    type: AuthResponseDto,
    description: 'Autenticación exitosa',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar tokens utilizando el refresh token' })
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
    summary: 'Cerrar sesión e invalidar el refresh token activo',
  })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  async logout(@CurrentUser() user: User): Promise<{ message: string }> {
    await this.logoutUseCase.execute(user);
    return { message: 'Sesión cerrada exitosamente' };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Iniciar flujo de autenticación con Google' })
  googleAuth() {
    // Redirige automáticamente a Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback de autenticación de Google' })
  googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const authResult = req.user as AuthResponseDto;
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    const redirectUrl = new URL('/auth/callback', frontendUrl);
    redirectUrl.searchParams.set('accessToken', authResult.accessToken);
    redirectUrl.searchParams.set('refreshToken', authResult.refreshToken);

    return res.redirect(redirectUrl.toString());
  }
}
