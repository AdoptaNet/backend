import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUpRecord } from '../../domain/entities/follow-up-record.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import type {
  FollowUpRecordResponseDto,
  MilestoneResponseDto,
  EvidenceResponseDto,
  PetReturnResponseDto,
} from '../dtos/follow-up-response.dto';

@Injectable()
export class GetFollowUpsUseCase {
  constructor(
    @InjectRepository(FollowUpRecord)
    private readonly followUpRecordRepository: Repository<FollowUpRecord>,
  ) {}

  async execute(userId: string, role: UserRole): Promise<FollowUpRecordResponseDto[]> {
    const qb = this.followUpRecordRepository
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
      .orderBy('record.createdAt', 'DESC')
      .addOrderBy('milestones.daysTarget', 'ASC')
      .addOrderBy('evidences.createdAt', 'ASC')
      .addOrderBy('returns.requestedAt', 'DESC');

    if (role === UserRole.ADOPTER) {
      qb.where('record.adopterId = :userId', { userId });
    } else if (role === UserRole.SHELTER) {
      qb.where('record.shelterId = :userId', { userId });
    }
    // Admin sees all

    const records = await qb.getMany();
    return records.map((r) => this.mapToDto(r));
  }

  private mapToDto(record: FollowUpRecord): FollowUpRecordResponseDto {
    const primaryPhoto =
      record.pet?.photos?.find((p) => p.isPrimary)?.url ||
      record.pet?.photos?.[0]?.url ||
      null;

    const milestones: MilestoneResponseDto[] = (record.milestones || []).map((m) => ({
      id: m.id,
      milestoneType: m.milestoneType,
      daysTarget: m.daysTarget,
      dueDate: m.dueDate ? m.dueDate.toISOString() : '',
      status: m.status,
      reminderSentAt: m.reminderSentAt ? m.reminderSentAt.toISOString() : null,
      overdueNotifiedAt: m.overdueNotifiedAt ? m.overdueNotifiedAt.toISOString() : null,
      submittedAt: m.submittedAt ? m.submittedAt.toISOString() : null,
      reviewedAt: m.reviewedAt ? m.reviewedAt.toISOString() : null,
      reviewerId: m.reviewerId || null,
      reviewNotes: m.reviewNotes || null,
      healthStatusReported: m.healthStatusReported || null,
      adaptationNotes: m.adaptationNotes || null,
      evidences: (m.evidences || []).map(
        (e): EvidenceResponseDto => ({
          id: e.id,
          evidenceType: e.evidenceType,
          mediaUrl: e.mediaUrl,
          photoUrl: e.mediaUrl,
          caption: e.caption || null,
          createdAt: e.createdAt ? e.createdAt.toISOString() : '',
        }),
      ),
    }));

    const returnsList: PetReturnResponseDto[] = (record.returns || []).map((ret) => ({
      id: ret.id,
      followUpRecordId: ret.followUpRecordId,
      petId: ret.petId,
      adopterId: ret.adopterId,
      shelterId: ret.shelterId,
      reason: ret.reason,
      explanation: ret.explanation,
      supportingDocumentUrl: ret.supportingDocumentUrl || null,
      status: ret.status,
      requestedAt: ret.requestedAt ? ret.requestedAt.toISOString() : '',
      coordinationNotes: ret.coordinationNotes || null,
      scheduledReturnDate: ret.scheduledReturnDate ? ret.scheduledReturnDate.toISOString() : null,
      completedAt: ret.completedAt ? ret.completedAt.toISOString() : null,
      shelterObservations: ret.shelterObservations || null,
    }));

    const activeReturn = returnsList.find(
      (r) => r.status === 'requested' || r.status === 'under_coordination',
    ) || returnsList[0] || null;

    return {
      id: record.id,
      adoptionId: record.adoptionId,
      petId: record.petId,
      pet: {
        id: record.pet?.id || record.petId,
        name: record.pet?.name || 'Mascota',
        species: record.pet?.species || 'desconocido',
        breed: record.pet?.breed || null,
        primaryPhotoUrl: primaryPhoto,
      },
      adopterId: record.adopterId,
      adopter: {
        id: record.adopter?.id || record.adopterId,
        fullName:
          record.adopter?.fullName ||
          record.adopter?.email?.split('@')[0] ||
          'Adoptante',
        email: record.adopter?.email || '',
        phone: null,
      },
      shelterId: record.shelterId,
      shelter: {
        id: record.shelter?.id || record.shelterId,
        name:
          record.shelter?.shelterProfile?.organizationName ||
          record.shelter?.fullName ||
          record.shelter?.email?.split('@')[0] ||
          'Albergue',
        email: record.shelter?.email || '',
        phone: record.shelter?.shelterProfile?.phoneNumber || null,
      },
      status: record.status,
      startDate: record.startDate ? record.startDate.toISOString() : '',
      completionDate: record.completionDate ? record.completionDate.toISOString() : null,
      certificateCode: record.certificateCode || null,
      notes: record.notes || null,
      milestones,
      activeReturn,
      returns: returnsList,
    };
  }
}
