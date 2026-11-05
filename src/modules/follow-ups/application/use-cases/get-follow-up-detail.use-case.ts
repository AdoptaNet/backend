import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUpRecord } from '../../domain/entities/follow-up-record.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import type { FollowUpRecordResponseDto } from '../dtos/follow-up-response.dto';
import { GetFollowUpsUseCase } from './get-follow-ups.use-case';

@Injectable()
export class GetFollowUpDetailUseCase {
  constructor(
    @InjectRepository(FollowUpRecord)
    private readonly followUpRecordRepository: Repository<FollowUpRecord>,
    private readonly getFollowUpsUseCase: GetFollowUpsUseCase,
  ) {}

  async execute(
    followUpId: string,
    userId: string,
    role: UserRole,
  ): Promise<FollowUpRecordResponseDto> {
    const record = await this.followUpRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.pet', 'pet')
      .leftJoinAndSelect('pet.photos', 'photos')
      .leftJoinAndSelect('record.adopter', 'adopter')
      .leftJoinAndSelect('adopter.adopterProfile', 'adopterProfile')
      .leftJoinAndSelect('record.shelter', 'shelter')
      .leftJoinAndSelect('shelter.shelterProfile', 'shelterProfile')
      .leftJoinAndSelect('record.milestones', 'milestones')
      .leftJoinAndSelect('milestones.evidences', 'evidences')
      .leftJoinAndSelect('record.returns', 'returns')
      .where('record.id = :followUpId', { followUpId })
      .orderBy('milestones.daysTarget', 'ASC')
      .addOrderBy('evidences.createdAt', 'ASC')
      .addOrderBy('returns.requestedAt', 'DESC')
      .getOne();

    if (!record) {
      throw new NotFoundException(`No se encontró el expediente de seguimiento #${followUpId}`);
    }

    if (
      role !== UserRole.ADMIN &&
      record.adopterId !== userId &&
      record.shelterId !== userId
    ) {
      throw new ForbiddenException('No tienes autorización para acceder a este expediente');
    }

    // Reuse mapper
    return (this.getFollowUpsUseCase as any).mapToDto(record);
  }
}
