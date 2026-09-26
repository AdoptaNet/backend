import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadImageUseCase } from '../../../media/application/use-cases/upload-image.use-case';
import { EmailService } from '../../../notifications/application/interfaces/email.service';
import { AdopterProfileRepository } from '../../../users/domain/repositories/adopter-profile.repository';
import { ShelterProfileRepository } from '../../../users/domain/repositories/shelter-profile.repository';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { EmailAlreadyInUseException } from '../../domain/exceptions/email-already-in-use.exception';
import { RegisterResponseDto } from '../dtos/register-response.dto';
import { RegisterDto } from '../dtos/register.dto';
import { HashingService } from '../interfaces/hashing.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly adopterProfileRepository: AdopterProfileRepository,
    private readonly shelterProfileRepository: ShelterProfileRepository,
    private readonly hashingService: HashingService,
    private readonly uploadImageUseCase: UploadImageUseCase,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    dto: RegisterDto,
    avatarFile?: Express.Multer.File,
  ): Promise<RegisterResponseDto> {
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

    // Generar token criptográfico de verificación seguro (24 horas de vigencia)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = this.userRepository.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      fullName: dto.fullName ?? null,
      avatarUrl,
      avatarKey,
      role,
      roleSelected: true,
      isEmailVerified: false,
      emailVerifiedAt: null,
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: expiresAt,
      isActive: true,
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

    // Despachar correo transaccional de verificación con enlace seguro
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const verificationUrl = `${frontendUrl}/verify-email?token=${rawToken}`;

    await this.emailService.sendEmailVerification(savedUser.email, {
      userId: savedUser.id,
      fullName: savedUser.fullName,
      verificationUrl,
    });

    return {
      message:
        'Usuario registrado exitosamente. Por favor verifica tu correo para activar tu cuenta.',
      email: savedUser.email,
      role: savedUser.role,
    };
  }
}
