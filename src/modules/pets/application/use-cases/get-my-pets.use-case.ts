import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { PetAccessForbiddenException } from '../../domain/exceptions/pet-access-forbidden.exception';
import { PetRepository } from '../../domain/repositories/pet.repository';
import { PaginatedPetsResponseDto } from '../dtos/paginated-pets-response.dto';
import { PetResponseDto } from '../dtos/pet-response.dto';
import { QueryShelterPetsDto } from '../dtos/query-shelter-pets.dto';

@Injectable()
export class GetMyPetsUseCase {
  constructor(private readonly petRepository: PetRepository) {}

  async execute(
    user: User,
    query: QueryShelterPetsDto,
  ): Promise<PaginatedPetsResponseDto> {
    if (user.role !== UserRole.SHELTER && user.role !== UserRole.ADMIN) {
      throw new PetAccessForbiddenException(
        'Solo los usuarios con rol de albergue pueden acceder a sus mascotas registradas',
      );
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const [pets, total] = await this.petRepository.findByShelter(user.id, {
      status: query.status,
      search: query.search,
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: pets.map((pet) => PetResponseDto.fromEntity(pet)),
      total,
      page,
      limit,
      totalPages,
    };
  }
}
