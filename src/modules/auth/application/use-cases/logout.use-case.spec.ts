import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { LogoutUseCase } from './logout.use-case';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  const mockUserRepository = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
  });

  it('should set refreshTokenHash to null and save user', async () => {
    const user = new User();
    user.refreshTokenHash = 'some-hash';

    await useCase.execute(user);

    expect(user.refreshTokenHash).toBeNull();
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
  });
});
