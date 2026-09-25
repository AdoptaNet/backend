import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthResponseDto } from '../../../auth/application/dtos/auth-response.dto';
import { HashingService } from '../../../auth/application/interfaces/hashing.service';
import { TokenService } from '../../../auth/application/interfaces/token.service';
import { UserRegisteredEvent } from '../../../auth/domain/events/user-registered.event';
import { AdopterProfile } from '../../domain/entities/adopter-profile.entity';
import { ShelterProfile } from '../../domain/entities/shelter-profile.entity';
import { RoleChangeNotAllowedException } from '../../domain/exceptions/role-change-not-allowed.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { AdopterProfileRepository } from '../../domain/repositories/adopter-profile.repository';
import { ShelterProfileRepository } from '../../domain/repositories/shelter-profile.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { SelectUserRoleDto } from '../dtos/select-user-role.dto';

@Injectable()
export class SelectUserRoleUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly adopterProfileRepository: AdopterProfileRepository,
    private readonly shelterProfileRepository: ShelterProfileRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    userId: string,
    dto: SelectUserRoleDto,
  ): Promise<AuthResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Regla de seguridad: si el usuario ya confirmó o seleccionó su rol previamente
    if (user.roleSelected) {
      throw new RoleChangeNotAllowedException(
        'El rol de usuario ya ha sido seleccionado y confirmado previamente.',
      );
    }

    // Regla de seguridad: cuentas registradas con contraseña ya definieron su rol al registrarse
    if (user.passwordHash !== null) {
      throw new RoleChangeNotAllowedException(
        'No se puede cambiar el rol de una cuenta registrada con correo y contraseña.',
      );
    }

    const adopterProfile =
      await this.adopterProfileRepository.findByUserId(userId);
    const shelterProfile =
      await this.shelterProfileRepository.findByUserId(userId);

    // Regla de seguridad: si el usuario ya configuró información en su perfil de adoptante
    if (this.hasConfiguredAdopterProfile(adopterProfile)) {
      throw new RoleChangeNotAllowedException(
        'No es posible cambiar el rol porque ya has configurado tu perfil de adoptante.',
      );
    }

    // Regla de seguridad: si el usuario ya configuró información en su perfil de albergue
    if (this.hasConfiguredShelterProfile(shelterProfile)) {
      throw new RoleChangeNotAllowedException(
        'No es posible cambiar el rol porque ya has configurado tu perfil de albergue.',
      );
    }

    // Si solicita rol de albergue
    if (dto.role === UserRole.SHELTER) {
      if (adopterProfile) {
        await this.adopterProfileRepository.deleteByUserId(userId);
      }
      if (!shelterProfile) {
        const newShelter = this.shelterProfileRepository.create({ userId });
        await this.shelterProfileRepository.save(newShelter);
      }
      user.role = UserRole.SHELTER;
    } else {
      // Solicita rol de adoptante
      if (shelterProfile) {
        await this.shelterProfileRepository.deleteByUserId(userId);
      }
      if (!adopterProfile) {
        const newAdopter = this.adopterProfileRepository.create({ userId });
        await this.adopterProfileRepository.save(newAdopter);
      }
      user.role = UserRole.ADOPTER;
    }

    user.roleSelected = true;

    // Emitir nuevos tokens JWT con el rol actualizado
    const tokens = await this.tokenService.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    user.refreshTokenHash = await this.hashingService.hash(tokens.refreshToken);
    const savedUser = await this.userRepository.save(user);

    this.eventEmitter.emit(
      UserRegisteredEvent.EVENT_NAME,
      new UserRegisteredEvent(
        savedUser.id,
        savedUser.email,
        savedUser.fullName ?? null,
        savedUser.role,
      ),
    );

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        avatarUrl: savedUser.avatarUrl,
        role: savedUser.role,
        roleSelected: savedUser.roleSelected,
        createdAt: savedUser.createdAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private isSet(val: unknown): boolean {
    return val !== null && val !== undefined && val !== '';
  }

  private hasConfiguredAdopterProfile(profile: AdopterProfile | null): boolean {
    if (!profile) return false;
    return (
      this.isSet(profile.department) ||
      this.isSet(profile.zoneType) ||
      this.isSet(profile.housingType) ||
      this.isSet(profile.outdoorSpace) ||
      this.isSet(profile.householdSize) ||
      this.isSet(profile.experienceLevel) ||
      this.isSet(profile.preferredSpecies) ||
      this.isSet(profile.phoneNumber) ||
      this.isSet(profile.isFenced)
    );
  }

  private hasConfiguredShelterProfile(profile: ShelterProfile | null): boolean {
    if (!profile) return false;
    return (
      this.isSet(profile.organizationName) ||
      this.isSet(profile.address) ||
      this.isSet(profile.city) ||
      this.isSet(profile.department) ||
      this.isSet(profile.phoneNumber) ||
      this.isSet(profile.description) ||
      this.isSet(profile.rescueCapacity)
    );
  }
}
