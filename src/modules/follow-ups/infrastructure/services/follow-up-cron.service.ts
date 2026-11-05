import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RunFollowUpCronUseCase } from '../../application/use-cases/run-follow-up-cron.use-case';

@Injectable()
export class FollowUpCronService {
  private readonly logger = new Logger(FollowUpCronService.name);

  constructor(private readonly runFollowUpCronUseCase: RunFollowUpCronUseCase) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyFollowUpCheck(): Promise<void> {
    this.logger.log('Ejecutando escaneo diario de seguimiento post-adopción (Cron Job)...');
    try {
      const result = await this.runFollowUpCronUseCase.execute();
      this.logger.log(
        `Escaneo diario de seguimiento finalizado: ${result.scanned} hitos escaneados, ${result.remindersSent} recordatorios enviados, ${result.overdueMarked} marcados con retraso.`,
      );
    } catch (error: any) {
      this.logger.error(`Error en el cron job diario de seguimiento: ${error.message}`);
    }
  }
}
