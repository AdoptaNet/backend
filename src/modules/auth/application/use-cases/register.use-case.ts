import { Injectable } from '@nestjs/common';
import { UploadImageUseCase } from '../../../media/application/use-cases/upload-image.use-case';
import { AdopterProfileRepository } from '../../../users/domain/repositories/adopter-profile.repository';
import { ShelterProfileRepository } from '../../../users/domain/repositories/shelter-profile.repository';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { EmailAlreadyInUseException } from '../../domain/exceptions/email-already-in-use.exception';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { RegisterDto } from '../dtos/register.dto';
import { HashingService } from '../interfaces/hashing.service';
import { TokenService } from '../interfaces/token.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly adopterProfileRepository: AdopterProfileRepository,
    private readonly shelterProfileRepository: ShelterProfileRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly uploadImageUseCase: UploadImageUseCase,
  ) {}

  async execute(
    dto: RegisterDto,
    avatarFile?: Express.Multer.File,
  ): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new EmailAlreadyInUseException(dto.email);
    }

    let avatarUrl: string | null = null;
    let avatarKey: string | null = null;
    if (avatarFile) {
      const upload = await this.uploadImageUseCase.execute(avatarFile, {
        folder: 'avatars',
      });
      avatarUrl = upload.url;
      avatarKey = upload.publicId;
    }

    const passwordHash = await this.hashingService.hash(dto.password);
    const role = dto.role ?? UserRole.ADOPTER;

    const user = this.userRepository.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      fullName: dto.fullName ?? null,
      avatarUrl,
      avatarKey,
      role,
    });

    const savedUser = await this.userRepository.save(user);

    if (role === UserRole.SHELTER) {
      const shelterProfile = this.shelterProfileRepository.create({
        userId: savedUser.id,
      });
      await this.shelterProfileRepository.save(shelterProfile);
    } else {
      const adopterProfile = this.adopterProfileRepository.create({
        userId: savedUser.id,
      });
      await this.adopterProfileRepository.save(adopterProfile);
    }

    const tokens = await this.tokenService.generateTokens({
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    });

    savedUser.refreshTokenHash = await this.hashingService.hash(
      tokens.refreshToken,
    );
    await this.userRepository.save(savedUser);

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        avatarUrl: savedUser.avatarUrl,
        role: savedUser.role,
        createdAt: savedUser.createdAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
