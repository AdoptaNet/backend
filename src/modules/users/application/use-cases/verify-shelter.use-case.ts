import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../../notifications/application/interfaces/email.service';
import { ShelterProfileRepository } from '../../domain/repositories/shelter-profile.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { VerifyShelterDto } from '../dtos/verify-shelter.dto';

@Injectable()
export class VerifyShelterUseCase {
  private readonly logger = new Logger(VerifyShelterUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly shelterProfileRepository: ShelterProfileRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(identifier: string, dto: VerifyShelterDto) {
    const user = await this.userRepository.findByIdWithProfile(identifier);

    if (!user || user.role !== UserRole.SHELTER || !user.shelterProfile) {
      throw new NotFoundException('Albergue no encontrado');
    }

    user.shelterProfile.isVerified = dto.isVerified;
    const updatedProfile = await this.shelterProfileRepository.save(
      user.shelterProfile,
    );

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const shelterUrl = `${frontendUrl}/shelters/${user.id}`;

    try {
      await this.emailService.sendShelterVerificationEmail(user.email, {
        userId: user.id,
        organizationName: updatedProfile.organizationName,
        isVerified: updatedProfile.isVerified,
        shelterUrl,
      });
    } catch (err) {
      this.logger.error(
        `Error al enviar correo de verificación de albergue a ${user.email}: ${
          err instanceof Error ? err.message : err
        }`,
      );
    }

    return {
      id: updatedProfile.id,
      userId: user.id,
      organizationName: updatedProfile.organizationName,
      isVerified: updatedProfile.isVerified,
    };
  }
}
