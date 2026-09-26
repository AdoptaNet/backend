import { Injectable } from '@nestjs/common';
import { PetRepository } from '../../domain/repositories/pet.repository';
import { PaginatedPetsResponseDto } from '../dtos/paginated-pets-response.dto';
import { PetResponseDto } from '../dtos/pet-response.dto';
import { QueryPublicPetsDto } from '../dtos/query-public-pets.dto';

@Injectable()
export class ListPublicPetsUseCase {
  constructor(private readonly petRepository: PetRepository) {}

  async execute(query: QueryPublicPetsDto): Promise<PaginatedPetsResponseDto> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const [pets, total] = await this.petRepository.findPublic({
      species: query.species,
      size: query.size,
      ageCategory: query.ageCategory,
      gender: query.gender,
      city: query.city,
      department: query.department,
      search: query.search,
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: pets.map((pet) =>
        PetResponseDto.fromEntity(pet, pet.shelter?.shelterProfile),
      ),
      total,
      page,
      limit,
      totalPages,
    };
  }
}
