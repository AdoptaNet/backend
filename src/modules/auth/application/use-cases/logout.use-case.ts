import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(user: User): Promise<void> {
    user.refreshTokenHash = null;
    await this.userRepository.save(user);
  }
}
