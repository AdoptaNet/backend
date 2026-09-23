import { Injectable } from '@nestjs/common';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserResponseDto } from '../dtos/user-response.dto';

@Injectable()
export class GetMyProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByIdWithProfile(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      roleSelected: user.roleSelected,
      hasPassword: Boolean(user.passwordHash),
      createdAt: user.createdAt,
      adopterProfile: user.adopterProfile
        ? {
            id: user.adopterProfile.id,
            userId: user.adopterProfile.userId,
            department: user.adopterProfile.department,
            zoneType: user.adopterProfile.zoneType,
            housingType: user.adopterProfile.housingType,
            outdoorSpace: user.adopterProfile.outdoorSpace,
            isFenced: user.adopterProfile.isFenced,
            tenureType: user.adopterProfile.tenureType,
            householdSize: user.adopterProfile.householdSize,
            childrenAgeRange: user.adopterProfile.childrenAgeRange,
            hasElderly: user.adopterProfile.hasElderly,
            allergyType: user.adopterProfile.allergyType,
            currentPets: user.adopterProfile.currentPets,
            currentPetsSociability: user.adopterProfile.currentPetsSociability,
            hoursAlone: user.adopterProfile.hoursAlone,
            workSchedule: user.adopterProfile.workSchedule,
            activityLevel: user.adopterProfile.activityLevel,
            walkTime: user.adopterProfile.walkTime,
            monthlyBudget: user.adopterProfile.monthlyBudget,
            vetBudget: user.adopterProfile.vetBudget,
            experienceLevel: user.adopterProfile.experienceLevel,
            preferredSpecies: user.adopterProfile.preferredSpecies,
            preferredSize: user.adopterProfile.preferredSize,
            preferredAge: user.adopterProfile.preferredAge,
            preferredSex: user.adopterProfile.preferredSex,
            preferredTemperament: user.adopterProfile.preferredTemperament,
            furPreference: user.adopterProfile.furPreference,
            noiseTolerance: user.adopterProfile.noiseTolerance,
            specialNeedsAcceptance: user.adopterProfile.specialNeedsAcceptance,
            sterilizationCommitment:
              user.adopterProfile.sterilizationCommitment,
            adoptionMotivation: user.adopterProfile.adoptionMotivation,
            followUpAcceptance: user.adopterProfile.followUpAcceptance,
            adopterAgeRange: user.adopterProfile.adopterAgeRange,
            phoneNumber: user.adopterProfile.phoneNumber,
            createdAt: user.adopterProfile.createdAt,
            updatedAt: user.adopterProfile.updatedAt,
          }
        : null,
      shelterProfile: user.shelterProfile
        ? {
            id: user.shelterProfile.id,
            userId: user.shelterProfile.userId,
            organizationName: user.shelterProfile.organizationName,
            address: user.shelterProfile.address,
            city: user.shelterProfile.city,
            department: user.shelterProfile.department,
            phoneNumber: user.shelterProfile.phoneNumber,
            contactEmail: user.shelterProfile.contactEmail,
            description: user.shelterProfile.description,
            rescueCapacity: user.shelterProfile.rescueCapacity,
            facebookUrl: user.shelterProfile.facebookUrl,
            instagramUrl: user.shelterProfile.instagramUrl,
            latitude: user.shelterProfile.latitude,
            longitude: user.shelterProfile.longitude,
            isVerified: user.shelterProfile.isVerified,
            createdAt: user.shelterProfile.createdAt,
            updatedAt: user.shelterProfile.updatedAt,
          }
        : null,
    };
  }
}
