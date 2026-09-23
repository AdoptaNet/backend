import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RoleMismatchException } from '../../domain/exceptions/role-mismatch.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { AdopterProfileRepository } from '../../domain/repositories/adopter-profile.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { AdopterSurveyCompletedEvent } from '../../domain/events/adopter-survey-completed.event';
import { AdopterProfileUpdatedEvent } from '../../domain/events/adopter-profile-updated.event';
import {
  buildCompatibilityData,
  checkIsSurveyCompleted,
} from '../../domain/utils/compatibility-data.util';
import { AdopterProfileResponseDto } from '../dtos/adopter-profile-response.dto';
import { UpdateAdopterProfileDto } from '../dtos/update-adopter-profile.dto';

@Injectable()
export class UpdateAdopterProfileUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly adopterProfileRepository: AdopterProfileRepository,
    private readonly eventEmitter: EventEmitter2,
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
    const wasCompletedBefore = profile?.isSurveyCompleted ?? false;

    if (!profile) {
      profile = this.adopterProfileRepository.create({
        userId,
        ...dto,
      });
    } else {
      Object.assign(profile, dto);
    }

    // Calcular JSONB estructurado y estado de la encuesta ML
    profile.compatibilityData = buildCompatibilityData(profile);
    profile.isSurveyCompleted = checkIsSurveyCompleted(profile);

    const saved = await this.adopterProfileRepository.save(profile);

    // Emitir eventos de dominio
    if (!wasCompletedBefore && saved.isSurveyCompleted) {
      this.eventEmitter.emit(
        'adopter.survey_completed',
        new AdopterSurveyCompletedEvent(
          userId,
          saved.id,
          saved.compatibilityData,
        ),
      );
    } else if (wasCompletedBefore) {
      this.eventEmitter.emit(
        'adopter.profile_updated',
        new AdopterProfileUpdatedEvent(
          userId,
          saved.id,
          saved.compatibilityData,
        ),
      );
    }

    return {
      id: saved.id,
      userId: saved.userId,
      department: saved.department,
      city: saved.city,
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
      isSurveyCompleted: saved.isSurveyCompleted,
      compatibilityData: saved.compatibilityData,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
