import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUpMilestone } from '../../domain/entities/follow-up-milestone.entity';
import { MilestoneStatus } from '../../domain/value-objects/milestone-status.enum';
import { SimulateMilestoneTimeDto } from '../dtos/simulate-milestone-time.dto';
import { RunFollowUpCronUseCase } from './run-follow-up-cron.use-case';

@Injectable()
export class SimulateMilestoneTimeUseCase {
  constructor(
    @InjectRepository(FollowUpMilestone)
    private readonly milestoneRepository: Repository<FollowUpMilestone>,
    private readonly runFollowUpCronUseCase: RunFollowUpCronUseCase,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    milestoneId: string,
    dto: SimulateMilestoneTimeDto,
  ): Promise<{ message: string; milestone: FollowUpMilestone; cronResult: any }> {
    const isDemoEnabled =
      this.configService.get<string>('FOLLOW_UP_DEMO_MODE') === 'true' ||
      this.configService.get<string>('NODE_ENV') !== 'production';

    if (!isDemoEnabled) {
      throw new ForbiddenException(
        'El modo de simulación rápida (demo) está deshabilitado en este entorno de producción',
      );
    }

    const milestone = await this.milestoneRepository.findOne({
      where: { id: milestoneId },
      relations: {
        record: {
          pet: true,
          adopter: true,
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException(`No se encontró el hito #${milestoneId}`);
    }

    // Desplazar fecha de vencimiento hacia el pasado o futuro
    const newDueDate = new Date(Date.now() - dto.daysOffset * 24 * 60 * 60 * 1000);
    milestone.dueDate = newDueDate;
    // Resetear banderas de notificación previa para permitir reenviar en la simulación
    milestone.reminderSentAt = null;
    milestone.overdueNotifiedAt = null;

    if (newDueDate < new Date()) {
      milestone.status = MilestoneStatus.OVERDUE;
    } else {
      milestone.status = MilestoneStatus.PENDING;
    }

    await this.milestoneRepository.save(milestone);

    // Disparar inmediatamente el escaneo del cron para evaluar el nuevo estado y despachar correo
    const cronResult = await this.runFollowUpCronUseCase.execute();

    // Recargar el hito actualizado (por si pasó a overdue)
    const reloadedMilestone = (await this.milestoneRepository.findOne({
      where: { id: milestoneId },
    })) as FollowUpMilestone;

    const statusText =
      reloadedMilestone.status === MilestoneStatus.OVERDUE
        ? 'PLAZO VENCIDO'
        : 'EN PLAZO';

    return {
      message: `Simulación aplicada: el hito ahora figura como ${statusText} (vencimiento: ${newDueDate.toLocaleDateString()}). Se ejecutó la verificación y el despacho de notificaciones.`,
      milestone: reloadedMilestone,
      cronResult,
    };
  }
}
