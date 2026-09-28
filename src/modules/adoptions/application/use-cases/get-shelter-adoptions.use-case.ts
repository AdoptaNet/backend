import { Injectable } from '@nestjs/common';
import { AdoptionRequestRepository } from '../../domain/repositories/adoption-request.repository';
import { QueryAdoptionRequestsDto } from '../dtos/query-adoption-requests.dto';
import { PaginatedAdoptionRequestsResponseDto } from '../dtos/adoption-request-response.dto';
import { AdoptionRequestMapper } from '../mappers/adoption-request.mapper';

@Injectable()
export class GetShelterAdoptionsUseCase {
  constructor(private readonly adoptionRepo: AdoptionRequestRepository) {}

  async execute(
    shelterId: string,
    query: QueryAdoptionRequestsDto,
  ): Promise<PaginatedAdoptionRequestsResponseDto> {
    const result = await this.adoptionRepo.findByShelter(shelterId, {
      status: query.status,
      petId: query.petId,
      page: query.page,
      limit: query.limit,
    });

    return {
      items: result.items.map((item) => AdoptionRequestMapper.toResponseDto(item)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
