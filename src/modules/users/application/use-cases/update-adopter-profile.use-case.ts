import { Injectable } from '@nestjs/common';
import { RoleMismatchException } from '../../domain/exceptions/role-mismatch.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { AdopterProfileRepository } from '../../domain/repositories/adopter-profile.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { AdopterProfileResponseDto } from '../dtos/adopter-profile-response.dto';
import { UpdateAdopterProfileDto } from '../dtos/update-adopter-profile.dto';

@Injectable()
export class UpdateAdopterProfileUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly adopterProfileRepository: AdopterProfileRepository,
  ) {}

  async execute(
    userId: string,
    dto: UpdateAdopterProfileDto,
  ): Promise<AdopterProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    if (user.role !== UserRole.ADOPTER) {
      throw new RoleMismatchException(UserRole.ADOPTER, user.role);
    }

    let profile = await this.adopterProfileRepository.findByUserId(userId);
    if (!profile) {
      profile = this.adopterProfileRepository.create({
        userId,
        ...dto,
      });
    } else {
      Object.assign(profile, dto);
    }

    const saved = await this.adopterProfileRepository.save(profile);

    return {
      id: saved.id,
      userId: saved.userId,
      department: saved.department,
      zoneType: saved.zoneType,
      housingType: saved.housingType,
      outdoorSpace: saved.outdoorSpace,
      isFenced: saved.isFenced,
      tenureType: saved.tenureType,
      householdSize: saved.householdSize,
      childrenAgeRange: saved.childrenAgeRange,
      hasElderly: saved.hasElderly,
      allergyType: saved.allergyType,
      currentPets: saved.currentPets,
      currentPetsSociability: saved.currentPetsSociability,
      hoursAlone: saved.hoursAlone,
      workSchedule: saved.workSchedule,
      activityLevel: saved.activityLevel,
      walkTime: saved.walkTime,
      monthlyBudget: saved.monthlyBudget,
      vetBudget: saved.vetBudget,
      experienceLevel: saved.experienceLevel,
      preferredSpecies: saved.preferredSpecies,
      preferredSize: saved.preferredSize,
      preferredAge: saved.preferredAge,
      preferredSex: saved.preferredSex,
      preferredTemperament: saved.preferredTemperament,
      furPreference: saved.furPreference,
      noiseTolerance: saved.noiseTolerance,
      specialNeedsAcceptance: saved.specialNeedsAcceptance,
      sterilizationCommitment: saved.sterilizationCommitment,
      adoptionMotivation: saved.adoptionMotivation,
      followUpAcceptance: saved.followUpAcceptance,
      adopterAgeRange: saved.adopterAgeRange,
      phoneNumber: saved.phoneNumber,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
