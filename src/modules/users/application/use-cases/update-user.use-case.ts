import { Injectable } from '@nestjs/common';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { GetMyProfileUseCase } from './get-my-profile.use-case';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly getMyProfileUseCase: GetMyProfileUseCase,
  ) {}

  async execute(userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName;
    }
    if (dto.avatarUrl !== undefined) {
      user.avatarUrl = dto.avatarUrl;
    }

    await this.userRepository.save(user);

    return this.getMyProfileUseCase.execute(userId);
  }
}
