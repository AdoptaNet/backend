import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { AdoptionRequest } from '../../domain/entities/adoption-request.entity';
import {
  AdoptionRequestRepository,
  PaginatedResult,
} from '../../domain/repositories/adoption-request.repository';
import { AdoptionStatus } from '../../domain/value-objects/adoption-status.enum';

@Injectable()
export class AdoptionRequestTypeOrmRepository
  implements AdoptionRequestRepository
{
  constructor(
    @InjectRepository(AdoptionRequest)
    private readonly repo: Repository<AdoptionRequest>,
  ) {}

  async findById(id: string): Promise<AdoptionRequest | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        pet: {
          photos: true,
        },
        adopter: {
          adopterProfile: true,
        },
        shelter: {
          shelterProfile: true,
        },
      },
    });
  }

  async save(request: AdoptionRequest): Promise<AdoptionRequest> {
    return this.repo.save(request);
  }

  async countActiveByAdopterId(adopterId: string): Promise<number> {
    return this.repo.count({
      where: {
        adopterId,
        status: In([AdoptionStatus.PENDING, AdoptionStatus.UNDER_REVIEW]),
      },
    });
  }

  async findActiveByPetAndAdopter(
    petId: string,
    adopterId: string,
  ): Promise<AdoptionRequest | null> {
    return this.repo.findOne({
      where: {
        petId,
        adopterId,
        status: In([AdoptionStatus.PENDING, AdoptionStatus.UNDER_REVIEW]),
      },
    });
  }

  async findByAdopter(
    adopterId: string,
    options: { status?: AdoptionStatus; page: number; limit: number },
  ): Promise<PaginatedResult<AdoptionRequest>> {
    const page = options.page > 0 ? options.page : 1;
    const limit = options.limit > 0 ? Math.min(options.limit, 50) : 10;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('ar')
      .leftJoinAndSelect('ar.pet', 'pet')
      .leftJoinAndSelect('pet.photos', 'photos')
      .leftJoinAndSelect('ar.shelter', 'shelter')
      .leftJoinAndSelect('shelter.shelterProfile', 'shelterProfile')
      .where('ar.adopterId = :adopterId', { adopterId });

    if (options.status) {
      qb.andWhere('ar.status = :status', { status: options.status });
    }

    qb.orderBy('ar.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findByShelter(
    shelterId: string,
    options: {
      status?: AdoptionStatus;
      petId?: string;
      page: number;
      limit: number;
    },
  ): Promise<PaginatedResult<AdoptionRequest>> {
    const page = options.page > 0 ? options.page : 1;
    const limit = options.limit > 0 ? Math.min(options.limit, 50) : 10;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('ar')
      .leftJoinAndSelect('ar.pet', 'pet')
      .leftJoinAndSelect('pet.photos', 'photos')
      .leftJoinAndSelect('ar.adopter', 'adopter')
      .leftJoinAndSelect('adopter.adopterProfile', 'adopterProfile')
      .where('ar.shelterId = :shelterId', { shelterId });

    if (options.status) {
      qb.andWhere('ar.status = :status', { status: options.status });
    }

    if (options.petId) {
      qb.andWhere('ar.petId = :petId', { petId: options.petId });
    }

    qb.orderBy('ar.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findActiveByPetId(
    petId: string,
    excludeId?: string,
  ): Promise<AdoptionRequest[]> {
    const whereClause: Record<string, any> = {
      petId,
      status: In([AdoptionStatus.PENDING, AdoptionStatus.UNDER_REVIEW]),
    };

    if (excludeId) {
      whereClause.id = Not(excludeId);
    }

    return this.repo.find({
      where: whereClause,
      relations: {
        adopter: true,
        pet: true,
      },
    });
  }
}
