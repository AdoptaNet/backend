import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { AuthResponseDto } from '../../application/dtos/auth-response.dto';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  const mockRegisterUseCase = { execute: jest.fn() };
  const mockLoginUseCase = { execute: jest.fn() };
  const mockRefreshTokenUseCase = { execute: jest.fn() };
  const mockLogoutUseCase = { execute: jest.fn() };
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
    const expectedResponse: AuthResponseDto = {
      user: {
        id: 'uuid-1',
        email: 'test@example.com',
        fullName: null,
        avatarUrl: null,
        role: UserRole.ADOPTER,
        createdAt: new Date(),
      },
      accessToken: 'access',
      refreshToken: 'refresh',
    };
    mockRegisterUseCase.execute.mockResolvedValue(expectedResponse);

    const result = await controller.register(dto);

    expect(result).toBe(expectedResponse);
    expect(mockRegisterUseCase.execute).toHaveBeenCalledWith(dto, undefined);
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

  it('should call RefreshTokenUseCase on refresh', async () => {
    const dto = { refreshToken: 'refresh-token' };
    const expectedResponse: AuthResponseDto = {
      user: {
        id: 'uuid-1',
        email: 'test@example.com',
        fullName: null,
        avatarUrl: null,
        role: UserRole.ADOPTER,
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
});
