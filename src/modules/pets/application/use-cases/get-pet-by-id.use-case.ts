import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { PetNotFoundException } from '../../domain/exceptions/pet-not-found.exception';
import { PetRepository } from '../../domain/repositories/pet.repository';
import { PetStatus } from '../../domain/value-objects/pet-status.enum';
import { PetResponseDto } from '../dtos/pet-response.dto';

@Injectable()
export class GetPetByIdUseCase {
  constructor(private readonly petRepository: PetRepository) {}

  async execute(
    id: string,
    currentUser?: User | null,
  ): Promise<PetResponseDto> {
    const pet = await this.petRepository.findByIdWithPhotos(id);

    if (!pet) {
      throw new PetNotFoundException(id);
    }

    if (pet.status === PetStatus.DRAFT || pet.status === PetStatus.HIDDEN) {
      const isOwner = currentUser && currentUser.id === pet.shelterId;
      const isAdmin = currentUser && currentUser.role === UserRole.ADMIN;
      if (!isOwner && !isAdmin) {
        throw new PetNotFoundException(id);
      }
    }

    return PetResponseDto.fromEntity(pet, pet.shelter?.shelterProfile);
  }
}
