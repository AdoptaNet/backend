import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUpRecord } from '../../domain/entities/follow-up-record.entity';
import { FollowUpMilestone } from '../../domain/entities/follow-up-milestone.entity';
import { MilestoneStatus } from '../../domain/value-objects/milestone-status.enum';
import { MilestoneType } from '../../domain/value-objects/milestone-type.enum';
import { FollowUpProcessStatus } from '../../domain/value-objects/follow-up-process-status.enum';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { ReviewMilestoneDto } from '../dtos/review-milestone.dto';
import { MilestoneReviewedEvent } from '../../domain/events/milestone-reviewed.event';
import { FollowUpCompletedEvent } from '../../domain/events/follow-up-completed.event';

@Injectable()
export class ReviewMilestoneUseCase {
  constructor(
    @InjectRepository(FollowUpRecord)
    private readonly followUpRecordRepository: Repository<FollowUpRecord>,
    @InjectRepository(FollowUpMilestone)
    private readonly milestoneRepository: Repository<FollowUpMilestone>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    followUpId: string,
    milestoneId: string,
    dto: ReviewMilestoneDto,
    reviewerId: string,
    role: UserRole,
  ): Promise<{ milestone: FollowUpMilestone; record: FollowUpRecord }> {
    const record = await this.followUpRecordRepository.findOne({
      where: { id: followUpId },
      relations: {
        milestones: true,
        pet: true,
        shelter: { shelterProfile: true },
        adopter: { adopterProfile: true },
      },
    });

    if (!record) {
      throw new NotFoundException(`No se encontró el expediente #${followUpId}`);
    }

    if (role !== UserRole.ADMIN && record.shelterId !== reviewerId) {
      throw new ForbiddenException('Solo el albergue responsable o un administrador pueden dictaminar este hito');
    }

    const milestone = record.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new NotFoundException(`No se encontró el hito #${milestoneId} en este expediente`);
    }

    if (milestone.status === MilestoneStatus.COMPLETED) {
      throw new BadRequestException('Este hito ya fue dictaminado y aprobado previamente');
    }

    const isApproved = dto.decision === 'approved';
    milestone.reviewedAt = new Date();
    milestone.reviewerId = reviewerId;
    milestone.reviewNotes = dto.reviewNotes?.trim() || null;
    milestone.status = isApproved ? MilestoneStatus.COMPLETED : MilestoneStatus.ACTION_REQUIRED;

    const savedMilestone = await this.milestoneRepository.save(milestone);

    const adopterName =
      (record.adopter as any)?.adopterProfile?.fullName ||
      record.adopter?.email?.split('@')[0] ||
      'Adoptante';

    const shelterName =
      (record.shelter as any)?.shelterProfile?.shelterName ||
      record.shelter?.email?.split('@')[0] ||
      'Albergue';

    // Si fue aprobado y es el hito final de 180 días, completar proceso formal
    if (isApproved && milestone.milestoneType === MilestoneType.M180_DAYS) {
      record.status = FollowUpProcessStatus.COMPLETED;
      record.completionDate = new Date();
      record.certificateCode = `CERT-ADOPTA-${Date.now().toString(36).toUpperCase()}`;
      await this.followUpRecordRepository.save(record);

      this.eventEmitter.emit(
        FollowUpCompletedEvent.EVENT_NAME,
        new FollowUpCompletedEvent(
          record.id,
          record.certificateCode,
          record.pet?.name || 'Mascota',
          record.adopterId,
          record.adopter?.email || '',
          adopterName,
          shelterName,
        ),
      );
    }

    // Notificar dictamen al adoptante
    this.eventEmitter.emit(
      MilestoneReviewedEvent.EVENT_NAME,
      new MilestoneReviewedEvent(
        record.id,
        milestone.id,
        milestone.milestoneType,
        isApproved,
        milestone.reviewNotes,
        record.pet?.name || 'Mascota',
        record.adopterId,
        record.adopter?.email || '',
        adopterName,
        shelterName,
      ),
    );

    return { milestone: savedMilestone, record };
  }
}
