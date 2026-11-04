import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { FollowUpMilestone } from '../../domain/entities/follow-up-milestone.entity';
import { MilestoneStatus } from '../../domain/value-objects/milestone-status.enum';
import { FollowUpProcessStatus } from '../../domain/value-objects/follow-up-process-status.enum';
import { EmailService } from '../../../notifications/application/interfaces/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RunFollowUpCronUseCase {
  private readonly logger = new Logger(RunFollowUpCronUseCase.name);

  constructor(
    @InjectRepository(FollowUpMilestone)
    private readonly milestoneRepository: Repository<FollowUpMilestone>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(): Promise<{
    scanned: number;
    remindersSent: number;
    overdueMarked: number;
  }> {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    let remindersSent = 0;
    let overdueMarked = 0;

    // 1. Obtener hitos activos pertenecientes a expedientes en progreso
    const milestones = await this.milestoneRepository
      .createQueryBuilder('milestone')
      .innerJoinAndSelect('milestone.record', 'record')
      .innerJoinAndSelect('record.pet', 'pet')
      .innerJoinAndSelect('record.adopter', 'adopter')
      .leftJoinAndSelect('adopter.adopterProfile', 'adopterProfile')
      .innerJoinAndSelect('record.shelter', 'shelter')
      .leftJoinAndSelect('shelter.shelterProfile', 'shelterProfile')
      .where('record.status = :status', { status: FollowUpProcessStatus.IN_PROGRESS })
      .andWhere('milestone.status IN (:...milestoneStatuses)', {
        milestoneStatuses: [
          MilestoneStatus.PENDING,
          MilestoneStatus.ACTION_REQUIRED,
          MilestoneStatus.OVERDUE,
        ],
      })
      .getMany();

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    for (const m of milestones) {
      const adopterName =
        (m.record.adopter as any)?.adopterProfile?.fullName ||
        m.record.adopter?.email?.split('@')[0] ||
        'Adoptante';
      const petName = m.record.pet?.name || 'Mascota';
      const actionUrl = `${frontendUrl}/follow-up`;

      // A. Comprobar atraso (fecha límite vencida sin evidencias)
      if (m.dueDate < now) {
        let wasChanged = false;
        if (m.status !== MilestoneStatus.OVERDUE) {
          m.status = MilestoneStatus.OVERDUE;
          wasChanged = true;
          overdueMarked++;
        }

        if (!m.overdueNotifiedAt) {
          m.overdueNotifiedAt = now;
          wasChanged = true;

          this.logger.warn(
            `Hito de ${m.daysTarget}d para ${petName} marcado como OVERDUE (venció el ${m.dueDate.toISOString()}).`,
          );

          // Despachar correo de advertencia
          try {
            if (m.record.adopter?.email) {
              await (this.emailService as any).sendFollowUpOverdueEmail?.(
                m.record.adopter.email,
                {
                  adopterName,
                  petName,
                  milestoneDays: m.daysTarget,
                  dueDate: m.dueDate.toLocaleDateString(),
                  actionUrl,
                },
              );
            }
          } catch (err: any) {
            this.logger.error(`Error enviando email de overdue a ${m.record.adopter?.email}: ${err.message}`);
          }
        }

        if (wasChanged) {
          await this.milestoneRepository.save(m);
        }
        continue;
      }

      // B. Comprobar recordatorio preventivo (dentro de los 7 días previos al vencimiento)
      if (m.dueDate <= sevenDaysFromNow && m.dueDate >= now && !m.reminderSentAt) {
        m.reminderSentAt = now;
        await this.milestoneRepository.save(m);
        remindersSent++;

        this.logger.log(
          `Enviando recordatorio preventivo para hito de ${m.daysTarget}d de ${petName} a ${m.record.adopter?.email}.`,
        );

        try {
          if (m.record.adopter?.email) {
            await (this.emailService as any).sendFollowUpReminderEmail?.(
              m.record.adopter.email,
              {
                adopterName,
                petName,
                milestoneDays: m.daysTarget,
                dueDate: m.dueDate.toLocaleDateString(),
                actionUrl,
              },
            );
          }
        } catch (err: any) {
          this.logger.error(`Error enviando email de recordatorio a ${m.record.adopter?.email}: ${err.message}`);
        }
      }
    }

    return {
      scanned: milestones.length,
      remindersSent,
      overdueMarked,
    };
  }
}
