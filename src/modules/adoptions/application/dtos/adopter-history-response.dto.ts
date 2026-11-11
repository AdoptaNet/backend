import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdopterHistorySummaryDto {
  @ApiProperty({ example: 3 })
  totalApplications: number;

  @ApiProperty({ example: 1 })
  approvedAdoptions: number;

  @ApiProperty({ example: 1 })
  activeApplications: number;

  @ApiProperty({ example: 1 })
  rejectedApplications: number;

  @ApiProperty({ example: 0 })
  cancelledApplications: number;

  @ApiProperty({ example: 1 })
  completedFollowUps: number;

  @ApiProperty({ example: 0 })
  inProgressFollowUps: number;

  @ApiProperty({ example: 1 })
  certificatesCount: number;

  @ApiProperty({ example: 0 })
  totalReturns: number;
}

export class AdopterHistoryPreviousPetDto {
  @ApiProperty({ example: 'uuid' })
  adoptionId: string;

  @ApiProperty({ example: 'uuid' })
  petId: string;

  @ApiProperty({ example: 'Bobby' })
  petName: string;

  @ApiProperty({ example: 'dog' })
  species: string;

  @ApiProperty({ example: 'Mestizo' })
  breed: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/...' })
  photoUrl: string | null;

  @ApiProperty({ example: 'Albergue Esperanza' })
  shelterName: string;

  @ApiPropertyOptional({ example: '2026-03-15T00:00:00.000Z' })
  adoptedAt: string | null;

  @ApiPropertyOptional({ example: 'completed' })
  followUpStatus: string | null;

  @ApiPropertyOptional({ example: 'CERT-2026-BF92' })
  certificateCode: string | null;
}

export class AdopterHistoryReturnDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  petId: string;

  @ApiProperty({ example: 'Toby' })
  petName: string;

  @ApiProperty({ example: 'severe_allergy' })
  reason: string;

  @ApiProperty({ example: 'Alergia severa sobrevenida' })
  reasonLabel: string;

  @ApiPropertyOptional({ example: 'Alergia médica severa diagnosticada...' })
  explanation: string | null;

  @ApiProperty({ example: 'returned' })
  status: string;

  @ApiProperty({ example: '2026-05-10T12:00:00.000Z' })
  createdAt: string;

  @ApiPropertyOptional({ example: 'Albergue Amigos' })
  shelterName: string | null;
}

export class AdopterHistoryResponseDto {
  @ApiProperty({ example: 'uuid' })
  adopterId: string;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  adopterName: string | null;

  @ApiProperty({
    enum: ['first_time', 'experienced', 'certified', 'with_returns'],
    example: 'certified',
  })
  trustLevel: 'first_time' | 'experienced' | 'certified' | 'with_returns';

  @ApiProperty({ example: 'Adoptante Certificado' })
  badgeLabel: string;

  @ApiProperty({
    example:
      'Ha completado exitosamente el protocolo de seguimiento y cuenta con constancia oficial.',
  })
  badgeDescription: string;

  @ApiProperty({ type: AdopterHistorySummaryDto })
  summary: AdopterHistorySummaryDto;

  @ApiProperty({ type: [AdopterHistoryPreviousPetDto] })
  previousAdoptions: AdopterHistoryPreviousPetDto[];

  @ApiProperty({ type: [AdopterHistoryReturnDto] })
  returns: AdopterHistoryReturnDto[];
}
