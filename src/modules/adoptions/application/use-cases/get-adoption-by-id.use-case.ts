import { Injectable } from '@nestjs/common';
import { AdoptionRequestRepository } from '../../domain/repositories/adoption-request.repository';
import {
  AdoptionRequestNotFoundException,
  UnauthorizedShelterActionForbiddenException,
} from '../../domain/exceptions/adoption.exceptions';
import { AdoptionRequestResponseDto } from '../dtos/adoption-request-response.dto';
import { AdoptionRequestMapper } from '../mappers/adoption-request.mapper';

@Injectable()
export class GetAdoptionByIdUseCase {
  constructor(private readonly adoptionRepo: AdoptionRequestRepository) {}

  async execute(
    requestId: string,
    userId: string,
  ): Promise<AdoptionRequestResponseDto> {
    const adoption = await this.adoptionRepo.findById(requestId);
    if (!adoption) {
      throw new AdoptionRequestNotFoundException(requestId);
    }

    if (adoption.adopterId !== userId && adoption.shelterId !== userId) {
      throw new UnauthorizedShelterActionForbiddenException();
    }

    return AdoptionRequestMapper.toResponseDto(adoption);
  }
}
