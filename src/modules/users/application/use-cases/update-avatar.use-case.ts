import { Injectable } from '@nestjs/common';
import { UploadImageUseCase } from '../../../media/application/use-cases/upload-image.use-case';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserResponseDto } from '../dtos/user-response.dto';
import { GetMyProfileUseCase } from './get-my-profile.use-case';

@Injectable()
export class UpdateAvatarUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly uploadImageUseCase: UploadImageUseCase,
    private readonly getMyProfileUseCase: GetMyProfileUseCase,
  ) {}

  async execute(
    userId: string,
    file: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const upload = await this.uploadImageUseCase.execute(file, {
      folder: 'avatars',
    });

    user.avatarUrl = upload.url;
    user.avatarKey = upload.publicId;
    await this.userRepository.save(user);

    return this.getMyProfileUseCase.execute(userId);
  }
}
