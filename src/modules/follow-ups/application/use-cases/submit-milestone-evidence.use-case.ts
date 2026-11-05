import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUpRecord } from '../../domain/entities/follow-up-record.entity';
import { FollowUpMilestone } from '../../domain/entities/follow-up-milestone.entity';
import { FollowUpEvidence } from '../../domain/entities/follow-up-evidence.entity';
import { MilestoneStatus } from '../../domain/value-objects/milestone-status.enum';
import { FollowUpProcessStatus } from '../../domain/value-objects/follow-up-process-status.enum';
import { SubmitMilestoneDto } from '../dtos/submit-milestone.dto';
import { MilestoneSubmittedEvent } from '../../domain/events/milestone-submitted.event';

@Injectable()
export class SubmitMilestoneEvidenceUseCase {
  constructor(
    @InjectRepository(FollowUpRecord)
    private readonly followUpRecordRepository: Repository<FollowUpRecord>,
    @InjectRepository(FollowUpMilestone)
    private readonly milestoneRepository: Repository<FollowUpMilestone>,
    @InjectRepository(FollowUpEvidence)
    private readonly evidenceRepository: Repository<FollowUpEvidence>,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    followUpId: string,
    milestoneId: string,
    dto: SubmitMilestoneDto,
    userId: string,
  ): Promise<FollowUpMilestone> {
    const record = await this.followUpRecordRepository.findOne({
      where: { id: followUpId },
      relations: {
        milestones: true,
        pet: true,
        shelter: true,
        adopter: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`No se encontró el expediente #${followUpId}`);
    }

    if (record.adopterId !== userId) {
      throw new ForbiddenException('Solo el adoptante asignado puede cargar evidencias a este expediente');
    }

    if (record.status === FollowUpProcessStatus.RETURNED) {
      throw new BadRequestException('El proceso de adopción fue revocado por retorno; no admite nuevas evidencias');
    }

    const milestone = record.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new NotFoundException(`No se encontró el hito #${milestoneId} en este expediente`);
    }

    if (milestone.status === MilestoneStatus.COMPLETED) {
      throw new BadRequestException('Este hito ya fue revisado y aprobado exitosamente');
    }

    // Reglas de correlatividad y ventana estricta en producción (salvo modo demo)
    const isDemo =
      this.configService.get<string>('FOLLOW_UP_DEMO_MODE') === 'true';

    if (!isDemo) {
      // 1. Regla de correlatividad secuencial
      const sortedMilestones = [...record.milestones].sort((a, b) => a.daysTarget - b.daysTarget);
      const currentIndex = sortedMilestones.findIndex((m) => m.id === milestone.id);
      if (currentIndex > 0) {
        const previousMilestone = sortedMilestones[currentIndex - 1];
        if (previousMilestone.status !== MilestoneStatus.COMPLETED) {
          throw new BadRequestException(
            `Debes completar y esperar la aprobación del hito de ${previousMilestone.daysTarget} días antes de reportar este hito`,
          );
        }
      }

      // 2. Regla de ventana de apertura estricta (habilitado 7 días antes del vencimiento)
      if (milestone.dueDate) {
        const openDate = new Date(new Date(milestone.dueDate).getTime() - 7 * 24 * 60 * 60 * 1000);
        if (new Date() < openDate) {
          const formattedDate = openDate.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
          throw new BadRequestException(
            `Este hito estará disponible para envío a partir del ${formattedDate} (7 días antes del vencimiento)`,
          );
        }
      }
    }

    // Guardar evidencias
    if (dto.evidences && dto.evidences.length > 0) {
      const newEvidences = dto.evidences.map((e) =>
        this.evidenceRepository.create({
          milestoneId: milestone.id,
          evidenceType: e.evidenceType,
          mediaUrl: e.mediaUrl,
          caption: e.caption || null,
        }),
      );
      await this.evidenceRepository.save(newEvidences);
    }

    // Actualizar estado del hito
    milestone.adaptationNotes = dto.adaptationNotes;
    milestone.healthStatusReported = dto.healthStatusReported || null;
    milestone.status = MilestoneStatus.SUBMITTED;
    milestone.submittedAt = new Date();

    const savedMilestone = await this.milestoneRepository.save(milestone);

    // Notificar al albergue
    const adopterName =
      (record.adopter as any)?.adopterProfile?.fullName ||
      record.adopter?.email?.split('@')[0] ||
      'Adoptante';

    this.eventEmitter.emit(
      MilestoneSubmittedEvent.EVENT_NAME,
      new MilestoneSubmittedEvent(
        record.id,
        milestone.id,
        milestone.milestoneType,
        record.pet?.name || 'Mascota',
        adopterName,
        record.shelterId,
        record.shelter?.email || '',
      ),
    );

    return savedMilestone;
  }
}
