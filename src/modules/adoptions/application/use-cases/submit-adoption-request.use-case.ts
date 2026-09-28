import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PetRepository } from '../../../pets/domain/repositories/pet.repository';
import { PetStatus } from '../../../pets/domain/value-objects/pet-status.enum';
import { PetNotFoundException } from '../../../pets/domain/exceptions/pet-not-found.exception';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { AdopterProfileRepository } from '../../../users/domain/repositories/adopter-profile.repository';
import { AdoptionRequest } from '../../domain/entities/adoption-request.entity';
import { AdoptionStatus } from '../../domain/value-objects/adoption-status.enum';
import { AdopterSnapshot } from '../../domain/value-objects/adopter-snapshot.interface';
import { AdoptionSubmittedEvent } from '../../domain/events/adoption-submitted.event';
import { AdoptionRequestRepository } from '../../domain/repositories/adoption-request.repository';
import {
  DuplicateAdoptionRequestConflictException,
  IncompleteAdopterSurveyException,
  MaxActiveAdoptionsConflictException,
  PetNotAvailableConflictException,
  ShelterCannotAdoptOwnPetException,
} from '../../domain/exceptions/adoption.exceptions';
import { CreateAdoptionRequestDto } from '../dtos/create-adoption-request.dto';
import { AdoptionRequestResponseDto } from '../dtos/adoption-request-response.dto';
import { AdoptionRequestMapper } from '../mappers/adoption-request.mapper';

@Injectable()
export class SubmitAdoptionRequestUseCase {
  constructor(
    private readonly adoptionRepo: AdoptionRequestRepository,
    private readonly petRepo: PetRepository,
    private readonly userRepo: UserRepository,
    private readonly adopterProfileRepo: AdopterProfileRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    adopterId: string,
    dto: CreateAdoptionRequestDto,
  ): Promise<AdoptionRequestResponseDto> {
    const user = await this.userRepo.findById(adopterId);
    if (!user) {
      throw new IncompleteAdopterSurveyException();
    }

    const adopterProfile =
      await this.adopterProfileRepo.findByUserId(adopterId);
    if (!adopterProfile || !adopterProfile.isSurveyCompleted) {
      throw new IncompleteAdopterSurveyException();
    }

    const pet = await this.petRepo.findByIdWithPhotos(dto.petId);
    if (!pet) {
      throw new PetNotFoundException(dto.petId);
    }

    if (pet.status !== PetStatus.AVAILABLE) {
      throw new PetNotAvailableConflictException(pet.status);
    }

    if (pet.shelterId === adopterId) {
      throw new ShelterCannotAdoptOwnPetException();
    }

    // Regla de concurrencia: máximo 3 solicitudes activas simultáneas (pending o under_review)
    const activeCount =
      await this.adoptionRepo.countActiveByAdopterId(adopterId);
    if (activeCount >= 3) {
      throw new MaxActiveAdoptionsConflictException();
    }

    // Regla de duplicidad: solo 1 solicitud activa para la misma mascota
    const existing = await this.adoptionRepo.findActiveByPetAndAdopter(
      dto.petId,
      adopterId,
    );
    if (existing) {
      throw new DuplicateAdoptionRequestConflictException();
    }

    const shelterUser = await this.userRepo.findById(pet.shelterId);

    // Snapshot inmutable congelando las 33 variables y datos del adoptante
    const snapshot: AdopterSnapshot = {
      applicant: {
        id: user.id,
        fullName: user.fullName ?? null,
        email: user.email,
        phoneNumber: adopterProfile.phoneNumber ?? null,
        department: adopterProfile.department ?? null,
        city: adopterProfile.city ?? null,
      },
      housing: {
        housingType: adopterProfile.housingType ?? null,
        ownership: adopterProfile.tenureType ?? null,
        landlordAllowsPets: true,
        hasYard: adopterProfile.outdoorSpace ? true : false,
        yardFenced: adopterProfile.isFenced ?? null,
        zoneType: adopterProfile.zoneType ?? null,
      },
      household: {
        householdSize: adopterProfile.householdSize ? Number(adopterProfile.householdSize) || null : null,
        adultsInHome: null,
        hasChildren: Boolean(adopterProfile.childrenAgeRange),
        childrenAges: adopterProfile.childrenAgeRange ? [adopterProfile.childrenAgeRange] : null,
        hasOtherPets: Boolean(adopterProfile.currentPets),
        allMembersAgree: true,
      },
      routine: {
        hoursAlonePerDay: adopterProfile.hoursAlone ? Number(adopterProfile.hoursAlone) || null : null,
        exerciseTimeMinutes: null,
        budgetMonthlyPen: null,
        petCareTravel: null,
        experienceLevel: adopterProfile.experienceLevel ?? null,
      },
      preferences: {
        preferredSpecies: adopterProfile.preferredSpecies ?? null,
        preferredSize: adopterProfile.preferredSize ? [adopterProfile.preferredSize] : null,
        preferredEnergy: adopterProfile.activityLevel ? [adopterProfile.activityLevel] : null,
        preferredAge: adopterProfile.preferredAge ? [adopterProfile.preferredAge] : null,
        preferredSex: adopterProfile.preferredSex ?? null,
      },
      snapshotTimestamp: new Date().toISOString(),
      ...(adopterProfile.compatibilityData
        ? { rawCompatibilityData: adopterProfile.compatibilityData }
        : {}),
    };

    const newAdoption = new AdoptionRequest();
    newAdoption.petId = pet.id;
    newAdoption.adopterId = adopterId;
    newAdoption.shelterId = pet.shelterId;
    newAdoption.status = AdoptionStatus.PENDING;
    newAdoption.motivationLetter = dto.motivationLetter.trim();
    newAdoption.responsibilityPledge = dto.responsibilityPledge;
    newAdoption.adopterSnapshot = snapshot;

    const saved = await this.adoptionRepo.save(newAdoption);

    // Adjuntar relaciones para el mapping y notificación
    saved.pet = pet;
    saved.adopter = user;
    if (shelterUser) {
      saved.shelter = shelterUser;
    }

    this.eventEmitter.emit(
      AdoptionSubmittedEvent.EVENT_NAME,
      new AdoptionSubmittedEvent(
        saved.id,
        pet.id,
        pet.name,
        user.id,
        user.fullName || 'Adoptante interesado',
        user.email,
        pet.shelterId,
        shelterUser?.email || '',
      ),
    );

    return AdoptionRequestMapper.toResponseDto(saved);
  }
}
