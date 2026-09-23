import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { PetAccessForbiddenException } from '../../domain/exceptions/pet-access-forbidden.exception';
import { PetNotFoundException } from '../../domain/exceptions/pet-not-found.exception';
import { PetRepository } from '../../domain/repositories/pet.repository';
import { PetResponseDto } from '../dtos/pet-response.dto';
import { UpdatePetStatusDto } from '../dtos/update-pet-status.dto';

@Injectable()
export class UpdatePetStatusUseCase {
  constructor(private readonly petRepository: PetRepository) {}

  async execute(
    id: string,
    user: User,
    dto: UpdatePetStatusDto,
  ): Promise<PetResponseDto> {
    const pet = await this.petRepository.findByIdWithPhotos(id);
    if (!pet) {
      throw new PetNotFoundException(id);
    }

    if (pet.shelterId !== user.id && user.role !== UserRole.ADMIN) {
      throw new PetAccessForbiddenException(
        'No tienes permisos para cambiar el estado de esta mascota',
      );
    }

    pet.status = dto.status;
    const savedPet = await this.petRepository.save(pet);
    return PetResponseDto.fromEntity(savedPet, pet.shelter?.shelterProfile);
  }
}
