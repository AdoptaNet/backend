import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class SimulateMilestoneTimeDto {
  @ApiProperty({
    example: 35,
    description: 'Días a desplazar la fecha de vencimiento hacia el pasado (ej. 35 para simular atraso / overdue, o 24 para recordatorio de 7 días)',
  })
  @IsInt()
  @IsNotEmpty()
  daysOffset: number;
}
