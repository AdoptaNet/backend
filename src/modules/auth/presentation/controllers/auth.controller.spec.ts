import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { AuthResponseDto } from '../../application/dtos/auth-response.dto';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { ResendVerificationUseCase } from '../../application/use-cases/resend-verification.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { VerifyEmailUseCase } from '../../application/use-cases/verify-email.use-case';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  const mockRegisterUseCase = { execute: jest.fn() };
  const mockLoginUseCase = { execute: jest.fn() };
  const mockRefreshTokenUseCase = { execute: jest.fn() };
  const mockLogoutUseCase = { execute: jest.fn() };
  const mockVerifyEmailUseCase = { execute: jest.fn() };
  const mockResendVerificationUseCase = { execute: jest.fn() };
  const mockForgotPasswordUseCase = { execute: jest.fn() };
  const mockResetPasswordUseCase = { execute: jest.fn() };
  const mockConfigService = { get: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: RefreshTokenUseCase, useValue: mockRefreshTokenUseCase },
        { provide: LogoutUseCase, useValue: mockLogoutUseCase },
        { provide: VerifyEmailUseCase, useValue: mockVerifyEmailUseCase },
        {
          provide: ResendVerificationUseCase,
          useValue: mockResendVerificationUseCase,
        },
        { provide: ForgotPasswordUseCase, useValue: mockForgotPasswordUseCase },
        { provide: ResetPasswordUseCase, useValue: mockResetPasswordUseCase },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call RegisterUseCase on register', async () => {
    const dto = { email: 'test@example.com', password: 'Password123!' };
    const expectedResponse = {
      message: 'Usuario registrado exitosamente',
      email: 'test@example.com',
      role: 'adopter',
    };
    mockRegisterUseCase.execute.mockResolvedValue(expectedResponse);

    const result = await controller.register(dto);

    expect(result).toBe(expectedResponse);
    expect(mockRegisterUseCase.execute).toHaveBeenCalledWith(dto, undefined);
  });

  it('should call VerifyEmailUseCase on verifyEmail', async () => {
    const dto = { token: 'valid-token' };
    mockVerifyEmailUseCase.execute.mockResolvedValue({
      message: 'Cuenta activada',
    });

    const result = await controller.verifyEmail(dto);
    expect(result).toEqual({ message: 'Cuenta activada' });
    expect(mockVerifyEmailUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should call ResendVerificationUseCase on resendVerification', async () => {
    const dto = { email: 'test@example.com' };
    mockResendVerificationUseCase.execute.mockResolvedValue({
      message: 'Enlace enviado',
    });

    const result = await controller.resendVerification(dto);
    expect(result).toEqual({ message: 'Enlace enviado' });
    expect(mockResendVerificationUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should call LoginUseCase on login', async () => {
    const dto = { email: 'test@example.com', password: 'Password123!' };
    const expectedResponse: AuthResponseDto = {
      user: {
        id: 'uuid-1',
        email: 'test@example.com',
        fullName: null,
        avatarUrl: null,
        role: UserRole.ADOPTER,
        roleSelected: true,
        createdAt: new Date(),
      },
      accessToken: 'access',
      refreshToken: 'refresh',
    };
    mockLoginUseCase.execute.mockResolvedValue(expectedResponse);

    const result = await controller.login(dto);

    expect(result).toBe(expectedResponse);
    expect(mockLoginUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should call ForgotPasswordUseCase on forgotPassword', async () => {
    const dto = { email: 'test@example.com' };
    mockForgotPasswordUseCase.execute.mockResolvedValue({
      message: 'Enlace enviado si registrado',
    });

    const result = await controller.forgotPassword(dto);
    expect(result).toEqual({ message: 'Enlace enviado si registrado' });
    expect(mockForgotPasswordUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should call ResetPasswordUseCase on resetPassword', async () => {
    const dto = { token: 'token-123', newPassword: 'NewPassword123!' };
    mockResetPasswordUseCase.execute.mockResolvedValue({
      message: 'Contraseña restablecida',
    });

    const result = await controller.resetPassword(dto);
    expect(result).toEqual({ message: 'Contraseña restablecida' });
    expect(mockResetPasswordUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should call RefreshTokenUseCase on refresh', async () => {
    const dto = { refreshToken: 'refresh-token' };
    const expectedResponse: AuthResponseDto = {
      user: {
        id: 'uuid-1',
        email: 'test@example.com',
        fullName: null,
        avatarUrl: null,
        role: UserRole.ADOPTER,
        roleSelected: true,
        createdAt: new Date(),
      },
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    };
    mockRefreshTokenUseCase.execute.mockResolvedValue(expectedResponse);

    const result = await controller.refresh(dto);

    expect(result).toBe(expectedResponse);
    expect(mockRefreshTokenUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should call LogoutUseCase on logout', async () => {
    const user = new User();
    mockLogoutUseCase.execute.mockResolvedValue(undefined);

    const result = await controller.logout(user);

    expect(result).toEqual({ message: 'Sesión cerrada exitosamente' });
    expect(mockLogoutUseCase.execute).toHaveBeenCalledWith(user);
  });

  it('should redirect to frontend callback with tokens and isNewUser=true when new user', () => {
    mockConfigService.get.mockReturnValue('http://localhost:3001');

    const req = {
      user: {
        accessToken: 'mock-access',
        refreshToken: 'mock-refresh',
        isNewUser: true,
      },
    } as any;

    const res = {
      redirect: jest.fn(),
    } as any;

    controller.googleAuthCallback(req, res);

    expect(res.redirect).toHaveBeenCalledWith(
      'http://localhost:3001/auth/callback?accessToken=mock-access&refreshToken=mock-refresh&isNewUser=true',
    );
  });
});
