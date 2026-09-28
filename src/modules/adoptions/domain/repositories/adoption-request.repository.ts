import { AdoptionRequest } from '../entities/adoption-request.entity';
import { AdoptionStatus } from '../value-objects/adoption-status.enum';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class AdoptionRequestRepository {
  abstract findById(id: string): Promise<AdoptionRequest | null>;
  abstract save(request: AdoptionRequest): Promise<AdoptionRequest>;
  abstract countActiveByAdopterId(adopterId: string): Promise<number>;
  abstract findActiveByPetAndAdopter(
    petId: string,
    adopterId: string,
  ): Promise<AdoptionRequest | null>;
  abstract findByAdopter(
    adopterId: string,
    options: { status?: AdoptionStatus; page: number; limit: number },
  ): Promise<PaginatedResult<AdoptionRequest>>;
  abstract findByShelter(
    shelterId: string,
    options: {
      status?: AdoptionStatus;
      petId?: string;
      page: number;
      limit: number;
    },
  ): Promise<PaginatedResult<AdoptionRequest>>;
  abstract findActiveByPetId(
    petId: string,
    excludeId?: string,
  ): Promise<AdoptionRequest[]>;
}
