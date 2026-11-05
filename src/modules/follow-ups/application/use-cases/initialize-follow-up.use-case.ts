import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUpRecord } from '../../domain/entities/follow-up-record.entity';
import { FollowUpMilestone } from '../../domain/entities/follow-up-milestone.entity';
import { FollowUpProcessStatus } from '../../domain/value-objects/follow-up-process-status.enum';
import { MilestoneType } from '../../domain/value-objects/milestone-type.enum';
import { MilestoneStatus } from '../../domain/value-objects/milestone-status.enum';
import { FollowUpInitializedEvent } from '../../domain/events/follow-up-initialized.event';
import { AdoptionRequest } from '../../../adoptions/domain/entities/adoption-request.entity';

@Injectable()
export class InitializeFollowUpUseCase {
  private readonly logger = new Logger(InitializeFollowUpUseCase.name);

  constructor(
    @InjectRepository(FollowUpRecord)
    private readonly followUpRecordRepository: Repository<FollowUpRecord>,
    @InjectRepository(FollowUpMilestone)
    private readonly milestoneRepository: Repository<FollowUpMilestone>,
    @InjectRepository(AdoptionRequest)
    private readonly adoptionRepository: Repository<AdoptionRequest>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(adoptionId: string): Promise<FollowUpRecord | null> {
    const existing = await this.followUpRecordRepository.findOne({
      where: { adoptionId },
      relations: { milestones: true },
    });

    if (existing) {
      this.logger.log(`El expediente de seguimiento para la adopción #${adoptionId} ya existe.`);
      return existing;
    }

    const adoption = await this.adoptionRepository.findOne({
      where: { id: adoptionId },
      relations: { pet: true, adopter: true, shelter: true },
    });

    if (!adoption) {
      this.logger.warn(`No se encontró la solicitud de adopción #${adoptionId} para inicializar seguimiento.`);
      return null;
    }

    const startDate = new Date();
    const record = this.followUpRecordRepository.create({
      adoptionId: adoption.id,
      petId: adoption.petId,
      adopterId: adoption.adopterId,
      shelterId: adoption.shelterId,
      status: FollowUpProcessStatus.IN_PROGRESS,
      startDate,
    });

    const savedRecord = await this.followUpRecordRepository.save(record);

    const m30DueDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const m90DueDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);
    const m180DueDate = new Date(startDate.getTime() + 180 * 24 * 60 * 60 * 1000);

    const milestones = [
      this.milestoneRepository.create({
        recordId: savedRecord.id,
        milestoneType: MilestoneType.M30_DAYS,
        daysTarget: 30,
        dueDate: m30DueDate,
        status: MilestoneStatus.PENDING,
      }),
      this.milestoneRepository.create({
        recordId: savedRecord.id,
        milestoneType: MilestoneType.M90_DAYS,
        daysTarget: 90,
        dueDate: m90DueDate,
        status: MilestoneStatus.PENDING,
      }),
      this.milestoneRepository.create({
        recordId: savedRecord.id,
        milestoneType: MilestoneType.M180_DAYS,
        daysTarget: 180,
        dueDate: m180DueDate,
        status: MilestoneStatus.PENDING,
      }),
    ];

    savedRecord.milestones = await this.milestoneRepository.save(milestones);

    this.logger.log(
      `Expediente de seguimiento #${savedRecord.id} inicializado con 3 hitos temporales para ${adoption.pet?.name || 'Mascota'}.`,
    );

    this.eventEmitter.emit(
      FollowUpInitializedEvent.EVENT_NAME,
      new FollowUpInitializedEvent(
        savedRecord.id,
        adoption.id,
        adoption.petId,
        adoption.pet?.name || 'Mascota',
        adoption.adopterId,
        adoption.adopter?.email || '',
        adoption.shelterId,
        adoption.shelter?.email || '',
      ),
    );

    return savedRecord;
  }
}
